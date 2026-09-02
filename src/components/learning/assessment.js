// ===================================================
// PATH FORGE - ASSESSMENT VIEWER & RESULTS COMPONENT
// 3-MCQ topic assessments, 5-6 question cumulative assessments & adaptation feedback
// ===================================================

/**
 * Generates HTML for the question evaluation stage.
 *
 * @param {object} params
 * @param {object} params.question
 * @param {number} params.currentIndex - 0-indexed
 * @param {number} params.totalQuestions - default 3
 * @param {number | null} params.selectedOptionIndex
 * @param {number[]} params.allAnswers - array of selected indices
 * @param {"topic" | "cumulative"} [params.assessmentType="topic"]
 * @returns {string}
 */
export function renderAssessmentQuestion({
  question,
  currentIndex = 0,
  totalQuestions = 3,
  selectedOptionIndex = null,
  allAnswers = [],
  assessmentType = "topic"
}) {
  const diffBadgeColor =
    question.difficulty === "hard" || question.difficulty === "interview"
      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
      : question.difficulty === "medium"
      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isCumulative = assessmentType === "cumulative";

  return `
    <div class="space-y-6 text-left">
      <!-- Stepper & Badges -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isCumulative ? "bg-amber-500/10 text-amber-300 border-amber-500/30" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"} uppercase tracking-wider">
            ${isCumulative ? "Cumulative Milestone" : "Evaluation"} ${currentIndex + 1} of ${totalQuestions}
          </span>
          <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${diffBadgeColor}">
            ${question.difficulty || "medium"}
          </span>
        </div>
        <span class="text-xs text-slate-400 font-medium">Concept: <strong class="text-slate-200">${question.concept || question.skill}</strong></span>
      </div>

      <!-- Question Progress Dots -->
      <div class="flex items-center gap-2">
        ${Array.from({ length: totalQuestions }).map((_, idx) => {
          const isAnswered = allAnswers[idx] !== null && allAnswers[idx] !== undefined;
          const isCurrent = idx === currentIndex;
          const bg = isCurrent
            ? "bg-indigo-500 ring-2 ring-indigo-400/40"
            : isAnswered
            ? "bg-cyan-500"
            : "bg-slate-800";
          return `<button data-jump-index="${idx}" class="jump-dot-btn flex-1 h-2 rounded-full transition-all ${bg} cursor-pointer hover:opacity-80"></button>`;
        }).join("")}
      </div>

      <!-- Question Statement -->
      <div class="space-y-2">
        <h3 class="text-base sm:text-lg font-bold text-white leading-relaxed">
          ${question.question}
        </h3>
      </div>

      <!-- 4 Multiple Choice Options -->
      <div class="space-y-3 pt-2">
        ${(question.options || []).map((opt, optIdx) => {
          const isSelected = selectedOptionIndex === optIdx;
          const selectedClasses = isSelected
            ? "border-indigo-500 bg-indigo-600/20 text-white ring-1 ring-indigo-500/50"
            : "border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60";

          return `
            <button
              data-option-index="${optIdx}"
              class="mcq-option-btn w-full text-left p-4 rounded-xl border ${selectedClasses} text-xs sm:text-sm font-medium transition-all flex items-center justify-between group cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-lg ${isSelected ? "bg-indigo-600 text-white border-indigo-400" : "bg-slate-900 text-slate-400 border-slate-700"} border flex items-center justify-center text-xs font-mono font-bold shrink-0">
                  ${String.fromCharCode(65 + optIdx)}
                </span>
                <span class="leading-snug">${opt}</span>
              </div>
              <i data-lucide="${isSelected ? "check-circle-2" : "circle"}" class="w-4 h-4 ${isSelected ? "text-indigo-400" : "text-slate-600"} shrink-0 ml-2"></i>
            </button>
          `;
        }).join("")}
      </div>

      <!-- Navigation & Action Buttons -->
      <div class="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
        <button
          id="prev-mcq-btn"
          ${currentIndex === 0 ? "disabled" : ""}
          class="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-800 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
        >
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          <span>Previous</span>
        </button>

        ${isLastQuestion ? `
          <button
            id="submit-assessment-btn"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-extrabold transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Submit Assessment</span>
            <i data-lucide="check" class="w-4 h-4"></i>
          </button>
        ` : `
          <button
            id="next-mcq-btn"
            class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Next Question</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        `}
      </div>
    </div>
  `;
}

