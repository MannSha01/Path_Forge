// ===================================================
// PATH FORGE - READINESS WIDGET (NORDIC SLATE)
// Job readiness percentage, deadline countdown & minutes tracker
// ===================================================

/**
 * Generates HTML for the Job Readiness & Deadline overview card.
 * @param {object} params
 * @param {string} params.targetRole
 * @param {string} params.targetCompany
 * @param {number} params.readinessPercent
 * @param {number} params.daysRemaining
 * @param {number} params.todayMinutesSpent
 * @param {number} params.targetDailyMinutes
 * @returns {string} HTML string
 */
export function renderReadinessWidget({
  targetRole = "Candidate",
  targetCompany = "Target Company",
  readinessPercent = 0,
  daysRemaining = 60,
  todayMinutesSpent = 0,
  targetDailyMinutes = 60
}) {
  return `
    <div class="glass-card rounded-3xl p-6 sm:p-7 relative overflow-hidden border border-slate-200/90 bg-white">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <i data-lucide="target" class="w-3.5 h-3.5"></i> Target Objective
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">${targetRole}</h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">Target Organization: <span class="text-slate-800 font-semibold">${targetCompany}</span></p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 self-stretch lg:self-auto">
          <!-- Readiness Meter -->
          <div class="bg-emerald-50/80 border border-emerald-200/90 p-3.5 rounded-2xl text-center shadow-xs">
            <span class="text-2xl sm:text-3xl font-black text-emerald-700">
              ${readinessPercent}%
            </span>
            <p class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800/80 mt-0.5">Job Readiness</p>
          </div>

          <!-- Days Remaining -->
          <div class="bg-sky-50/80 border border-sky-200/90 p-3.5 rounded-2xl text-center shadow-xs">
            <span class="text-2xl sm:text-3xl font-black text-sky-900">
              ${daysRemaining}
            </span>
            <p class="text-[10px] font-extrabold uppercase tracking-wider text-sky-800/80 mt-0.5">Days Left</p>
          </div>

          <!-- Today Study Time -->
          <div class="col-span-2 sm:col-span-1 bg-indigo-50/80 border border-indigo-200/90 p-3.5 rounded-2xl text-center shadow-xs">
            <span class="text-xl sm:text-2xl font-black text-indigo-700">
              ${todayMinutesSpent}m / ${targetDailyMinutes}m
            </span>
            <p class="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800/80 mt-0.5">Today's Study</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
