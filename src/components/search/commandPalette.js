// ===================================================
// PATH FORGE - GLOBAL COMMAND PALETTE (CMD + K)
// Instant keyboard navigation, actions & topic search
// ===================================================

import { refreshLucide } from "../../utils/dom.js";

export class CommandPalette {
  /**
   * @param {object} options
   * @param {(action: string, data?: any) => void} options.onAction
   */
  constructor({ onAction }) {
    this.onAction = onAction;
    this.isOpen = false;
    this.selectedIndex = 0;
    this.searchQuery = "";
    this.modalEl = null;

    this.actions = [
      { id: "dashboard", title: "Open Dashboard", category: "Navigation", icon: "layout-dashboard", shortcut: "G D" },
      { id: "roadmap", title: "View Subway Interactive Roadmap", category: "Navigation", icon: "git-branch", shortcut: "G R" },
      { id: "flashcards", title: "Start Spaced Repetition (SM-2) Sprint", category: "Study", icon: "layers", shortcut: "S R" },
      { id: "continue-lesson", title: "Continue Today's Learning Session", category: "Study", icon: "play", shortcut: "Enter" },
      { id: "google-cal", title: "Add Today's Session to Google Calendar", category: "Actions", icon: "calendar", shortcut: "C G" },
      { id: "export-ics", title: "Export Full Schedule to .ics Calendar", category: "Actions", icon: "download", shortcut: "C I" },
      { id: "ats-polish", title: "Polish Resume Bullet (Google XYZ Formula)", category: "Career", icon: "sparkles", shortcut: "A P" },
      { id: "set-goal", title: "Set Career Goal & Diagnose Gaps", category: "Career", icon: "target", shortcut: "G G" },
      { id: "notes", title: "Open Compiled Study Notes", category: "Study", icon: "book-marked", shortcut: "G N" },
      { id: "ask-ai", title: "Ask AI Career Advisor", category: "AI", icon: "bot", shortcut: "A I" }
    ];

    this.initKeyboardListener();
  }

  initKeyboardListener() {
    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.toggle();
      } else if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.isOpen = true;
    this.searchQuery = "";
    this.selectedIndex = 0;
    this.render();
  }

  close() {
    this.isOpen = false;
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
    }
    this.modalEl = null;
  }

  getFilteredActions() {
    if (!this.searchQuery.trim()) return this.actions;
    const q = this.searchQuery.toLowerCase();
    return this.actions.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }

  render() {
    if (!this.modalEl) {
      this.modalEl = document.createElement("div");
      this.modalEl.id = "cmd-palette-modal";
      this.modalEl.className = "fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 cmd-palette-backdrop animate-fade-in";
      document.body.appendChild(this.modalEl);
    }

    const filtered = this.getFilteredActions();
    if (this.selectedIndex >= filtered.length) {
      this.selectedIndex = Math.max(0, filtered.length - 1);
    }

    this.modalEl.innerHTML = `
      <div class="bg-white border border-slate-200/90 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col transition-all">
        <!-- Search Input Bar -->
        <div class="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 shrink-0"></i>
          <input
            id="cmd-palette-input"
            type="text"
            placeholder="Type a command or search (e.g. Flashcards, Roadmap, Calendar)..."
            value="${this.searchQuery}"
            class="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none font-medium"
            autofocus
          />
          <kbd class="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded text-[10px] font-mono shadow-xs">ESC</kbd>
        </div>

        <!-- Action Items List -->
        <div class="max-h-80 overflow-y-auto p-2 space-y-1" id="cmd-palette-list">
          ${
            filtered.length === 0
              ? `<div class="p-8 text-center text-xs text-slate-400">No matching commands found.</div>`
              : filtered
                  .map((item, idx) => {
                    const isSelected = idx === this.selectedIndex;
                    return `
                    <div
                      data-index="${idx}"
                      data-id="${item.id}"
                      class="cmd-item px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition select-none ${
                        isSelected
                          ? "bg-indigo-50 border border-indigo-200/80 text-indigo-900"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }"
                    >
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-7 h-7 rounded-lg ${
                          isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                        } flex items-center justify-center shrink-0">
                          <i data-lucide="${item.icon}" class="w-3.5 h-3.5"></i>
                        </div>
                        <div class="truncate">
                          <div class="text-xs font-semibold truncate">${item.title}</div>
                          <div class="text-[10px] text-slate-400 capitalize">${item.category}</div>
                        </div>
                      </div>
                      ${
                        item.shortcut
                          ? `<kbd class="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-500 font-mono">${item.shortcut}</kbd>`
                          : ""
                      }
                    </div>
                  `;
                  })
                  .join("")
          }
        </div>

        <!-- Footer Shortcuts -->
        <div class="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div class="flex items-center gap-3">
            <span>Use <kbd class="font-mono bg-white px-1 border border-slate-200 rounded">↑</kbd> <kbd class="font-mono bg-white px-1 border border-slate-200 rounded">↓</kbd> to navigate</span>
            <span><kbd class="font-mono bg-white px-1 border border-slate-200 rounded">Enter</kbd> to select</span>
          </div>
          <span>Path Forge Command Center</span>
        </div>
      </div>
    `;

    refreshLucide();
    this.attachEvents();
  }

  attachEvents() {
    const input = document.getElementById("cmd-palette-input");
    if (input) {
      input.focus();
      // Keep cursor at end of input
      input.selectionStart = input.selectionEnd = input.value.length;

      input.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.selectedIndex = 0;
        this.render();
      });

      input.addEventListener("keydown", (e) => {
        const filtered = this.getFilteredActions();
        if (e.key === "ArrowDown") {
          e.preventDefault();
          this.selectedIndex = (this.selectedIndex + 1) % Math.max(1, filtered.length);
          this.render();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.selectedIndex = (this.selectedIndex - 1 + filtered.length) % Math.max(1, filtered.length);
          this.render();
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (filtered[this.selectedIndex]) {
            this.executeAction(filtered[this.selectedIndex].id);
          }
        }
      });
    }

    // Click outside to close
    this.modalEl.addEventListener("click", (e) => {
      if (e.target === this.modalEl) this.close();
    });

    // Item click
    this.modalEl.querySelectorAll(".cmd-item").forEach((el) => {
      el.addEventListener("click", () => {
        const actionId = el.getAttribute("data-id");
        if (actionId) this.executeAction(actionId);
      });
    });
  }

  executeAction(actionId) {
    this.close();
    if (this.onAction) {
      this.onAction(actionId);
    }
  }
}
