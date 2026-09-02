// ===================================================
// PATH FORGE - READINESS WIDGET
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
    <div class="glass-card rounded-3xl p-6 sm:p-7 relative overflow-hidden border border-slate-800">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <i data-lucide="target" class="w-3.5 h-3.5"></i> Target Objective
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">${targetRole}</h2>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">Target Organization: <span class="text-slate-200 font-semibold">${targetCompany}</span></p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 self-stretch lg:self-auto">
          <!-- Readiness Meter -->
          <div class="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-2xl text-center">
            <span class="text-2xl sm:text-3xl font-black bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              ${readinessPercent}%
            </span>
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Job Readiness</p>
          </div>

          <!-- Days Remaining -->
          <div class="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-2xl text-center">
            <span class="text-2xl sm:text-3xl font-black text-white">
              ${daysRemaining}
            </span>
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Days Left</p>
          </div>

          <!-- Today Study Time -->
          <div class="col-span-2 sm:col-span-1 bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-2xl text-center">
            <span class="text-xl sm:text-2xl font-black text-indigo-300">
              ${todayMinutesSpent}m / ${targetDailyMinutes}m
            </span>
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Today's Study</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
