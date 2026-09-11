// ===================================================
// PATH FORGE - MASTER ADMIN PORTAL ORCHESTRATOR
// 3-Column Workspace connecting Tree, Block Editor, Live Preview & Media Library
// ===================================================

import { $, on, refreshLucide, escapeHTML } from "../../utils/dom.js";
import { ContentTree } from "./contentTree.js";
import { BlockEditor } from "./blockEditor.js";
import { LivePreview } from "./livePreview.js";
import { MediaLibrary } from "./mediaLibrary.js";
import { AdminAuthModal } from "./adminAuthModal.js";

export class AdminPortal {
  constructor({ containerId, onExitToStudent }) {
    this.container = typeof containerId === "string" ? $(containerId) : containerId;
    this.onExitToStudent = onExitToStudent;

    this.contentTree = null;
    this.blockEditor = null;
    this.livePreview = null;
    this.mediaLibrary = null;

    this.activeTopic = null;
    this.activeModule = null;
    this.activeMobileTab = "editor"; // structure | editor | preview
    this.adminSession = null;
  }

  async init() {
    this.adminSession = AdminAuthModal.getActiveAdminSession();
    this.render();

    this.contentTree = new ContentTree({
      containerId: "#pf-admin-tree-container",
      onSelectModule: (mod, topic) => this._handleSelectModule(mod, topic),
      onSelectTopic: (topic) => this._handleSelectTopic(topic),
      onStructureChange: () => this._handleStructureChange()
    });

    this.blockEditor = new BlockEditor({
      containerId: "#pf-admin-editor-container",
      onContentChange: ({ module, topic, blocks }) => {
        this.livePreview.update({ module, topic, blocks });
        this._updateBreadcrumbs(topic, module);
      },
      onSaveStatusChange: (status) => this._updateSaveBadge(status)
    });

    this.livePreview = new LivePreview({
      containerId: "#pf-admin-preview-container"
    });

    this.mediaLibrary = new MediaLibrary({
      onSelectMedia: () => {}
    });

    await this.contentTree.loadData();
    this._attachGlobalKeybindings();
  }

