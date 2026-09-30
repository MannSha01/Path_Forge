// ===================================================
// PATH FORGE - TODAY'S PLAN WIDGET
// Daily scheduled modules, interactive tasks, SRS sprint & calendar sync
// ===================================================

/**
 * Generates HTML for Today's Scheduled Action Plan.
 * @param {object[]} todayTasks
 * @param {object} [options]
 * @param {object} [options.goal]
 * @param {number} [options.dueCardsCount=0]
 * @param {string} [options.googleCalUrl="#"]
 * @returns {string} HTML string
 */
export function renderTodayPlanWidget(
  todayTasks = [],
  { goal = null, dueCardsCount = 0, googleCalUrl = "#" } = {}
) {
  return `
    <div class="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 bg-white space-y-5 flex flex-col justify-between">
      <div class="space-y-4">
        <!-- Header & Calendar Sync -->
        <div class="flex items-center justify-between flex-wrap gap-2">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <i data-lucide="calendar-check" class="w-4 h-4 text-indigo-600"></i> Today's Action Plan
          </h3>
          <div class="flex items-center gap-1.5">
            <a
              id="btn-google-cal"
              href="${googleCalUrl}"
              target="_blank"
              rel="noopener noreferrer"
              class="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 hover:text-teal-950 rounded-lg border border-teal-200 text-[10px] font-bold flex items-center gap-1 transition active:scale-95 shadow-2xs"
              title="Add today's session to Google Calendar"
            >
              <i data-lucide="calendar" class="w-3 h-3 text-teal-600"></i> Google Cal
            </a>
            <button
              id="btn-export-ics"
              class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-950 rounded-lg border border-emerald-200 text-[10px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs"
              title="Download .ics file for Apple Calendar / Outlook"
            >
              <i data-lucide="download" class="w-3 h-3 text-emerald-600"></i> .ics
            </button>
          </div>
        </div>

        <!-- Task List (Sea Green Tiles) -->
        <div class="space-y-2.5">
          ${(todayTasks.length > 0
            ? todayTasks
            : [
                { title: "Foundations & Architectural Strategy", durationMinutes: 30, type: "lesson", status: "current" },
                { title: "Targeted Concept Practice & Quiz", durationMinutes: 20, type: "practice", status: "next" }
              ]
          )
            .map((task, idx) => {
              const isCurrent = task.status === "current" || idx === 0;
              const typeIcon = task.type === "project" ? "folder-git-2" : task.type === "reinforcement" ? "rotate-ccw" : "book-open";
              const badgeBg =
                task.status === "adapted" || task.adapted
                  ? "bg-teal-100 text-teal-900 border-teal-300"
                  : task.type === "reinforcement" || task.status === "needs_revision"
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-emerald-100 text-emerald-900 border-emerald-300";

              const badgeLabel =
                task.status === "adapted" || task.adapted
                  ? "Adapted for you ✨"
                  : task.status || "Scheduled";

              const cardBg = isCurrent
                ? "bg-teal-50/90 border-teal-300 ring-2 ring-teal-500/20 shadow-xs"
                : "bg-emerald-50/40 border-emerald-200/70 hover:border-emerald-300";

              return `
                <div class="p-3.5 rounded-2xl border ${cardBg} flex items-center justify-between gap-3 transition">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-8 h-8 rounded-xl ${isCurrent ? "bg-teal-600 text-white" : "bg-white border border-emerald-200 text-teal-700"} flex items-center justify-center shrink-0 shadow-2xs">
                      <i data-lucide="${typeIcon}" class="w-4 h-4"></i>
                    </div>
                    <div class="truncate">
                      <h4 class="text-xs font-bold text-slate-800 truncate">${idx + 1}. ${task.title}</h4>
                      <p class="text-[11px] text-slate-500 capitalize">${task.type} • ${task.durationMinutes} min</p>
                    </div>
                  </div>
                  <span class="text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold shrink-0 ${badgeBg}">
                    ${badgeLabel}
                  </span>
                </div>
              `;
            })
            .join("")}
        </div>

        <!-- Spaced Repetition (SM-2) Flashcard Widget (Sea Green Emerald Accent) -->
        <div class="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50/90 via-emerald-50/70 to-teal-50/90 border border-teal-200/90 flex items-center justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0">
              <i data-lucide="layers" class="w-4 h-4"></i>
            </div>
            <div class="truncate">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-extrabold text-teal-950">Daily Flashcard Sprint</span>
                <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold border border-teal-200">SM-2</span>
              </div>
              <p class="text-[11px] text-teal-900/80 font-medium">
                ${dueCardsCount > 0 ? `${dueCardsCount} concepts due for recall today` : "All concepts retained for today"}
              </p>
            </div>
          </div>
          <button
            id="btn-start-srs-review"
            class="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
          >
            <i data-lucide="zap" class="w-3 h-3"></i>
            <span>${dueCardsCount > 0 ? "Review Now" : "Practice"}</span>
          </button>
        </div>
      </div>

      <button
        id="dashboard-continue-learning-btn"
        class="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 mt-2"
      >
        <i data-lucide="play" class="w-4 h-4 fill-white"></i>
        <span>CONTINUE LEARNING SESSION</span>
      </button>
    </div>
  `;
}
