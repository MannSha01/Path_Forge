// ===================================================
// PATH FORGE - NOTES VIEWER COMPONENT
// Lists all saved lesson notes & study guides
// ===================================================

import { $, refreshLucide } from "../../utils/dom.js";
import { databaseService } from "../../services/database/databaseService.js";
import { renderNoteDetail } from "./notes.js";

export async function renderNotesList(userId, containerSelector = "#notes-list-container") {
  const container = $(containerSelector);
  if (!container) return;

  const notes = await databaseService.getNotesByUserId(userId);

  if (notes.length === 0) {
    container.innerHTML = `
      <div class="glass-card rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 border border-slate-800">
        <i data-lucide="file-text" class="w-10 h-10 text-slate-600 mx-auto"></i>
        <h3 class="text-base font-bold text-white">No Notes Saved Yet</h3>
        <p class="text-xs text-slate-400">Complete an adaptive learning session to automatically generate and save structured study guides.</p>
      </div>
    `;
    refreshLucide();
    return;
  }

  container.innerHTML = `
    <div class="space-y-4 max-w-4xl mx-auto text-left">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <i data-lucide="book-marked" class="w-4 h-4 text-indigo-400"></i> My Study Notes Library
        </h3>
        <span class="text-xs text-slate-500 font-medium">${notes.length} Guides Saved</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        ${notes
          .map(
            (n) => `
          <div
            data-note-id="${n.noteId}"
            class="note-card glass-card glass-card-hover p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3 cursor-pointer group"
          >
            <div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase">
                ${new Date(n.createdAt).toLocaleDateString()}
              </span>
              <h4 class="text-base font-bold text-white group-hover:text-indigo-300 transition mt-2 truncate">${n.title}</h4>
              <p class="text-xs text-slate-400 line-clamp-2 mt-1">${n.summary}</p>
            </div>

            <div class="flex items-center justify-between text-xs text-indigo-400 font-semibold pt-2 border-t border-slate-800/80">
              <span>View Guide</span>
              <i data-lucide="chevron-right" class="w-4 h-4 group-hover:translate-x-1 transition"></i>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;

  refreshLucide();

  container.querySelectorAll(".note-card").forEach((card) => {
    card.addEventListener("click", () => {
      const noteId = card.getAttribute("data-note-id");
      const selectedNote = notes.find((n) => n.noteId === noteId);
      if (selectedNote) {
        $("#notes-list-view")?.classList.add("hidden");
        $("#notes-detail-view")?.classList.remove("hidden");
        renderNoteDetail(selectedNote, () => {
          $("#notes-detail-view")?.classList.add("hidden");
          $("#notes-list-view")?.classList.remove("hidden");
          renderNotesList(userId, containerSelector);
        });
      }
    });
  });
}