  render() {
    if (!this.container) return;

    const envAdminEmails = (typeof process !== "undefined" && process.env ? (process.env.VITE_ADMIN_EMAILS || process.env.ADMIN_EMAILS) : "") || "";
    const email = this.adminSession?.email || (envAdminEmails.split(",")[0]?.trim() || "admin@pathforge.dev");

    this.container.innerHTML = `
      <div class="pf-admin-workspace flex flex-col h-[calc(100vh-70px)] -mt-4 -mx-4 sm:-mx-6 overflow-hidden bg-slate-950 text-slate-100 select-none">
        
        <!-- Top Admin Toolbar -->
        <header class="h-14 bg-slate-950/95 border-b border-slate-800/80 px-4 flex items-center justify-between gap-3 shrink-0 z-30 backdrop-blur-xl">
          <!-- Left: Brand & Breadcrumb -->
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex items-center gap-2 p-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <i data-lucide="shield" class="w-4 h-4"></i>
              <span class="text-xs font-black tracking-wider text-white hidden sm:inline">CMS</span>
            </div>

            <!-- Breadcrumbs -->
            <div id="admin-breadcrumbs" class="flex items-center gap-1.5 text-xs text-slate-400 font-medium truncate">
              <span class="text-slate-500">PathForge</span>
              <span>/</span>
              <span id="crumb-topic" class="text-slate-300 font-semibold truncate">Select Topic</span>
              <span>/</span>
              <span id="crumb-module" class="text-indigo-300 font-bold truncate">Select Module</span>
            </div>
          </div>

          <!-- Center: Responsive Tabs (visible on mobile / tablet) -->
          <div class="flex lg:hidden items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
            <button class="px-2.5 py-1 rounded-lg font-bold transition ${this.activeMobileTab === "structure" ? "bg-indigo-600 text-white" : "text-slate-400"}" data-tab="structure">
              Structure
            </button>
            <button class="px-2.5 py-1 rounded-lg font-bold transition ${this.activeMobileTab === "editor" ? "bg-indigo-600 text-white" : "text-slate-400"}" data-tab="editor">
              Editor
            </button>
            <button class="px-2.5 py-1 rounded-lg font-bold transition ${this.activeMobileTab === "preview" ? "bg-indigo-600 text-white" : "text-slate-400"}" data-tab="preview">
              Preview
            </button>
          </div>

          <!-- Right: Actions & User Info -->
          <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <!-- Autosave Status Indicator -->
            <div id="admin-save-badge" class="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span id="admin-save-text">Saved</span>
            </div>

            <!-- Media Library Trigger -->
            <button id="btn-admin-media" class="hidden sm:flex px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 text-xs font-bold transition items-center gap-1.5 cursor-pointer active:scale-95" title="Media Assets Library">
              <i data-lucide="image" class="w-3.5 h-3.5 text-cyan-400"></i>
              <span>Media</span>
            </button>

            <!-- Save Draft Button -->
            <button id="btn-admin-save-draft" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95">
              <i data-lucide="save" class="w-3.5 h-3.5 text-amber-400"></i>
              <span class="hidden sm:inline">Save Draft</span>
            </button>

            <!-- Publish Button -->
            <button id="btn-admin-publish" class="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 cursor-pointer active:scale-95">
              <i data-lucide="send" class="w-3.5 h-3.5"></i>
              <span id="btn-publish-text">Publish</span>
            </button>

            <!-- Admin Profile & Exit -->
            <div class="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <span class="text-[11px] font-mono text-slate-400 hidden xl:inline" title="${escapeHTML(email)}">
                ${escapeHTML(email.split("@")[0])}
              </span>
              <button id="btn-admin-exit" class="p-1.5 bg-slate-900 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 rounded-xl border border-slate-800 transition cursor-pointer" title="Exit to Student Website">
                <i data-lucide="external-link" class="w-4 h-4"></i>
              </button>
              <button id="btn-admin-logout" class="p-1.5 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-800 transition cursor-pointer" title="Log Out Admin Session">
                <i data-lucide="log-out" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </header>

        <!-- 3-Column Main Workspace -->
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          <!-- Column 1: Left Structure Sidebar (3 cols) -->
          <div id="pf-col-structure" class="lg:col-span-3 border-r border-slate-800/80 bg-slate-950/60 p-4 overflow-y-auto ${this.activeMobileTab !== "structure" ? "hidden lg:block" : ""}">
            <div id="pf-admin-tree-container"></div>
          </div>

          <!-- Column 2: Center Content Editor (5 cols) -->
          <div id="pf-col-editor" class="lg:col-span-5 border-r border-slate-800/80 bg-slate-950/40 p-4 sm:p-6 overflow-y-auto ${this.activeMobileTab !== "editor" ? "hidden lg:block" : ""}">
            <div id="pf-admin-editor-container"></div>
          </div>

          <!-- Column 3: Right Live Preview (4 cols) -->
          <div id="pf-col-preview" class="lg:col-span-4 bg-slate-950/80 p-4 sm:p-5 overflow-y-auto ${this.activeMobileTab !== "preview" ? "hidden lg:block" : ""}">
            <div id="pf-admin-preview-container"></div>
          </div>

        </div>

      </div>
    `;

    refreshLucide();
    this._attachListeners();
  }

  _handleSelectModule(mod, topic) {
    this.activeModule = mod;
    this.activeTopic = topic;
    this.blockEditor.loadModule(mod, topic);
    this.livePreview.update({
      module: mod,
      topic,
      blocks: mod.draftBlocks || []
    });
    this._updateBreadcrumbs(topic, mod);
    this._updatePublishButtonState();
  }

  _handleSelectTopic(topic) {
    this.activeTopic = topic;
    this._updateBreadcrumbs(topic, null);
  }

  _handleStructureChange() {
    this._updatePublishButtonState();
  }

  _updateBreadcrumbs(topic, mod) {
    const topicEl = this.container.querySelector("#crumb-topic");
    const modEl = this.container.querySelector("#crumb-module");
    if (topicEl) topicEl.textContent = topic ? topic.title : "Select Topic";
    if (modEl) modEl.textContent = mod ? mod.title : "Select Module";
  }

