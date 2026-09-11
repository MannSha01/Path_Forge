// ===================================================
// PATH FORGE - ADMIN CONTENT TREE SIDEBAR
// Hierarchy manager for Topics, Modules, Ordering & Delete Protection
// ===================================================

import { $, on, refreshLucide, escapeHTML } from "../../utils/dom.js";
import { databaseService } from "../../services/database/databaseService.js";

export class ContentTree {
  constructor({ containerId, onSelectModule, onSelectTopic, onStructureChange }) {
    this.container = typeof containerId === "string" ? $(containerId) : containerId;
    this.onSelectModule = onSelectModule;
    this.onSelectTopic = onSelectTopic;
    this.onStructureChange = onStructureChange;

    this.topics = [];
    this.modulesByTopic = {};
    this.activeTopicId = null;
    this.activeModuleId = null;
    this.collapsedTopics = new Set();
  }

  async loadData() {
    this.topics = await databaseService.getAdminTopics();
    const allModules = await databaseService.getAdminModules();

    this.modulesByTopic = {};
    this.topics.forEach((t) => {
      this.modulesByTopic[t.id] = [];
    });

    allModules.forEach((m) => {
      if (!this.modulesByTopic[m.topicId]) {
        this.modulesByTopic[m.topicId] = [];
      }
      this.modulesByTopic[m.topicId].push(m);
    });

    // Sort modules by order
    Object.keys(this.modulesByTopic).forEach((tId) => {
      this.modulesByTopic[tId].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });

    // Auto-select first module if none selected
    if (!this.activeModuleId && this.topics.length > 0) {
      const firstTopic = this.topics[0];
      const mods = this.modulesByTopic[firstTopic.id] || [];
      if (mods.length > 0) {
        this.activeTopicId = firstTopic.id;
        this.activeModuleId = mods[0].id;
        if (typeof this.onSelectModule === "function") {
          this.onSelectModule(mods[0], firstTopic);
        }
      } else {
        this.activeTopicId = firstTopic.id;
        if (typeof this.onSelectTopic === "function") {
          this.onSelectTopic(firstTopic);
        }
      }
    }

    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="pf-content-tree space-y-4 text-left">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <i data-lucide="layers" class="w-4 h-4 text-indigo-400"></i>
            <span class="text-xs font-black uppercase tracking-wider text-white">Curriculum Structure</span>
          </div>
          <button 
            id="btn-add-topic" 
            class="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/40 text-[11px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer active:scale-95"
            title="Create a new topic"
          >
            <i data-lucide="plus" class="w-3 h-3"></i>
            <span>Topic</span>
          </button>
        </div>

        <!-- Topics & Modules Tree List -->
        <div id="tree-items-list" class="space-y-3 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
          ${
            this.topics.length === 0
              ? `
            <div class="p-6 text-center border border-dashed border-slate-800 rounded-2xl space-y-2">
              <i data-lucide="book-plus" class="w-8 h-8 text-slate-600 mx-auto"></i>
              <p class="text-xs text-slate-400 font-medium">No topics created yet.</p>
              <button id="btn-empty-add-topic" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer">
                + Add First Topic
              </button>
            </div>
          `
              : this.topics.map((t, tIdx) => this._renderTopicNode(t, tIdx)).join("\n")
          }
        </div>
      </div>
    `;

    refreshLucide();
    this._attachListeners();
  }

  _renderTopicNode(topic, index) {
    const isCollapsed = this.collapsedTopics.has(topic.id);
    const modules = this.modulesByTopic[topic.id] || [];
    const isTopicActive = this.activeTopicId === topic.id && !this.activeModuleId;
    const isPublished = topic.status === "published";

    return `
      <div class="pf-tree-topic-group rounded-2xl bg-slate-900/40 border ${isTopicActive ? "border-indigo-500 shadow-md shadow-indigo-500/10" : "border-slate-800/80"} overflow-hidden transition" data-topic-id="${topic.id}">
        <!-- Topic Header Row -->
        <div class="p-2.5 bg-slate-900/80 flex items-center justify-between gap-2 hover:bg-slate-800/60 transition group cursor-pointer" data-action="toggle-topic" data-topic-id="${topic.id}">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <button class="p-1 text-slate-400 hover:text-white transition cursor-pointer" data-action="toggle-collapse" data-topic-id="${topic.id}">
              <i data-lucide="${isCollapsed ? "chevron-right" : "chevron-down"}" class="w-3.5 h-3.5"></i>
            </button>
            <div class="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <i data-lucide="${topic.icon || "folder"}" class="w-3.5 h-3.5"></i>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition">
                ${escapeHTML(topic.title)}
              </div>
              <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <span>${modules.length} module${modules.length === 1 ? "" : "s"}</span>
                <span>•</span>
                <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${isPublished ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"}">
                  ${topic.status || "draft"}
                </span>
              </div>
            </div>
          </div>

          <!-- Topic Action Toolbar -->
          <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
            <button 
              class="p-1 rounded text-indigo-400 hover:text-white hover:bg-indigo-600/30 transition cursor-pointer" 
              data-action="add-module" 
              data-topic-id="${topic.id}"
              title="Add module to topic"
            >
              <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
            </button>
            <button 
              class="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/50 transition cursor-pointer" 
              data-action="edit-topic" 
              data-topic-id="${topic.id}"
              title="Edit topic settings"
            >
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>
            <button 
              class="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer" 
              data-action="delete-topic" 
              data-topic-id="${topic.id}"
              title="Delete topic"
            >
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <!-- Nested Modules Subtree -->
        ${
          !isCollapsed
            ? `
          <div class="p-1.5 space-y-1 bg-slate-950/40 border-t border-slate-800/60 pl-6 relative">
            <div class="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-800"></div>
            ${
              modules.length === 0
                ? `
              <div class="p-2.5 text-center text-[11px] text-slate-500 font-medium">
                No modules yet. Click <span class="text-indigo-400 font-bold">+</span> to add one.
              </div>
            `
                : modules.map((m, mIdx) => this._renderModuleNode(m, topic, mIdx)).join("\n")
            }
          </div>
        `
            : ""
        }
      </div>
    `;
  }

  _renderModuleNode(module, topic, index) {
    const isModuleActive = this.activeModuleId === module.id;
    const isPublished = module.status === "published";

    return `
      <div 
        class="pf-tree-module-item p-2 rounded-xl flex items-center justify-between gap-2 text-xs font-semibold cursor-pointer transition relative group ${
          isModuleActive
            ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 shadow-sm"
            : "hover:bg-slate-800/50 text-slate-300 hover:text-white border border-transparent"
        }"
        data-action="select-module"
        data-module-id="${module.id}"
        data-topic-id="${topic.id}"
      >
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <i data-lucide="${isPublished ? "file-text" : "file-edit"}" class="w-3.5 h-3.5 ${isPublished ? "text-cyan-400" : "text-amber-400"} shrink-0"></i>
          <span class="truncate">${escapeHTML(module.title)}</span>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <span class="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
            isPublished
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }">
            ${module.status || "draft"}
          </span>

