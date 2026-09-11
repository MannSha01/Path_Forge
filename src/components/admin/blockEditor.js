// ===================================================
// PATH FORGE - ADMIN BLOCK CONTENT EDITOR
// Notion-style structured block editor with live autosave & history
// ===================================================

import { $, on, refreshLucide, escapeHTML } from "../../utils/dom.js";
import { databaseService } from "../../services/database/databaseService.js";
import { FlowchartEditorModal } from "./flowchartEditor.js";
import { MediaLibrary } from "./mediaLibrary.js";

export class BlockEditor {
  constructor({ containerId, onContentChange, onSaveStatusChange }) {
    this.container = typeof containerId === "string" ? $(containerId) : containerId;
    this.onContentChange = onContentChange;
    this.onSaveStatusChange = onSaveStatusChange;

    this.currentModule = null;
    this.currentTopic = null;
    this.blocks = [];
    this.historyStack = [];
    this.historyIndex = -1;
    this.autosaveTimer = null;
    this.saveState = "saved"; // saved | saving | error

    this.mediaLibrary = new MediaLibrary({
      onSelectMedia: (asset) => this._handleMediaSelect(asset)
    });
    this.activeMediaBlockId = null;
  }

  loadModule(module, topic) {
    this.currentModule = JSON.parse(JSON.stringify(module));
    this.currentTopic = topic;
    this.blocks = Array.isArray(this.currentModule.draftBlocks) && this.currentModule.draftBlocks.length > 0
      ? JSON.parse(JSON.stringify(this.currentModule.draftBlocks))
      : [
          {
            id: `blk_${Date.now()}_1`,
            type: "text",
            order: 0,
            data: {
              heading: "Overview & Objectives",
              level: "h2",
              content: "Explain the fundamental theory, mechanisms, and implementation pattern."
            }
          }
        ];

    this.historyStack = [JSON.parse(JSON.stringify(this.blocks))];
    this.historyIndex = 0;
    this.render();
    this._triggerChange();
  }

