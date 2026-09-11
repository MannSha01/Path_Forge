// ===================================================
// PATH FORGE - ADMIN FLOWCHART DESIGNER
// Visual node-based diagram & process logic builder
// ===================================================

import { $, on, refreshLucide, escapeHTML } from "../../utils/dom.js";

export class FlowchartEditorModal {
  constructor({ initialData = {}, onSave, onCancel }) {
    this.title = initialData.title || "Logic & Process Flow";
    this.nodes = Array.isArray(initialData.nodes) && initialData.nodes.length > 0
      ? JSON.parse(JSON.stringify(initialData.nodes))
      : [
          { id: "node_1", text: "Start Process", type: "start" },
          { id: "node_2", text: "Process Input Data", type: "process" },
          { id: "node_3", text: "Condition Satisfied?", type: "decision" },
          { id: "node_4", text: "Output Result & Finish", type: "end" }
        ];

    this.connections = Array.isArray(initialData.connections) && initialData.connections.length > 0
      ? JSON.parse(JSON.stringify(initialData.connections))
      : [
          { from: "node_1", to: "node_2", label: "" },
          { from: "node_2", to: "node_3", label: "" },
          { from: "node_3", to: "node_4", label: "Yes" }
        ];

    this.onSave = onSave;
    this.onCancel = onCancel;
    this.modalEl = null;
    this.selectedNodeId = this.nodes[0]?.id || null;
  }

  open() {
    this._render();
    document.body.appendChild(this.modalEl);
    requestAnimationFrame(() => {
      this.modalEl.classList.remove("opacity-0", "pointer-events-none");
    });
    refreshLucide();
  }