          <!-- Context Actions on hover -->
          <div class="hidden group-hover:flex items-center gap-0.5">
            <button 
              class="p-0.5 rounded text-slate-400 hover:text-white transition cursor-pointer" 
              data-action="duplicate-module" 
              data-module-id="${module.id}" 
              title="Duplicate module"
            >
              <i data-lucide="copy" class="w-3 h-3"></i>
            </button>
            <button 
              class="p-0.5 rounded text-slate-400 hover:text-rose-400 transition cursor-pointer" 
              data-action="delete-module" 
              data-module-id="${module.id}" 
              title="Delete module"
            >
              <i data-lucide="trash" class="w-3 h-3"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _attachListeners() {
    // Add Topic Button
    const addTopicBtn = this.container.querySelector("#btn-add-topic");
    const emptyAddBtn = this.container.querySelector("#btn-empty-add-topic");

    if (addTopicBtn) on(addTopicBtn, "click", () => this.openTopicModal());
    if (emptyAddBtn) on(emptyAddBtn, "click", () => this.openTopicModal());

    // Tree item clicks
    on(this.container, "click", async (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;

      e.stopPropagation();
      const action = btn.getAttribute("data-action");
      const topicId = btn.getAttribute("data-topic-id");
      const moduleId = btn.getAttribute("data-module-id");

      switch (action) {
        case "toggle-collapse":
          if (this.collapsedTopics.has(topicId)) {
            this.collapsedTopics.delete(topicId);
          } else {
            this.collapsedTopics.add(topicId);
          }
          this.render();
          break;

        case "select-module":
          this.activeTopicId = topicId;
          this.activeModuleId = moduleId;
          const topic = this.topics.find((t) => t.id === topicId);
          const mod = (this.modulesByTopic[topicId] || []).find((m) => m.id === moduleId);
          if (mod && topic && typeof this.onSelectModule === "function") {
            this.onSelectModule(mod, topic);
          }
          this.render();
          break;

        case "add-module":
          this.openModuleModal(topicId);
          break;

        case "edit-topic":
          const editT = this.topics.find((t) => t.id === topicId);
          if (editT) this.openTopicModal(editT);
          break;

        case "duplicate-module":
          const dupMod = await databaseService.duplicateModule(moduleId);
          await this.loadData();
          if (dupMod && typeof this.onStructureChange === "function") {
            this.onStructureChange();
          }
          break;

        case "delete-topic":
          this.confirmDeleteTopic(topicId);
          break;

        case "delete-module":
          this.confirmDeleteModule(moduleId);
          break;
      }
    });
  }

