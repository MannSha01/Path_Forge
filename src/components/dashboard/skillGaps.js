// ===================================================
// PATH FORGE - SKILL GAPS WIDGET
// Live skill mastery bars, confidence & revision flags
// ===================================================

/**
 * Generates HTML for the Skill Profile & Gap Tracker.
 * @param {Record<string, object>} skillProfile
 * @returns {string} HTML string
 */
export function renderSkillGapsWidget(skillProfile = {}) {
  const entries = Object.values(skillProfile);

  if (entries.length === 0) {
    return `
      <div class="glass-card rounded-3xl p-6 border border-slate-800 text-center py-8">
        <p class="text-xs text-slate-400">No skill gaps tracked yet. Complete your Goal Setup to generate your skill profile.</p>
      </div>
    `;
  }

  return `
    <div class="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <i data-lucide="bar-chart-2" class="w-4 h-4 text-indigo-400"></i> Active Skill Profile
        </h3>
        <span class="text-xs text-slate-500 font-medium">${entries.length} Tracked Skills</span>
      </div>

      <div class="space-y-3.5 pt-1">
        ${entries
          .map((s) => {
            const isRevision = s.needsRevision;
            const isAccelerated = s.accelerated;
            const barColor = isRevision
              ? "from-rose-500 to-amber-500"
              : isAccelerated
              ? "from-indigo-500 via-cyan-400 to-emerald-400"
              : "from-indigo-500 to-cyan-500";

            return `
              <div class="space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-slate-200">${s.skill}</span>
                    ${isRevision ? '<span class="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">Needs Revision</span>' : ""}
                    ${isAccelerated ? '<span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Accelerated ⚡</span>' : ""}
                  </div>
                  <span class="font-mono text-slate-400 font-bold">${s.mastery}%</span>
                </div>
                <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
                  <div class="bg-gradient-to-r ${barColor} h-full rounded-full transition-all duration-500" style="width: ${s.mastery}%"></div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}
