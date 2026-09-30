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
              class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200 text-[10px] font-bold flex items-center gap-1 transition active:scale-95"
              title="Add today's session to Google Calendar"
            >
              <i data-lucide="calendar" class="w-3 h-3 text-sky-600"></i> Google Cal
            </a>
            <button
              id="btn-export-ics"
              class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200 text-[10px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer"
              title="Download .ics file for Apple Calendar / Outlook"
            >
              <i data-lucide="download" class="w-3 h-3 text-indigo-600"></i> .ics
            </button>
          </div>
        </div>

        <!-- Task List -->
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
                  ? "bg-sky-50 text-sky-700 border-sky-200"
                  : task.type === "reinforcement" || task.status === "needs_revision"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200";

              const badgeLabel =
                task.status === "adapted" || task.adapted
                  ? "Adapted for you ✨"
                  : task.status || "Scheduled";

              return `
                <div class="p-3.5 rounded-2xl bg-slate-50 border ${isCurrent ? "border-indigo-300 ring-2 ring-indigo-500/10 shadow-xs" : "border-slate-200/80"} flex items-center justify-between gap-3 transition">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-8 h-8 rounded-xl ${isCurrent ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600"} flex items-center justify-center shrink-0">
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

        <!-- Spaced Repetition (SM-2) Flashcard Widget -->
        <div class="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
              <i data-lucide="layers" class="w-4 h-4"></i>
            </div>
            <div class="truncate">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-extrabold text-slate-900">Daily Flashcard Sprint</span>
                <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">SM-2</span>
              </div>
              <p class="text-[11px] text-slate-500">
                ${dueCardsCount > 0 ? `${dueCardsCount} concepts due for recall today` : "All concepts retained for today"}
              </p>
            </div>
          </div>
          <button
            id="btn-start-srs-review"
            class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
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