  // =================================================
  // TOPIC MODAL
  // =================================================

  openTopicModal(existingTopic = null) {
    const isEdit = Boolean(existingTopic);
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4";
    modal.innerHTML = `
      <div class="glass-card rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative border border-slate-800 text-left">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-black text-white">
            ${isEdit ? "Edit Topic" : "Create New Topic"}
          </h3>
          <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form id="topic-form" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Topic Title *</label>
            <input 
              type="text" 
              id="topic-title" 
              required
              value="${escapeHTML(existingTopic?.title || "")}" 
              placeholder="e.g. Digital Logic & Circuit Design" 
              class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Short Description</label>
            <textarea 
              id="topic-desc" 
              rows="3" 
              placeholder="e.g. Learn Boolean algebra, logic gates, and circuit synthesis." 
              class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
            >${escapeHTML(existingTopic?.description || "")}</textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Category</label>
              <input 
                type="text" 
                id="topic-category" 
                value="${escapeHTML(existingTopic?.category || "Tech & Engineering")}" 
                placeholder="Tech, AI, etc." 
                class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Status</label>
              <select id="topic-status" class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none">
                <option value="draft" ${existingTopic?.status === "draft" ? "selected" : ""}>Draft</option>
                <option value="published" ${existingTopic?.status === "published" ? "selected" : ""}>Published</option>
              </select>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button type="button" id="btn-cancel" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition cursor-pointer">
              Cancel
            </button>
            <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer">
              ${isEdit ? "Save Changes" : "Create Topic"}
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    refreshLucide();

    const close = () => modal.remove();
    on(modal.querySelector("#btn-close-modal"), "click", close);
    on(modal.querySelector("#btn-cancel"), "click", close);

    on(modal.querySelector("#topic-form"), "submit", async (e) => {
      e.preventDefault();
      const title = modal.querySelector("#topic-title").value.trim();
      const description = modal.querySelector("#topic-desc").value.trim();
      const category = modal.querySelector("#topic-category").value.trim();
      const status = modal.querySelector("#topic-status").value;

      if (!title) return;

      const saved = await databaseService.saveTopic({
        ...(existingTopic || {}),
        title,
        description,
        category,
        status
      });

      close();
      await this.loadData();
      if (typeof this.onStructureChange === "function") {
        this.onStructureChange();
      }
    });
  }

  // =================================================
  // MODULE MODAL
  // =================================================

  openModuleModal(topicId, existingModule = null) {
    const isEdit = Boolean(existingModule);
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4";
    modal.innerHTML = `
      <div class="glass-card rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative border border-slate-800 text-left">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-black text-white">
            ${isEdit ? "Edit Module Settings" : "Create New Module"}
          </h3>
          <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form id="module-form" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Module Title *</label>
            <input 
              type="text" 
              id="module-title" 
              required
              value="${escapeHTML(existingModule?.title || "")}" 
              placeholder="e.g. Introduction to Boolean Algebra" 
              class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Short Description</label>
            <textarea 
              id="module-desc" 
              rows="2" 
              placeholder="e.g. Learn fundamental axioms, truth tables, and De Morgan's laws." 
              class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
            >${escapeHTML(existingModule?.description || "")}</textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Estimated Time (Min)</label>
              <input 
                type="number" 
                id="module-time" 
                value="${existingModule?.estimatedMinutes || 25}" 
                min="5" 
                max="300"
                class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Difficulty</label>
              <select id="module-difficulty" class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none">
                <option value="Beginner" ${existingModule?.difficulty === "Beginner" ? "selected" : ""}>Beginner</option>
                <option value="Intermediate" ${existingModule?.difficulty === "Intermediate" ? "selected" : ""}>Intermediate</option>
                <option value="Advanced" ${existingModule?.difficulty === "Advanced" ? "selected" : ""}>Advanced</option>
              </select>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Status</label>
            <select id="module-status" class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none">
              <option value="draft" ${existingModule?.status === "draft" ? "selected" : ""}>Draft</option>
              <option value="published" ${existingModule?.status === "published" ? "selected" : ""}>Published</option>
            </select>
          </div>

          <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button type="button" id="btn-cancel" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition cursor-pointer">
              Cancel
            </button>
            <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer">
              ${isEdit ? "Save Changes" : "Create & Open Editor"}
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    refreshLucide();

    const close = () => modal.remove();
    on(modal.querySelector("#btn-close-modal"), "click", close);
    on(modal.querySelector("#btn-cancel"), "click", close);

    on(modal.querySelector("#module-form"), "submit", async (e) => {
      e.preventDefault();
      const title = modal.querySelector("#module-title").value.trim();
      const description = modal.querySelector("#module-desc").value.trim();
      const estimatedMinutes = parseInt(modal.querySelector("#module-time").value, 10) || 20;
      const difficulty = modal.querySelector("#module-difficulty").value;
      const status = modal.querySelector("#module-status").value;

      if (!title) return;

      const initialBlocks = existingModule?.draftBlocks || [
        {
          id: `blk_${Date.now()}_1`,
          type: "text",
          order: 0,
          data: {
            heading: "Concept Overview",
            level: "h2",
            content: `Welcome to ${title}.\n\nThis module covers essential principles, core architecture, and real-world implementation examples.`
          }
        },
        {
          id: `blk_${Date.now()}_2`,
          type: "callout",
          order: 1,
          data: {
            type: "tip",
            title: "Learning Goal",
            content: `Master the foundational concepts of ${title} and apply them to real-world engineering problems.`
          }
        }
      ];

      const saved = await databaseService.saveModule({
        ...(existingModule || {}),
        topicId,
        title,
        description,
        estimatedMinutes,
        difficulty,
        status,
        draftBlocks: initialBlocks,
        publishedBlocks: status === "published" ? initialBlocks : (existingModule?.publishedBlocks || [])
      });

      close();
      this.activeTopicId = topicId;
      this.activeModuleId = saved.id;
      await this.loadData();

      const topic = this.topics.find((t) => t.id === topicId);
      if (typeof this.onSelectModule === "function") {
        this.onSelectModule(saved, topic);
      }
      if (typeof this.onStructureChange === "function") {
        this.onStructureChange();
      }
    });
  }