/**
 * Generates HTML for the comprehensive assessment results & adaptation screen.
 *
 * @param {object} params
 * @param {number} params.score
 * @param {number} [params.total=3]
 * @param {number} [params.percentage=100]
 * @param {object} [params.analysis={}]
 * @param {string} [params.nextTopicTitle=""]
 * @param {Array<object>} [params.answeredDetails=[]]
 * @param {"topic" | "cumulative"} [params.assessmentType="topic"]
 * @param {boolean} [params.isMilestoneForCumulative=false]
 * @returns {string}
 */
export function renderAssessmentResults({
  score,
  total = 3,
  percentage = 100,
  analysis = {},
  nextTopicTitle = "",
  answeredDetails = [],
  assessmentType = "topic",
  isMilestoneForCumulative = false
}) {
  const isPass = percentage >= 60;
  const isMastered = percentage >= 80;
  const isCumulative = assessmentType === "cumulative";

  const scoreBadgeColor = isMastered
    ? "from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300"
    : isPass
    ? "from-amber-500/20 to-indigo-500/20 border-amber-500/40 text-amber-300"
    : "from-rose-500/20 to-amber-500/20 border-rose-500/40 text-rose-300";

  return `
    <div class="space-y-6 text-left max-w-2xl mx-auto">
      <!-- Score & Performance Header -->
      <div class="p-6 rounded-3xl bg-gradient-to-br ${scoreBadgeColor} border space-y-3 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-slate-950/60 border border-current">
            ${isCumulative ? "Cumulative Retention Milestone Completed" : "Topic Assessment Completed"}
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white mt-2">
            ${score} / ${total} Correct (${percentage}%)
          </h2>
          <p class="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
            ${analysis.summary || (isMastered ? "Strong understanding" : isPass ? "Partial understanding" : "Weak understanding — reinforcement required")}
          </p>
        </div>

        <div class="w-16 h-16 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-center shrink-0">
          <i data-lucide="${isMastered ? "award" : isPass ? "check-circle" : "alert-circle"}" class="w-8 h-8 ${isMastered ? "text-emerald-400" : isPass ? "text-amber-400" : "text-rose-400"}"></i>
        </div>
      </div>

      <!-- Concept Breakdown (Mastered vs Weak) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Mastered Concepts -->
        <div class="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/20 space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <i data-lucide="check" class="w-3.5 h-3.5"></i> Mastered Principles
          </h4>
          <div class="flex flex-wrap gap-1.5">
            ${(analysis.masteredConcepts?.length ? analysis.masteredConcepts : ["Core Mechanics"])
              .map((c) => `<span class="text-[11px] px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">${c}</span>`)
              .join("")}
          </div>
        </div>

        <!-- Weak Concepts -->
        <div class="p-4 rounded-2xl bg-slate-950/60 border border-rose-500/20 space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i> Identified Weaknesses
          </h4>
          <div class="flex flex-wrap gap-1.5">
            ${(analysis.weakConcepts?.length
              ? analysis.weakConcepts
              : ["None — All tested principles answered correctly!"]
            ).map((c) => `<span class="text-[11px] px-2.5 py-0.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30">${c}</span>`).join("")}
          </div>
        </div>
      </div>

      <!-- Misconception Diagnostic -->
      ${analysis.misconceptionAnalysis ? `
        <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <i data-lucide="brain" class="w-4 h-4 text-indigo-400"></i> AI Misconception Diagnosis
          </h4>
          <p class="text-xs text-slate-400 leading-relaxed font-normal">
            ${analysis.misconceptionAnalysis}
          </p>
        </div>
      ` : ""}

      <!-- Future Topic Adaptation Notice -->
      <div class="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
        <div class="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30 mt-0.5">
          <i data-lucide="git-merge" class="w-4 h-4"></i>
        </div>
        <div class="space-y-1">
          <h4 class="text-xs font-bold text-indigo-200 uppercase tracking-wider">
            Future Learning Adapted (Odd/Even Lanes & Prerequisites)
          </h4>
          <p class="text-xs text-indigo-300 leading-relaxed">
            ${analysis.adaptationAdvice || `Your performance has been incorporated into the adaptive scheduler. Future lane topics and prerequisite chains have been calibrated with distance decay.`}
          </p>
        </div>
      </div>

      <!-- Action Button to Proceed -->
      <div class="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
        ${isMilestoneForCumulative ? `
          <button
            id="start-cumulative-btn"
            class="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            <i data-lucide="sparkles" class="w-4 h-4 text-amber-200"></i>
            <span>Take 4-Topic Cumulative Milestone Test</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        ` : `
          <button
            id="move-to-next-topic-btn"
            class="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            <span>Move to Next Topic</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        `}
      </div>
    </div>
  `;
}
