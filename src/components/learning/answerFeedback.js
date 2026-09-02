// ===================================================
// PATH FORGE - ANSWER FEEDBACK COMPONENT
// Evaluation result card, misconception analysis & skill delta badge
// ===================================================

/**
 * Generates HTML for the immediate answer evaluation feedback card.
 * @param {object} params
 * @param {boolean} params.isCorrect
 * @param {string} params.explanation
 * @param {number} params.masteryDelta
 * @param {string} params.status
 * @returns {string}
 */
export function renderFeedbackContent({ isCorrect, explanation, masteryDelta, status }) {
  const badgeColor = isCorrect ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30";
  const deltaText = masteryDelta >= 0 ? `+${masteryDelta}%` : `${masteryDelta}%`;
  const deltaColor = masteryDelta >= 0 ? "text-emerald-400" : "text-rose-400";

  return `
    <div class="space-y-5 text-left">
      <div class="p-4 rounded-2xl ${isCorrect ? "bg-emerald-950/30 border border-emerald-500/30" : "bg-rose-950/30 border border-rose-500/30"} space-y-2">
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase border ${badgeColor}">
            <i data-lucide="${isCorrect ? "check-circle" : "x-circle"}" class="w-3.5 h-3.5"></i>
            ${isCorrect ? "Correct Concept Application" : "Conceptual Misconception Identified"}
          </span>
          <span class="text-xs font-mono font-bold ${deltaColor}">Skill Mastery: ${deltaText}</span>
        </div>
        <p class="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
          ${explanation}
        </p>
      </div>

      ${status === "needs_revision" ? `
        <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
          <i data-lucide="refresh-cw" class="w-4 h-4 shrink-0"></i>
          <span>Adaptive Scheduler has dynamically scheduled targeted reinforcement for this skill.</span>
        </div>
      ` : ""}

      ${status === "accelerated" ? `
        <div class="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
          <i data-lucide="zap" class="w-4 h-4 shrink-0 text-amber-400"></i>
          <span>Strong streak! Adaptive Scheduler has accelerated your prerequisite pathway.</span>
        </div>
      ` : ""}

      <button
        id="next-session-step-btn"
        class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
      >
        <span>Continue Learning Session</span>
        <i data-lucide="arrow-right" class="w-4 h-4"></i>
      </button>
    </div>
  `;
}
