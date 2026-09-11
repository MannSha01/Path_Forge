// ===================================================
// PATH FORGE - ADMIN LIVE PREVIEW PANE
// Real-time student experience simulator with device viewports
// ===================================================

import { $, on, refreshLucide, escapeHTML } from "../../utils/dom.js";
import { ContentRenderer } from "../content/contentRenderer.js";

export class LivePreview {
  constructor({ containerId }) {
    this.container = typeof containerId === "string" ? $(containerId) : containerId;
    this.viewportMode = "desktop"; // desktop | tablet | mobile
    this.currentModule = null;
    this.currentTopic = null;
    this.currentBlocks = [];
  }

  update({ module, topic, blocks = [] }) {
    this.currentModule = module;
    this.currentTopic = topic;
    this.currentBlocks = blocks;
    this.render();
  }

  setViewportMode(mode) {
    this.viewportMode = mode;
    this.render();
  }

  render() {
    if (!this.container) return;

    const module = this.currentModule || {
      title: "Select a Module to Preview",
      description: "Click any topic or module in the left sidebar to start editing.",
      estimatedMinutes: 20,
      difficulty: "Beginner"
    };

    const topic = this.currentTopic || { title: "Topic" };
    const blocks = this.currentBlocks || [];

    let viewportClass = "w-full";
    if (this.viewportMode === "tablet") viewportClass = "max-w-[768px] mx-auto border-x-4 border-slate-800 rounded-3xl";
    if (this.viewportMode === "mobile") viewportClass = "max-w-[375px] mx-auto border-4 border-slate-800 rounded-[36px]";

    this.container.innerHTML = `
      <div class="pf-live-preview-wrapper flex flex-col h-full space-y-3 text-left">
        
        <!-- Preview Header & Device Switcher -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0 px-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-xs font-black uppercase tracking-wider text-slate-300">Student Live Preview</span>
          </div>

          <!-- Viewport Mode Buttons -->
          <div class="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-xl border border-slate-800 text-[11px]">
            <button 
              class="px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                this.viewportMode === "desktop"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }"
              data-action="preview-desktop"
              title="Desktop View (100%)"
            >
              <i data-lucide="monitor" class="w-3.5 h-3.5"></i>
              <span class="hidden sm:inline">Desktop</span>
            </button>
            <button 
              class="px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                this.viewportMode === "tablet"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }"
              data-action="preview-tablet"
              title="Tablet View (768px)"
            >
              <i data-lucide="tablet" class="w-3.5 h-3.5"></i>
              <span class="hidden sm:inline">Tablet</span>
            </button>
            <button 
              class="px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                this.viewportMode === "mobile"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }"
              data-action="preview-mobile"
              title="Mobile View (375px)"
            >
              <i data-lucide="smartphone" class="w-3.5 h-3.5"></i>
              <span class="hidden sm:inline">Mobile</span>
            </button>
          </div>
        </div>

        <!-- Simulated Student Viewport Container -->
        <div class="flex-1 overflow-y-auto max-h-[calc(100vh-230px)] p-1">
          <div class="pf-student-canvas ${viewportClass} bg-slate-950/90 rounded-2xl border border-slate-800/80 p-5 sm:p-7 space-y-6 shadow-2xl transition-all duration-300">
            
            <!-- Student Header Banner -->
            <div class="space-y-3 border-b border-slate-800 pb-5">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                    ${escapeHTML(topic.title || "Topic")}
                  </span>
                  <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <i data-lucide="clock" class="w-3 h-3"></i>
                    <span>${module.estimatedMinutes || 20} Min Study</span>
                  </span>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  module.difficulty === "Advanced"
                    ? "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                    : module.difficulty === "Intermediate"
                    ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                }">
                  ${escapeHTML(module.difficulty || "Beginner")}
                </span>
              </div>

              <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
                ${escapeHTML(module.title)}
              </h2>

              ${
                module.description
                  ? `
                <div class="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
                  <span class="font-bold text-cyan-300">Core Objective:</span> ${escapeHTML(module.description)}
                </div>
              `
                  : ""
              }
            </div>

            <!-- Content Stream -->
            <div id="preview-content-stream">
              ${ContentRenderer.render(blocks)}
            </div>

            <!-- Simulated Completion Button -->
            <div class="pt-5 border-t border-slate-800 flex items-center justify-between gap-3 text-slate-400 text-xs">
              <span>Ready for assessment?</span>
              <button class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 opacity-90 cursor-default">
                <span>Complete Topic</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </button>
            </div>

          </div>
        </div>

      </div>
    `;

    refreshLucide();
    this._attachListeners();
  }

  _attachListeners() {
    on(this.container, "click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;

      const action = btn.getAttribute("data-action");
      if (action === "preview-desktop") this.setViewportMode("desktop");
      if (action === "preview-tablet") this.setViewportMode("tablet");
      if (action === "preview-mobile") this.setViewportMode("mobile");
    });
  }
}
