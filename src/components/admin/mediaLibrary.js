// ===================================================
// PATH FORGE - ADMIN MEDIA LIBRARY
// Image assets manager with upload, preview, search, and selection
// ===================================================

import { $, on, refreshLucide, escapeHTML } from "../../utils/dom.js";
import { databaseService } from "../../services/database/databaseService.js";

export class MediaLibrary {
  constructor({ onSelectMedia }) {
    this.onSelectMedia = onSelectMedia;
    this.modalEl = null;
    this.mediaAssets = [];
    this.searchQuery = "";
  }

  async open({ selectMode = false } = {}) {
    this.selectMode = selectMode;
    await this.loadMedia();
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

  async loadMedia() {
    this.mediaAssets = await databaseService.getMediaLibrary();
  }

  _render() {
    const existing = $("#pf-media-modal");
    if (existing) existing.remove();

    const filtered = this.mediaAssets.filter((m) =>
      (m.name || "").toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    const div = document.createElement("div");
    div.id = "pf-media-modal";
    div.className = "fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-200";
    div.innerHTML = `
      <div class="glass-card rounded-3xl max-w-4xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative border border-slate-800 text-left max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <i data-lucide="image" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-black text-white">Media Assets Library</h3>
              <p class="text-[11px] text-slate-400">Manage, preview and insert images across learning modules</p>
            </div>
          </div>
          <button id="btn-close-media" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Controls: Search & Upload Area -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div class="relative w-full sm:w-72">
            <i data-lucide="search" class="w-4 h-4 text-slate-500 absolute left-3 top-2.5"></i>
            <input 
              type="text" 
              id="media-search-input" 
              value="${escapeHTML(this.searchQuery)}"
              placeholder="Search images..." 
              class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <label class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95">
              <i data-lucide="upload-cloud" class="w-4 h-4"></i>
              <span>Upload Image</span>
              <input type="file" id="media-file-input" accept="image/*" class="hidden" />
            </label>
          </div>
        </div>

        <!-- Media Grid Content -->
        <div class="flex-1 overflow-y-auto min-h-[300px] max-h-[450px] pr-1">
          ${
            filtered.length === 0
              ? `
            <div class="p-12 text-center border border-dashed border-slate-800 rounded-2xl space-y-3">
              <i data-lucide="image-off" class="w-10 h-10 text-slate-600 mx-auto"></i>
              <div class="text-xs text-slate-400 font-medium">No media assets found.</div>
              <p class="text-[11px] text-slate-500">Upload your first course illustration or diagram above.</p>
            </div>
          `
              : `
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              ${filtered
                .map(
                  (asset) => `
                <div class="pf-media-card rounded-2xl bg-slate-900/60 border border-slate-800/80 p-2.5 space-y-2 hover:border-indigo-500/50 transition group flex flex-col justify-between" data-media-id="${asset.id}">
                  <div class="aspect-video rounded-xl bg-slate-950 overflow-hidden border border-slate-800/60 relative flex items-center justify-center">
                    <img 
                      src="${escapeHTML(asset.url)}" 
                      alt="${escapeHTML(asset.name)}" 
                      loading="lazy"
                      class="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      onerror="this.onerror=null; this.src='https://placehold.co/400x300/0f172a/6366f1?text=Image';"
                    />
                    ${
                      this.selectMode
                        ? `
                      <button 
                        class="absolute inset-0 bg-indigo-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition cursor-pointer"
                        data-action="select-asset"
                        data-media-id="${asset.id}"
                      >
                        Insert Image
                      </button>
                    `
                        : ""
                    }
                  </div>

                  <div class="space-y-1">
                    <div class="text-xs font-bold text-white truncate" title="${escapeHTML(asset.name)}">${escapeHTML(asset.name)}</div>
                    <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>${asset.size ? `${Math.round(asset.size / 1024)} KB` : "Image"}</span>
                      <span>${new Date(asset.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <button 
                      class="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                      data-action="copy-url"
                      data-url="${escapeHTML(asset.url)}"
                    >
                      Copy URL
                    </button>
                    <button 
                      class="p-1 rounded text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      data-action="delete-asset"
                      data-media-id="${asset.id}"
                      title="Delete asset"
                    >
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          `
          }
        </div>

        <!-- Footer -->
        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>${filtered.length} Asset(s) Indexed</span>
          <button id="btn-cancel-media" class="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition cursor-pointer">
            Close
          </button>
        </div>
      </div>
    `;

    this.modalEl = div;
    this._attachListeners();
  }

  _attachListeners() {
    const closeBtn = this.modalEl.querySelector("#btn-close-media");
    const cancelBtn = this.modalEl.querySelector("#btn-cancel-media");
    const fileInput = this.modalEl.querySelector("#media-file-input");
    const searchInput = this.modalEl.querySelector("#media-search-input");

    if (closeBtn) on(closeBtn, "click", () => this.close());
    if (cancelBtn) on(cancelBtn, "click", () => this.close());

    if (searchInput) {
      on(searchInput, "input", (e) => {
        this.searchQuery = e.target.value;
        this._render();
        refreshLucide();
      });
    }

    if (fileInput) {
      on(fileInput, "change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target.result;
          await databaseService.saveMedia({
            name: file.name,
            url: dataUrl,
            size: file.size,
            type: file.type
          });
          await this.loadMedia();
          this._render();
          refreshLucide();
        };
        reader.readAsDataURL(file);
      });
    }

    on(this.modalEl, "click", async (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;

      const action = btn.getAttribute("data-action");
      const mediaId = btn.getAttribute("data-media-id");

      if (action === "copy-url") {
        const url = btn.getAttribute("data-url");
        navigator.clipboard.writeText(url);
        const originalText = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = originalText), 1500);
      } else if (action === "select-asset") {
        const asset = this.mediaAssets.find((m) => m.id === mediaId);
        if (asset && typeof this.onSelectMedia === "function") {
          this.onSelectMedia(asset);
        }
        this.close();
      } else if (action === "delete-asset") {
        if (confirm("Are you sure you want to delete this media asset?")) {
          await databaseService.deleteMedia(mediaId);
          await this.loadMedia();
          this._render();
          refreshLucide();
        }
      }
    });
  }
}