  _updateSaveBadge(status) {
    const badge = this.container.querySelector("#admin-save-badge");
    const text = this.container.querySelector("#admin-save-text");
    if (!badge || !text) return;

    if (status === "saving") {
      badge.className = "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300";
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span><span>Saving...</span>`;
    } else if (status === "error") {
      badge.className = "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300";
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-400"></span><span>Save Failed</span>`;
    } else {
      badge.className = "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300";
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span><span>Saved</span>`;
    }
  }

  _updatePublishButtonState() {
    const pubBtn = this.container.querySelector("#btn-admin-publish");
    const pubText = this.container.querySelector("#btn-publish-text");
    if (!pubBtn || !pubText) return;

    const isPublished = this.activeModule?.status === "published";
    if (isPublished) {
      pubText.textContent = "Unpublish";
      pubBtn.className = "px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-extrabold shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95";
    } else {
      pubText.textContent = "Publish";
      pubBtn.className = "px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 cursor-pointer active:scale-95";
    }
  }

  _attachListeners() {
    // Save draft
    const saveDraftBtn = this.container.querySelector("#btn-admin-save-draft");
    if (saveDraftBtn) {
      on(saveDraftBtn, "click", async () => {
        if (this.blockEditor) {
          await this.blockEditor.saveCurrentState();
        }
      });
    }

    // Publish / Unpublish
    const publishBtn = this.container.querySelector("#btn-admin-publish");
    if (publishBtn) {
      on(publishBtn, "click", async () => {
        if (!this.activeModule) return;
        const willPublish = this.activeModule.status !== "published";
        const updated = await this.blockEditor.publishCurrentModule(willPublish);
        this.activeModule = updated;
        this._updatePublishButtonState();
        if (this.contentTree) {
          await this.contentTree.loadData();
        }
      });
    }

    // Media library
    const mediaBtn = this.container.querySelector("#btn-admin-media");
    if (mediaBtn) {
      on(mediaBtn, "click", () => this.mediaLibrary.open());
    }

    // Exit to student
    const exitBtn = this.container.querySelector("#btn-admin-exit");
    if (exitBtn) {
      on(exitBtn, "click", () => {
        if (typeof this.onExitToStudent === "function") {
          this.onExitToStudent();
        }
      });
    }

    // Logout admin
    const logoutBtn = this.container.querySelector("#btn-admin-logout");
    if (logoutBtn) {
      on(logoutBtn, "click", () => {
        AdminAuthModal.clearAdminSession();
        if (typeof this.onExitToStudent === "function") {
          this.onExitToStudent();
        }
      });
    }

    // Responsive tab switcher
    on(this.container, "click", (e) => {
      const tabBtn = e.target.closest("[data-tab]");
      if (!tabBtn) return;
      const tab = tabBtn.getAttribute("data-tab");
      this.activeMobileTab = tab;

      const colStructure = this.container.querySelector("#pf-col-structure");
      const colEditor = this.container.querySelector("#pf-col-editor");
      const colPreview = this.container.querySelector("#pf-col-preview");

      if (colStructure) colStructure.classList.toggle("hidden", tab !== "structure");
      if (colEditor) colEditor.classList.toggle("hidden", tab !== "editor");
      if (colPreview) colPreview.classList.toggle("hidden", tab !== "preview");

      this.container.querySelectorAll("[data-tab]").forEach((btn) => {
        const isCurrent = btn.getAttribute("data-tab") === tab;
        btn.className = `px-2.5 py-1 rounded-lg font-bold transition ${isCurrent ? "bg-indigo-600 text-white" : "text-slate-400"}`;
      });
    });
  }

  _attachGlobalKeybindings() {
    window.addEventListener("keydown", (e) => {
      if (!this.container || this.container.classList.contains("hidden")) return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Ctrl + S: Save
      if (isCtrlOrCmd && e.key.toLowerCase() === "s") {
        e.preventDefault();
        this.blockEditor?.saveCurrentState();
      }

      // Ctrl + Z: Undo
      if (isCtrlOrCmd && e.key.toLowerCase() === "z" && !e.shiftKey) {
        if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
          e.preventDefault();
          this.blockEditor?.undo();
        }
      }

      // Ctrl + Shift + Z or Ctrl + Y: Redo
      if ((isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === "z") || (isCtrlOrCmd && e.key.toLowerCase() === "y")) {
        if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
          e.preventDefault();
          this.blockEditor?.redo();
        }
      }
    });
  }
}