  // =================================================
  // DELETE PROTECTION MODALS
  // =================================================

  confirmDeleteTopic(topicId) {
    const topic = this.topics.find((t) => t.id === topicId);
    if (!topic) return;
    const modules = this.modulesByTopic[topicId] || [];

    const modal = document.createElement("div");
    modal.className = "fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4";
    modal.innerHTML = `
      <div class="glass-card rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative border border-rose-500/30 text-left">
        <div class="flex items-center gap-3 text-rose-400">
          <div class="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl">
            <i data-lucide="alert-triangle" class="w-5 h-5"></i>
          </div>
          <h3 class="text-base font-black text-white">Delete Topic?</h3>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">
          Are you sure you want to delete <strong class="text-white">"${escapeHTML(topic.title)}"</strong>?
          ${
            modules.length > 0
              ? `<br/><br/><span class="text-rose-400 font-bold">Warning:</span> This topic contains <strong class="text-white">${modules.length} module(s)</strong> that will also be permanently deleted.`
              : ""
          }
        </p>

        <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button id="btn-cancel-del" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition cursor-pointer">
            Cancel
          </button>
          <button id="btn-confirm-del" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition cursor-pointer">
            Yes, Delete Topic
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    refreshLucide();

    const close = () => modal.remove();
    on(modal.querySelector("#btn-cancel-del"), "click", close);

    on(modal.querySelector("#btn-confirm-del"), "click", async () => {
      await databaseService.deleteTopic(topicId);
      if (this.activeTopicId === topicId) {
        this.activeTopicId = null;
        this.activeModuleId = null;
      }
      close();
      await this.loadData();
      if (typeof this.onStructureChange === "function") {
        this.onStructureChange();
      }
    });
  }

  confirmDeleteModule(moduleId) {
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4";
    modal.innerHTML = `
      <div class="glass-card rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative border border-rose-500/30 text-left">
        <div class="flex items-center gap-3 text-rose-400">
          <div class="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl">
            <i data-lucide="trash-2" class="w-5 h-5"></i>
          </div>
          <h3 class="text-base font-black text-white">Delete Module?</h3>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">
          This will permanently remove the module and all its content blocks.
        </p>

        <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button id="btn-cancel-del" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition cursor-pointer">
            Cancel
          </button>
          <button id="btn-confirm-del" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition cursor-pointer">
            Delete Module
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    refreshLucide();

    const close = () => modal.remove();
    on(modal.querySelector("#btn-cancel-del"), "click", close);

    on(modal.querySelector("#btn-confirm-del"), "click", async () => {
      await databaseService.deleteModule(moduleId);
      if (this.activeModuleId === moduleId) {
        this.activeModuleId = null;
      }
      close();
      await this.loadData();
      if (typeof this.onStructureChange === "function") {
        this.onStructureChange();
      }
    });
  }
}
