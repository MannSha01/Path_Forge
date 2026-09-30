// ===================================================
// PATH FORGE - SUBWAY TRANSIT ROADMAP COMPONENT
// Interactive transit-style skill tree with branching adaptations
// ===================================================

import { $, refreshLucide } from "../../utils/dom.js";

/**
 * Renders the Interactive Subway Transit Roadmap.
 *
 * @param {object} params
 * @param {string} params.title - Target role / track title
 * @param {string} params.categoryName - Company or domain
 * @param {object[]} params.items - Scheduled curriculum items
 * @param {Record<string, boolean>} [params.completedMap={}] - Completed topic IDs
 * @param {(item: object, checked: boolean) => void} [params.onToggleCheck]
 * @param {(item: object) => void} [params.onLaunchLesson]
 */
export function renderSubwayRoadmap({
  title = "Full Stack Pathway",
  categoryName = "Adaptive Preparation",
  items = [],
  completedMap = {},
  onToggleCheck,
  onLaunchLesson
}) {
  const container = $("#roadmap-content");
  if (!container) return;

  const totalTopics = items.length;
  const completedCount = items.filter((i) => completedMap[i.topicId || i.id]).length;
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  container.innerHTML = `
    <div class="space-y-6 max-w-5xl mx-auto">
      <!-- Roadmap Header & Metric Banner -->
      <div class="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 space-y-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <i data-lucide="git-branch" class="w-3.5 h-3.5"></i> Interactive Transit Map
              </span>
              <span class="text-xs text-slate-500 font-medium">${categoryName}</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">${title}</h2>
          </div>

          <div class="flex items-center gap-4 bg-teal-50/90 px-5 py-3 rounded-2xl border border-teal-200/90 self-stretch sm:self-auto justify-between shadow-xs">
            <div>
              <span class="text-2xl font-black text-teal-700">${completedCount} / ${totalTopics}</span>
              <p class="text-[10px] font-extrabold uppercase tracking-wider text-teal-900/80">Stations Cleared</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              ${progressPercent}%
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-3 text-xs pt-1">
          <span class="text-slate-500 font-bold uppercase text-[10px]">Transit Legend:</span>
          <span class="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Completed
          </span>
          <span class="inline-flex items-center gap-1.5 text-teal-900 bg-teal-100 px-2 py-0.5 rounded-md border border-teal-300 font-bold">
            <span class="w-2 h-2 rounded-full bg-teal-600 animate-ping"></span> You Are Here
          </span>
          <span class="inline-flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-semibold">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span> Adapted / Loop
          </span>
          <span class="inline-flex items-center gap-1.5 text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 font-semibold">
            <span class="w-2 h-2 rounded-full bg-teal-500"></span> Scheduled Ahead
          </span>
        </div>
      </div>

      <!-- Subway Transit Rail View -->
      <div class="relative pl-6 sm:pl-10 space-y-6 pt-2 pb-8">
        <!-- Vertical Subway Connecting Rail -->
        <div class="absolute left-10 sm:left-14 top-4 bottom-4 w-1.5 bg-slate-200 rounded-full"></div>

        <!-- Stations List -->
        ${items
          .map((item, idx) => {
            const itemId = item.topicId || item.id || `topic_${idx}`;
            const isCompleted = Boolean(completedMap[itemId]);
            const isCurrent = item.status === "current" && !isCompleted;
            const isAdapted = item.status === "adapted" || item.adapted || item.status === "needs_revision";

            let stationRingColor = "border-teal-300 bg-teal-50 text-teal-700";
            let lineAccent = "border-l-4 border-l-teal-500";
            let statusBadge = `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">Scheduled Ahead</span>`;
            let cardTint = "bg-teal-50/20";

            if (isCompleted) {
              stationRingColor = "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20";
              lineAccent = "border-l-4 border-l-emerald-500";
              statusBadge = `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> Completed</span>`;
              cardTint = "bg-emerald-50/30";
            } else if (isCurrent) {
              stationRingColor = "border-teal-600 bg-teal-600 text-white ring-4 ring-teal-100 shadow-md shadow-teal-600/30";
              lineAccent = "border-l-4 border-l-teal-600";
              statusBadge = `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 border border-teal-300 flex items-center gap-1 animate-pulse font-extrabold">You Are Here</span>`;
              cardTint = "bg-teal-50/70 ring-1 ring-teal-500/20";
            } else if (isAdapted) {
              stationRingColor = "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20";
              lineAccent = "border-l-4 border-l-amber-500";
              statusBadge = `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">Reinforcement Loop ✨</span>`;
              cardTint = "bg-amber-50/30";
            }

            return `
              <div class="relative flex items-start gap-4 sm:gap-6 group">
                <!-- Station Node Circle on the Rail -->
                <div class="relative z-10 w-8 h-8 rounded-full border-2 ${stationRingColor} flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-transform duration-200 group-hover:scale-110">
                  ${isCompleted ? `<i data-lucide="check" class="w-4 h-4"></i>` : idx + 1}
                </div>

                <!-- Station Card -->
                <div class="flex-grow glass-card ${cardTint} p-4 sm:p-5 rounded-2xl ${lineAccent} space-y-2 hover:border-slate-300 transition-all shadow-xs">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div class="flex items-center gap-2 flex-wrap">
                        <h4 class="text-sm sm:text-base font-bold text-slate-900 group-hover:text-teal-600 transition">
                          ${item.title}
                        </h4>
                        ${statusBadge}
                      </div>
                      <p class="text-xs text-slate-500 mt-0.5">
                        ${item.skill || item.category || "Core Concept"} • ${item.durationMinutes || 45} mins
                      </p>
                    </div>

                    <!-- Action Trigger -->
                    <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        data-topic-id="${itemId}"
                        class="subway-launch-btn px-3.5 py-1.5 ${
                          isCurrent
                            ? "bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs"
                            : "bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold"
                        } text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <i data-lucide="${isCurrent ? "play" : "book-open"}" class="w-3.5 h-3.5"></i>
                        <span>${isCurrent ? "Start Station" : "Review"}</span>
                      </button>
                    </div>
                  </div>

                  ${
                    item.adaptationReason
                      ? `<div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
                          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-600 shrink-0"></i>
                          <span>${item.adaptationReason}</span>
                        </div>`
                      : ""
                  }
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;

  refreshLucide();

  // Attach launch event listeners
  container.querySelectorAll(".subway-launch-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const topicId = btn.getAttribute("data-topic-id");
      const matchedItem = items.find((i) => (i.topicId || i.id) === topicId);
      if (matchedItem && onLaunchLesson) {
        onLaunchLesson(matchedItem);
      }
    });
  });
}
