// ===================================================
// PATH FORGE - PRACTICE QUESTION COMPONENT
// Scenario-based evaluation card with selectable option buttons
// ===================================================

/**
 * Generates HTML for an interactive practice question.
 * @param {object} question
 * @param {number} questionIndex
 * @param {number} totalQuestions
 * @returns {string}
 */
export function renderQuestionContent(question, questionIndex = 1, totalQuestions = 1) {
  const diffBadgeColor =
    question.difficulty === "hard" || question.difficulty === "interview"
      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
      : question.difficulty === "medium"
      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

  return `
    <div class="space-y-5 text-left">
      <div class="flex items-center justify-between border-b border-slate-200 pb-3">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wider">
            Evaluation ${questionIndex} of ${totalQuestions}
          </span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${diffBadgeColor}">
            ${question.difficulty || "medium"}
          </span>
        </div>
        <span class="text-xs text-slate-500 font-medium">Concept: ${question.conceptTested || question.skill}</span>
      </div>

      <h3 class="text-base sm:text-lg font-bold text-slate-900 leading-snug">
        ${question.question}
      </h3>

      <div class="space-y-2.5 pt-2">
        ${question.options
          .map(
            (opt, i) => `
          <button
            data-option-index="${i}"
            class="practice-option-btn w-full text-left p-4 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-400 text-slate-900 text-xs sm:text-sm font-medium shadow-xs transition flex items-center justify-between group cursor-pointer"
          >
            <span>${opt}</span>
            <span class="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-xs text-slate-600 group-hover:border-teal-500 group-hover:text-teal-700">
              ${String.fromCharCode(65 + i)}
            </span>
          </button>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}