  close() {
    if (this.modalEl) {
      this.modalEl.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        if (this.modalEl && this.modalEl.parentNode) {
          this.modalEl.parentNode.removeChild(this.modalEl);
        }
      }, 200);
    }
  }

  _render() {
    const existing = $("#pf-flowchart-editor-modal");
    if (existing) existing.remove();

    const selectedNode = this.nodes.find((n) => n.id === this.selectedNodeId) || this.nodes[0] || null;

    const div = document.createElement("div");
    div.id = "pf-flowchart-editor-modal";
    div.className = "fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-200";
    div.innerHTML = `
      <div class="glass-card rounded-3xl max-w-5xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative border border-indigo-500/30 text-left max-h-[92vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <i data-lucide="git-merge" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-black text-white">Interactive Flowchart Designer</h3>
              <p class="text-[11px] text-slate-400">Configure nodes, decisions, branches, and connections</p>
            </div>
          </div>
          <button id="btn-close-flowchart" class="p-2 rounded-xl text-slate-400 hover:text-white transition cursor-pointer">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Diagram Title -->
        <div class="flex items-center gap-3 shrink-0">
          <label class="text-xs font-bold text-slate-300 uppercase tracking-wider whitespace-nowrap">Diagram Title:</label>
          <input 
            type="text" 
            id="flowchart-title-input" 
            value="${escapeHTML(this.title)}" 
            placeholder="e.g. Binary Search Execution Tree" 
            class="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm text-white outline-none"
          />
        </div>

        <!-- Workspace (2 Columns: Left Diagram View, Right Node Inspector) -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 overflow-hidden min-h-[360px]">
          
          <!-- Left: Visual Graph Layout -->
          <div class="md:col-span-7 bg-slate-900/60 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between overflow-y-auto max-h-[460px]">
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Canvas Sequence</span>
              <div class="flex items-center gap-1.5">
                <button id="btn-add-node-start" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-emerald-300 rounded-lg border border-slate-700 font-semibold cursor-pointer">
                  + Start/End
                </button>
                <button id="btn-add-node-proc" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-indigo-300 rounded-lg border border-slate-700 font-semibold cursor-pointer">
                  + Process
                </button>
                <button id="btn-add-node-dec" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 rounded-lg border border-slate-700 font-semibold cursor-pointer">
                  + Decision
                </button>
              </div>
            </div>

            <!-- Visual Flowchart Node Stack -->
            <div id="flowchart-canvas-nodes" class="flex flex-col items-center justify-center gap-2 py-2 flex-1">
              ${this.nodes
                .map((node, i) => {
                  const isSel = node.id === this.selectedNodeId;
                  const nodeType = node.type || "process";
                  const conn = this.connections.find((c) => c.from === node.id);

                  let badgeStyle = "bg-indigo-500/10 text-indigo-300 border-indigo-500/30";
                  let shape = "rounded-xl";
                  if (nodeType === "start" || nodeType === "end") {
                    badgeStyle = "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
                    shape = "rounded-full px-5";
                  } else if (nodeType === "decision") {
                    badgeStyle = "bg-amber-500/10 text-amber-300 border-amber-500/30";
                    shape = "rounded-2xl border-2";
                  } else if (nodeType === "io") {
                    badgeStyle = "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
                    shape = "rounded-lg";
                  }

                  return `
                    <div class="flex flex-col items-center w-full max-w-sm">
                      <div 
                        class="p-3 w-full text-center text-xs font-bold border cursor-pointer transition-all ${shape} ${badgeStyle} ${isSel ? "ring-2 ring-indigo-400 scale-105 shadow-lg shadow-indigo-500/20" : "hover:scale-[1.02]"}"
                        data-action="select-flow-node"
                        data-node-id="${node.id}"
                      >
                        ${escapeHTML(node.text || `Step ${i + 1}`)}
                      </div>

                      ${
                        i < this.nodes.length - 1
                          ? `
                        <div class="flex flex-col items-center my-0.5 text-slate-500">
                          ${
                            conn && conn.label
                              ? `<span class="text-[9px] font-mono px-2 py-0.2 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">${escapeHTML(conn.label)}</span>`
                              : ""
                          }
                          <div class="w-0.5 h-4 bg-gradient-to-b from-indigo-500 to-cyan-400"></div>
                          <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-cyan-400 -mt-1"></i>
                        </div>
                      `
                          : ""
                      }
                    </div>
                  `;
                })
                .join("")}
            </div>
          </div>

          <!-- Right: Selected Node Properties Inspector -->
          <div class="md:col-span-5 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-4 flex flex-col justify-between">
            ${
              selectedNode
                ? `
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span class="text-xs font-bold text-white uppercase tracking-wider">Node Properties</span>
                  <div class="flex items-center gap-1">
                    <button id="btn-dup-node" class="p-1 text-slate-400 hover:text-white rounded transition cursor-pointer" title="Duplicate Node">
                      <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                    </button>
                    <button id="btn-del-node" class="p-1 text-slate-400 hover:text-rose-400 rounded transition cursor-pointer" title="Delete Node">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold text-slate-400 uppercase">Node Text / Label</label>
                  <input 
                    type="text" 
                    id="inspector-node-text" 
                    value="${escapeHTML(selectedNode.text || "")}" 
                    class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold text-slate-400 uppercase">Node Type</label>
                  <select id="inspector-node-type" class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none">
                    <option value="process" ${selectedNode.type === "process" ? "selected" : ""}>Process / Operation (Rectangle)</option>
                    <option value="start" ${selectedNode.type === "start" ? "selected" : ""}>Start Point (Pill)</option>
                    <option value="end" ${selectedNode.type === "end" ? "selected" : ""}>End Point (Pill)</option>
                    <option value="decision" ${selectedNode.type === "decision" ? "selected" : ""}>Decision Point (Branch)</option>
                    <option value="io" ${selectedNode.type === "io" ? "selected" : ""}>Input / Output (Terminal)</option>
                  </select>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold text-slate-400 uppercase">Outgoing Arrow Condition</label>
                  <input 
                    type="text" 
                    id="inspector-branch-label" 
                    value="${escapeHTML(this.connections.find((c) => c.from === selectedNode.id)?.label || "")}" 
                    placeholder="e.g. Yes, No, True, False, or leave empty" 
                    class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            `
                : `
              <div class="text-center text-xs text-slate-500 p-8">Select or create a node</div>
            `
            }

            <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>${this.nodes.length} Nodes in Flow</span>
              <span class="text-indigo-400 font-mono">Structured JSON</span>
            </div>
          </div>

        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-3 shrink-0">
          <button id="btn-cancel-flow" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition cursor-pointer">
            Cancel
          </button>
          <button id="btn-save-flow" class="px-6 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-lg shadow-indigo-600/30">
            Apply Diagram to Lesson
          </button>
        </div>
      </div>
    `;

    this.modalEl = div;
    this._attachListeners();
  }

  _attachListeners() {
    const closeBtn = this.modalEl.querySelector("#btn-close-flowchart");
    const cancelBtn = this.modalEl.querySelector("#btn-cancel-flow");
    const saveBtn = this.modalEl.querySelector("#btn-save-flow");

    if (closeBtn) on(closeBtn, "click", () => this.close());
    if (cancelBtn) on(cancelBtn, "click", () => this.close());

    // Add node buttons
    const addStart = this.modalEl.querySelector("#btn-add-node-start");
    const addProc = this.modalEl.querySelector("#btn-add-node-proc");
    const addDec = this.modalEl.querySelector("#btn-add-node-dec");

    const addNode = (type, defaultText) => {
      const newId = `node_${Date.now()}`;
      const lastNode = this.nodes[this.nodes.length - 1];
      this.nodes.push({ id: newId, text: defaultText, type });
      if (lastNode) {
        this.connections.push({ from: lastNode.id, to: newId, label: "" });
      }
      this.selectedNodeId = newId;
      this._render();
      refreshLucide();
    };

    if (addStart) on(addStart, "click", () => addNode("start", "Start Point"));
    if (addProc) on(addProc, "click", () => addNode("process", "New Execution Step"));
    if (addDec) on(addDec, "click", () => addNode("decision", "Check Condition?"));

    // Save
    if (saveBtn) {
      on(saveBtn, "click", () => {
        const titleInput = this.modalEl.querySelector("#flowchart-title-input");
        const title = titleInput?.value?.trim() || this.title;
        if (typeof this.onSave === "function") {
          this.onSave({
            title,
            nodes: this.nodes,
            connections: this.connections
          });
        }
        this.close();
      });
    }

    // Node selector clicks
    on(this.modalEl, "click", (e) => {
      const nodeEl = e.target.closest("[data-action='select-flow-node']");
      if (nodeEl) {
        this.selectedNodeId = nodeEl.getAttribute("data-node-id");
        this._render();
        refreshLucide();
      }
    });

    // Inspector field edits
    const inspectorText = this.modalEl.querySelector("#inspector-node-text");
    const inspectorType = this.modalEl.querySelector("#inspector-node-type");
    const inspectorBranch = this.modalEl.querySelector("#inspector-branch-label");

    if (inspectorText) {
      on(inspectorText, "input", (e) => {
        const sel = this.nodes.find((n) => n.id === this.selectedNodeId);
        if (sel) {
          sel.text = e.target.value;
          const canvasNode = this.modalEl.querySelector(`[data-node-id="${sel.id}"]`);
          if (canvasNode) canvasNode.textContent = sel.text || "Untitled Step";
        }
      });
    }

    if (inspectorType) {
      on(inspectorType, "change", (e) => {
        const sel = this.nodes.find((n) => n.id === this.selectedNodeId);
        if (sel) {
          sel.type = e.target.value;
          this._render();
          refreshLucide();
        }
      });
    }

    if (inspectorBranch) {
      on(inspectorBranch, "input", (e) => {
        let conn = this.connections.find((c) => c.from === this.selectedNodeId);
        if (!conn) {
          const nextIdx = this.nodes.findIndex((n) => n.id === this.selectedNodeId) + 1;
          const nextNode = this.nodes[nextIdx];
          if (nextNode) {
            conn = { from: this.selectedNodeId, to: nextNode.id, label: "" };
            this.connections.push(conn);
          }
        }
        if (conn) {
          conn.label = e.target.value;
        }
      });
    }

    // Delete node
    const delBtn = this.modalEl.querySelector("#btn-del-node");
    if (delBtn) {
      on(delBtn, "click", () => {
        if (this.nodes.length <= 1) {
          alert("A diagram must contain at least one node.");
          return;
        }
        this.nodes = this.nodes.filter((n) => n.id !== this.selectedNodeId);
        this.connections = this.connections.filter(
          (c) => c.from !== this.selectedNodeId && c.to !== this.selectedNodeId
        );
        this.selectedNodeId = this.nodes[0]?.id || null;
        this._render();
        refreshLucide();
      });
    }

    // Duplicate node
    const dupBtn = this.modalEl.querySelector("#btn-dup-node");
    if (dupBtn) {
      on(dupBtn, "click", () => {
        const orig = this.nodes.find((n) => n.id === this.selectedNodeId);
        if (!orig) return;
        const newId = `node_${Date.now()}`;
        this.nodes.push({ ...orig, id: newId, text: `${orig.text} (Copy)` });
        this.selectedNodeId = newId;
        this._render();
        refreshLucide();
      });
    }
  }
}