  _recordHistory() {
    // Truncate redo states
    this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
    this.historyStack.push(JSON.parse(JSON.stringify(this.blocks)));
    this.historyIndex++;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.blocks = JSON.parse(JSON.stringify(this.historyStack[this.historyIndex]));
      this.render();
      this._triggerChange();
    }
  }

  redo() {
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyIndex++;
      this.blocks = JSON.parse(JSON.stringify(this.historyStack[this.historyIndex]));
      this.render();
      this._triggerChange();
    }
  }

  render() {
    if (!this.container) return;

    if (!this.currentModule) {
      this.container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
          <i data-lucide="layout-template" class="w-12 h-12 text-slate-700"></i>
          <h3 class="text-sm font-bold text-slate-400">No Module Selected</h3>
          <p class="text-xs text-slate-500 max-w-xs">Select an existing module from the left sidebar or click "+ Topic" to create one.</p>
        </div>
      `;
      refreshLucide();
      return;
    }

    this.container.innerHTML = `
      <div class="pf-block-editor space-y-6 text-left">
        
        <!-- Module Metadata Card -->
        <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-lg">
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span class="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <i data-lucide="settings" class="w-3.5 h-3.5"></i> Module Settings
            </span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full ${
              this.currentModule.status === "published"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
            }">
              ${this.currentModule.status === "published" ? "Published (Live)" : "Draft"}
            </span>
          </div>

          <div class="space-y-1.5">
            <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Module Title</label>
            <input 
              type="text" 
              id="meta-module-title" 
              value="${escapeHTML(this.currentModule.title || "")}" 
              placeholder="e.g. Introduction to Boolean Algebra" 
              class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none transition"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Short Description / Core Objective</label>
            <input 
              type="text" 
              id="meta-module-desc" 
              value="${escapeHTML(this.currentModule.description || "")}" 
              placeholder="e.g. Learn fundamental Boolean axioms, truth tables, and De Morgan's laws." 
              class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-slate-200 outline-none transition"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-400 uppercase">Estimated Study Time (Min)</label>
              <input 
                type="number" 
                id="meta-module-time" 
                value="${this.currentModule.estimatedMinutes || 20}" 
                min="5" 
                max="240"
                class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              />
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-400 uppercase">Difficulty</label>
              <select id="meta-module-difficulty" class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none">
                <option value="Beginner" ${this.currentModule.difficulty === "Beginner" ? "selected" : ""}>Beginner</option>
                <option value="Intermediate" ${this.currentModule.difficulty === "Intermediate" ? "selected" : ""}>Intermediate</option>
                <option value="Advanced" ${this.currentModule.difficulty === "Advanced" ? "selected" : ""}>Advanced</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Content Blocks Stream -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="flex items-center gap-2">
              <i data-lucide="file-code" class="w-4 h-4 text-cyan-400"></i>
              <span class="text-xs font-black uppercase tracking-wider text-white">Lesson Content Blocks (${this.blocks.length})</span>
            </div>

            <!-- History Actions -->
            <div class="flex items-center gap-1 text-slate-400 text-xs">
              <button id="btn-editor-undo" class="p-1 hover:text-white rounded transition cursor-pointer" title="Undo (Ctrl+Z)">
                <i data-lucide="undo-2" class="w-3.5 h-3.5"></i>
              </button>
              <button id="btn-editor-redo" class="p-1 hover:text-white rounded transition cursor-pointer" title="Redo (Ctrl+Shift+Z)">
                <i data-lucide="redo-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>

          <div id="blocks-container" class="space-y-4">
            ${this.blocks.map((block, idx) => this._renderBlockEditorCard(block, idx)).join("\n")}
          </div>
        </div>

        <!-- Floating Add Block Action Bar -->
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-2 shadow-2xl sticky bottom-4 z-20 backdrop-blur-md">
          <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-400">+ Add Content Block:</span>
          <div class="flex items-center flex-wrap gap-2">
            <button class="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600/40 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95" data-action="add-block" data-type="text">
              <i data-lucide="type" class="w-3.5 h-3.5 text-indigo-400"></i> Text
            </button>
            <button class="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600/40 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95" data-action="add-block" data-type="image">
              <i data-lucide="image" class="w-3.5 h-3.5 text-cyan-400"></i> Image
            </button>
            <button class="px-3 py-1.5 bg-slate-800 hover:bg-emerald-600/40 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95" data-action="add-block" data-type="flowchart">
              <i data-lucide="git-merge" class="w-3.5 h-3.5 text-emerald-400"></i> Flowchart
            </button>
            <button class="px-3 py-1.5 bg-slate-800 hover:bg-amber-600/40 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95" data-action="add-block" data-type="code">
              <i data-lucide="code" class="w-3.5 h-3.5 text-amber-400"></i> Code
            </button>
            <button class="px-3 py-1.5 bg-slate-800 hover:bg-purple-600/40 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95" data-action="add-block" data-type="callout">
              <i data-lucide="alert-circle" class="w-3.5 h-3.5 text-purple-400"></i> Callout
            </button>
            <button class="px-3 py-1.5 bg-slate-800 hover:bg-rose-600/40 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer active:scale-95" data-action="add-block" data-type="table">
              <i data-lucide="table" class="w-3.5 h-3.5 text-rose-400"></i> Table
            </button>
          </div>
        </div>

      </div>
    `;

    refreshLucide();
    this._attachListeners();
  }

  _renderBlockEditorCard(block, index) {
    const data = block.data || {};
    const blockId = block.id;

    return `
      <div class="pf-block-card p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition space-y-3.5 relative group" data-block-id="${blockId}">
        
        <!-- Block Card Header Toolbar -->
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-lg bg-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center border border-slate-700">
              ${index + 1}
            </span>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              ${this._getBlockIcon(block.type)} ${block.type} Block
            </span>
          </div>

          <!-- Actions Toolbar -->
          <div class="flex items-center gap-1 text-slate-400">
            <button class="p-1 hover:text-white rounded transition cursor-pointer" data-action="move-up" data-block-id="${blockId}" title="Move Up" ${index === 0 ? "disabled class='opacity-30'" : ""}>
              <i data-lucide="arrow-up" class="w-3.5 h-3.5"></i>
            </button>
            <button class="p-1 hover:text-white rounded transition cursor-pointer" data-action="move-down" data-block-id="${blockId}" title="Move Down" ${index === this.blocks.length - 1 ? "disabled class='opacity-30'" : ""}>
              <i data-lucide="arrow-down" class="w-3.5 h-3.5"></i>
            </button>
            <button class="p-1 hover:text-indigo-300 rounded transition cursor-pointer" data-action="duplicate-block" data-block-id="${blockId}" title="Duplicate Block">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            </button>
            <button class="p-1 hover:text-rose-400 rounded transition cursor-pointer" data-action="delete-block" data-block-id="${blockId}" title="Delete Block">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <!-- Block Specific Inputs -->
        ${this._renderBlockTypeForm(block)}
      </div>
    `;
  }

  _getBlockIcon(type) {
    switch (type) {
      case "text": return '<i data-lucide="type" class="w-3.5 h-3.5 text-indigo-400"></i>';
      case "image": return '<i data-lucide="image" class="w-3.5 h-3.5 text-cyan-400"></i>';
      case "flowchart": return '<i data-lucide="git-merge" class="w-3.5 h-3.5 text-emerald-400"></i>';
      case "code": return '<i data-lucide="code" class="w-3.5 h-3.5 text-amber-400"></i>';
      case "callout": return '<i data-lucide="alert-circle" class="w-3.5 h-3.5 text-purple-400"></i>';
      case "table": return '<i data-lucide="table" class="w-3.5 h-3.5 text-rose-400"></i>';
      default: return '<i data-lucide="box" class="w-3.5 h-3.5"></i>';
    }
  }

  _renderBlockTypeForm(block) {
    const data = block.data || {};
    const id = block.id;

    switch (block.type) {
      case "text":
        return `
          <div class="space-y-3">
            <div class="grid grid-cols-3 gap-2">
              <div class="col-span-2 space-y-1">
                <input 
                  type="text" 
                  data-field="heading" 
                  data-block-id="${id}" 
                  value="${escapeHTML(data.heading || "")}" 
                  placeholder="Section Heading (Optional)" 
                  class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
              <div class="space-y-1">
                <select data-field="level" data-block-id="${id}" class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none">
                  <option value="h1" ${data.level === "h1" ? "selected" : ""}>H1 (Main Title)</option>
                  <option value="h2" ${data.level === "h2" || !data.level ? "selected" : ""}>H2 (Major Section)</option>
                  <option value="h3" ${data.level === "h3" ? "selected" : ""}>H3 (Sub-heading)</option>
                </select>
              </div>
            </div>

            <!-- Mini formatting toolbar -->
            <div class="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
              <span class="text-[10px] text-slate-500 font-mono px-1">FORMAT:</span>
              <button type="button" class="px-2 py-0.5 rounded hover:bg-slate-800 font-bold hover:text-white" data-format="bold" data-block-id="${id}">B</button>
              <button type="button" class="px-2 py-0.5 rounded hover:bg-slate-800 italic hover:text-white" data-format="italic" data-block-id="${id}">I</button>
              <button type="button" class="px-2 py-0.5 rounded hover:bg-slate-800 font-mono hover:text-white" data-format="code" data-block-id="${id}">&lt;/&gt;</button>
              <button type="button" class="px-2 py-0.5 rounded hover:bg-slate-800 hover:text-white" data-format="quote" data-block-id="${id}">&ldquo; Quote</button>
              <button type="button" class="px-2 py-0.5 rounded hover:bg-slate-800 hover:text-white" data-format="bullet" data-block-id="${id}">• List</button>
            </div>

            <textarea 
              rows="4" 
              data-field="content" 
              data-block-id="${id}" 
              placeholder="Write section explanation, paragraphs, bullet points, etc..." 
              class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 outline-none leading-relaxed"
            >${escapeHTML(data.content || "")}</textarea>
          </div>
        `;

      case "image":
        return `
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <input 
                type="text" 
                data-field="url" 
                data-block-id="${id}" 
                value="${escapeHTML(data.url || "")}" 
                placeholder="Image URL (e.g. https://...)" 
                class="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              />
              <button 
                type="button" 
                class="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                data-action="open-media-lib"
                data-block-id="${id}"
              >
                <i data-lucide="image" class="w-3.5 h-3.5"></i>
                <span>Media Library</span>
              </button>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <input 
                type="text" 
                data-field="caption" 
                data-block-id="${id}" 
                value="${escapeHTML(data.caption || "")}" 
                placeholder="Caption text below image" 
                class="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              />
              <select data-field="size" data-block-id="${id}" class="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none">
                <option value="medium" ${data.size === "medium" ? "selected" : ""}>Medium Width</option>
                <option value="small" ${data.size === "small" ? "selected" : ""}>Small Width</option>
                <option value="full" ${data.size === "full" ? "selected" : ""}>Full Width</option>
              </select>
              <select data-field="alignment" data-block-id="${id}" class="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none">
                <option value="center" ${data.alignment === "center" ? "selected" : ""}>Center Align</option>
                <option value="left" ${data.alignment === "left" ? "selected" : ""}>Left Align</option>
                <option value="right" ${data.alignment === "right" ? "selected" : ""}>Right Align</option>
              </select>
            </div>
          </div>
        `;

      case "flowchart":
        const nodeCount = Array.isArray(data.nodes) ? data.nodes.length : 0;
        return `
          <div class="p-4 rounded-xl bg-slate-950 border border-indigo-500/20 flex items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="text-xs font-bold text-white">${escapeHTML(data.title || "Logic Flowchart Diagram")}</div>
              <p class="text-[11px] text-slate-400">${nodeCount} node(s) configured in visual flow graph</p>
            </div>
            <button 
              type="button" 
              class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              data-action="open-flowchart-designer"
              data-block-id="${id}"
            >
              <i data-lucide="git-merge" class="w-4 h-4"></i>
              <span>Design Flowchart</span>
            </button>
          </div>
        `;

      case "code":
        return `
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                data-field="filename" 
                data-block-id="${id}" 
                value="${escapeHTML(data.filename || data.description || "")}" 
                placeholder="Filename or label (e.g. booleanLogic.js)" 
                class="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              />
              <select data-field="language" data-block-id="${id}" class="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none font-mono">
                <option value="javascript" ${data.language === "javascript" ? "selected" : ""}>JavaScript</option>
                <option value="python" ${data.language === "python" ? "selected" : ""}>Python</option>
                <option value="typescript" ${data.language === "typescript" ? "selected" : ""}>TypeScript</option>
                <option value="html" ${data.language === "html" ? "selected" : ""}>HTML</option>
                <option value="css" ${data.language === "css" ? "selected" : ""}>CSS</option>
                <option value="sql" ${data.language === "sql" ? "selected" : ""}>SQL</option>
                <option value="json" ${data.language === "json" ? "selected" : ""}>JSON</option>
              </select>
            </div>

            <textarea 
              rows="5" 
              data-field="code" 
              data-block-id="${id}" 
              placeholder="// Write production code example..." 
              class="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 font-mono rounded-xl p-3 text-xs text-cyan-200 outline-none leading-relaxed"
            >${escapeHTML(data.code || "")}</textarea>
          </div>
        `;

      case "callout":
        return `
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-2">
              <select data-field="type" data-block-id="${id}" class="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none font-bold">
                <option value="note" ${data.type === "note" ? "selected" : ""}>Note (Blue / Indigo)</option>
                <option value="tip" ${data.type === "tip" ? "selected" : ""}>Pro Tip (Emerald)</option>
                <option value="warning" ${data.type === "warning" ? "selected" : ""}>Common Trap / Pitfall (Amber)</option>
                <option value="important" ${data.type === "important" ? "selected" : ""}>Key Principle (Rose)</option>
              </select>
              <input 
                type="text" 
                data-field="title" 
                data-block-id="${id}" 
                value="${escapeHTML(data.title || "")}" 
                placeholder="Callout Title" 
                class="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              />
            </div>
            <textarea 
              rows="2" 
              data-field="content" 
              data-block-id="${id}" 
              placeholder="Callout message..." 
              class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 outline-none"
            >${escapeHTML(data.content || "")}</textarea>
          </div>
        `;

      case "table":
        const headers = Array.isArray(data.headers) ? data.headers : ["Term", "Definition"];
        const rows = Array.isArray(data.rows) ? data.rows : [["AND Gate", "Outputs 1 only when all inputs are 1"]];
        return `
          <div class="space-y-3">
            <input 
              type="text" 
              data-field="title" 
              data-block-id="${id}" 
              value="${escapeHTML(data.title || "")}" 
              placeholder="Table Title (Optional)" 
              class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
            />
            
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 overflow-x-auto">
              <div class="flex items-center justify-between text-[11px] text-slate-400">
                <span class="font-bold uppercase">Grid Editor (${headers.length} Cols × ${rows.length} Rows)</span>
                <div class="flex gap-1.5">
                  <button type="button" class="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold cursor-pointer" data-action="add-table-row" data-block-id="${id}">+ Add Row</button>
                  <button type="button" class="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold cursor-pointer" data-action="add-table-col" data-block-id="${id}">+ Add Col</button>
                </div>
              </div>

              <!-- Headers row -->
              <div class="grid gap-2" style="grid-template-columns: repeat(${headers.length}, minmax(120px, 1fr));">
                ${headers.map((h, cIdx) => `
                  <input 
                    type="text" 
                    value="${escapeHTML(h)}" 
                    placeholder="Header ${cIdx + 1}" 
                    class="bg-slate-900 border border-slate-700 font-bold rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                    data-table-header="${cIdx}"
                    data-block-id="${id}"
                  />
                `).join("")}
              </div>

              <!-- Data rows -->
              ${rows.map((r, rIdx) => `
                <div class="grid gap-2" style="grid-template-columns: repeat(${headers.length}, minmax(120px, 1fr));">
                  ${headers.map((_, cIdx) => `
                    <input 
                      type="text" 
                      value="${escapeHTML(r[cIdx] || "")}" 
                      placeholder="Cell ${rIdx + 1},${cIdx + 1}" 
                      class="bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 outline-none"
                      data-table-cell="${rIdx},${cIdx}"
                      data-block-id="${id}"
                    />
                  `).join("")}
                </div>
              `).join("")}
            </div>
          </div>
        `;

      default:
        return `<div class="text-xs text-slate-500">No editor for block type ${block.type}</div>`;
    }
  }

  _attachListeners() {
    // Metadata inputs
    const metaTitle = this.container.querySelector("#meta-module-title");
    const metaDesc = this.container.querySelector("#meta-module-desc");
    const metaTime = this.container.querySelector("#meta-module-time");
    const metaDiff = this.container.querySelector("#meta-module-difficulty");

    if (metaTitle) on(metaTitle, "input", (e) => { this.currentModule.title = e.target.value; this._triggerAutosave(); });
    if (metaDesc) on(metaDesc, "input", (e) => { this.currentModule.description = e.target.value; this._triggerAutosave(); });
    if (metaTime) on(metaTime, "input", (e) => { this.currentModule.estimatedMinutes = parseInt(e.target.value, 10) || 20; this._triggerAutosave(); });
    if (metaDiff) on(metaDiff, "change", (e) => { this.currentModule.difficulty = e.target.value; this._triggerAutosave(); });

    // History buttons
    const undoBtn = this.container.querySelector("#btn-editor-undo");
    const redoBtn = this.container.querySelector("#btn-editor-redo");
    if (undoBtn) on(undoBtn, "click", () => this.undo());
    if (redoBtn) on(redoBtn, "click", () => this.redo());

    // Field inputs
    on(this.container, "input", (e) => {
      const input = e.target;
      const blockId = input.getAttribute("data-block-id");
      const field = input.getAttribute("data-field");
      if (!blockId) return;

      const block = this.blocks.find((b) => b.id === blockId);
      if (!block) return;

      if (!block.data) block.data = {};

      if (field) {
        block.data[field] = input.value;
      } else if (input.hasAttribute("data-table-header")) {
        const cIdx = parseInt(input.getAttribute("data-table-header"), 10);
        if (!Array.isArray(block.data.headers)) block.data.headers = [];
        block.data.headers[cIdx] = input.value;
      } else if (input.hasAttribute("data-table-cell")) {
        const [rIdx, cIdx] = input.getAttribute("data-table-cell").split(",").map(Number);
        if (!Array.isArray(block.data.rows)) block.data.rows = [];
        if (!Array.isArray(block.data.rows[rIdx])) block.data.rows[rIdx] = [];
        block.data.rows[rIdx][cIdx] = input.value;
      }

      this._triggerAutosave();
    });

    on(this.container, "change", (e) => {
      const select = e.target;
      const blockId = select.getAttribute("data-block-id");
      const field = select.getAttribute("data-field");
      if (!blockId || !field) return;

      const block = this.blocks.find((b) => b.id === blockId);
      if (!block) return;
      if (!block.data) block.data = {};
      block.data[field] = select.value;
      this._triggerAutosave();
    });

    // Clicks & Actions
    on(this.container, "click", async (e) => {
      const btn = e.target.closest("[data-action], [data-format]");
      if (!btn) return;

      const action = btn.getAttribute("data-action");
      const format = btn.getAttribute("data-format");
      const blockId = btn.getAttribute("data-block-id");

      if (format && blockId) {
        this._applyFormat(blockId, format);
        return;
      }

      switch (action) {
        case "add-block":
          const type = btn.getAttribute("data-type");
          this._addBlock(type);
          break;

        case "move-up":
          this._moveBlock(blockId, -1);
          break;

        case "move-down":
          this._moveBlock(blockId, 1);
          break;

        case "duplicate-block":
          this._duplicateBlock(blockId);
          break;

        case "delete-block":
          this._deleteBlock(blockId);
          break;

        case "open-media-lib":
          this.activeMediaBlockId = blockId;
          this.mediaLibrary.open({ selectMode: true });
          break;

        case "open-flowchart-designer":
          const flBlock = this.blocks.find((b) => b.id === blockId);
          if (flBlock) {
            new FlowchartEditorModal({
              initialData: flBlock.data || {},
              onSave: (flowData) => {
                flBlock.data = flowData;
                this._recordHistory();
                this.render();
                this._triggerChange();
                this._triggerAutosave();
              }
            }).open();
          }
          break;

        case "add-table-row":
          const tblBlockR = this.blocks.find((b) => b.id === blockId);
          if (tblBlockR) {
            if (!Array.isArray(tblBlockR.data.rows)) tblBlockR.data.rows = [];
            const colCount = (tblBlockR.data.headers || []).length || 2;
            tblBlockR.data.rows.push(new Array(colCount).fill(""));
            this._recordHistory();
            this.render();
            this._triggerAutosave();
          }
          break;

        case "add-table-col":
          const tblBlockC = this.blocks.find((b) => b.id === blockId);
          if (tblBlockC) {
            if (!Array.isArray(tblBlockC.data.headers)) tblBlockC.data.headers = [];
            tblBlockC.data.headers.push(`Header ${tblBlockC.data.headers.length + 1}`);
            if (Array.isArray(tblBlockC.data.rows)) {
              tblBlockC.data.rows.forEach((r) => r.push(""));
            }
            this._recordHistory();
            this.render();
            this._triggerAutosave();
          }
          break;
      }
    });
  }

  _applyFormat(blockId, format) {
    const textarea = this.container.querySelector(`textarea[data-field="content"][data-block-id="${blockId}"]`);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selText = textarea.value.substring(start, end) || "text";
    let replacement = selText;

    if (format === "bold") replacement = `**${selText}**`;
    if (format === "italic") replacement = `*${selText}*`;
    if (format === "code") replacement = `\`${selText}\``;
    if (format === "quote") replacement = `\n> ${selText}\n`;
    if (format === "bullet") replacement = `\n- ${selText}`;

    textarea.setRangeText(replacement, start, end, "end");
    const block = this.blocks.find((b) => b.id === blockId);
    if (block) {
      if (!block.data) block.data = {};
      block.data.content = textarea.value;
      this._triggerAutosave();
    }
  }

  _addBlock(type) {
    const id = `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let defaultData = {};

    if (type === "text") {
      defaultData = { heading: "New Section", level: "h3", content: "Write section content here..." };
    } else if (type === "image") {
      defaultData = { url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60", caption: "Educational diagram", size: "medium", alignment: "center" };
    } else if (type === "flowchart") {
      defaultData = {
        title: "Logic Flow",
        nodes: [
          { id: "node_1", text: "Start Step", type: "start" },
          { id: "node_2", text: "Execute Process", type: "process" },
          { id: "node_3", text: "Complete & Return", type: "end" }
        ],
        connections: [
          { from: "node_1", to: "node_2", label: "" },
          { from: "node_2", to: "node_3", label: "" }
        ]
      };
    } else if (type === "code") {
      defaultData = { filename: "example.js", language: "javascript", code: "// Write code here\nfunction example() {\n  return true;\n}" };
    } else if (type === "callout") {
      defaultData = { type: "tip", title: "Important Tip", content: "Remember to apply best practices when implementing this pattern." };
    } else if (type === "table") {
      defaultData = { title: "Comparison Table", headers: ["Feature", "Description"], rows: [["Item 1", "Details 1"], ["Item 2", "Details 2"]] };
    }

    this.blocks.push({
      id,
      type,
      order: this.blocks.length,
      data: defaultData
    });

    this._recordHistory();
    this.render();
    this._triggerAutosave();
  }

  _moveBlock(blockId, direction) {
    const idx = this.blocks.findIndex((b) => b.id === blockId);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= this.blocks.length) return;

    const temp = this.blocks[idx];
    this.blocks[idx] = this.blocks[targetIdx];
    this.blocks[targetIdx] = temp;

    this.blocks.forEach((b, i) => (b.order = i));
    this._recordHistory();
    this.render();
    this._triggerAutosave();
  }

  _duplicateBlock(blockId) {
    const orig = this.blocks.find((b) => b.id === blockId);
    if (!orig) return;
    const newId = `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cloned = {
      ...JSON.parse(JSON.stringify(orig)),
      id: newId,
      order: orig.order + 1
    };
    const origIdx = this.blocks.indexOf(orig);
    this.blocks.splice(origIdx + 1, 0, cloned);
    this.blocks.forEach((b, i) => (b.order = i));
    this._recordHistory();
    this.render();
    this._triggerAutosave();
  }

  _deleteBlock(blockId) {
    this.blocks = this.blocks.filter((b) => b.id !== blockId);
    this.blocks.forEach((b, i) => (b.order = i));
    this._recordHistory();
    this.render();
    this._triggerAutosave();
  }

  _handleMediaSelect(asset) {
    if (!this.activeMediaBlockId) return;
    const block = this.blocks.find((b) => b.id === this.activeMediaBlockId);
    if (block) {
      if (!block.data) block.data = {};
      block.data.url = asset.url;
      if (asset.name && !block.data.caption) {
        block.data.caption = asset.name;
      }
      this._recordHistory();
      this.render();
      this._triggerAutosave();
    }
  }

  _triggerChange() {
    if (typeof this.onContentChange === "function") {
      this.onContentChange({
        module: this.currentModule,
        topic: this.currentTopic,
        blocks: this.blocks
      });
    }
  }

  _triggerAutosave() {
    this._triggerChange();

    if (typeof this.onSaveStatusChange === "function") {
      this.onSaveStatusChange("saving");
    }

    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);

    this.autosaveTimer = setTimeout(async () => {
      await this.saveCurrentState();
    }, 400); // 400ms debounce
  }

  async saveCurrentState() {
    if (!this.currentModule) return;

    try {
      this.currentModule.draftBlocks = JSON.parse(JSON.stringify(this.blocks));
      const saved = await databaseService.saveModule(this.currentModule);
      this.currentModule = saved;

      if (typeof this.onSaveStatusChange === "function") {
        this.onSaveStatusChange("saved");
      }
    } catch (err) {
      console.error("[BlockEditor] Autosave error:", err);
      if (typeof this.onSaveStatusChange === "function") {
        this.onSaveStatusChange("error");
      }
    }
  }

  async publishCurrentModule(isPublished = true) {
    if (!this.currentModule) return;
    await this.saveCurrentState();
    const updated = await databaseService.publishModule(this.currentModule.id, isPublished);
    this.currentModule = updated;
    this.render();
    this._triggerChange();
    return updated;
  }
}
