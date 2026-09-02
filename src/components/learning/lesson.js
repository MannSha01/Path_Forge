// ===================================================
// PATH FORGE - LESSON VIEWER COMPONENT
// Concept explanation, code/practical examples, and common pitfalls
// ===================================================

/**
 * Generates HTML for the concept learning view.
 * @param {object} lesson
 * @returns {string}
 */
export function renderLessonContent(lesson) {
  return `
    <div class="space-y-6 text-left">
      <!-- Title & Objective -->
      <div class="space-y-2 border-b border-slate-800 pb-4">
        <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
          Core Module
        </span>
        <h2 class="text-2xl sm:text-3xl font-black text-white">${lesson.title}</h2>
        <p class="text-xs sm:text-sm text-cyan-300 font-medium">${lesson.objective}</p>
      </div>

      <!-- In-Depth Explanation -->
      <div class="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 leading-relaxed text-xs sm:text-sm text-slate-300 whitespace-pre-line">
        ${lesson.explanation}
      </div>

      <!-- Real-World Practical Examples -->
      ${lesson.examples && lesson.examples.length ? `
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
            <i data-lucide="code-2" class="w-4 h-4 text-indigo-400"></i> Implementation Examples
          </h4>
          <div class="space-y-2.5">
            ${lesson.examples.map((ex) => `
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-indigo-200">
                ${ex}
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}

      <!-- Two-Column Key Points & Common Pitfalls -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <i data-lucide="check-circle" class="w-4 h-4"></i> Key Principles
          </h4>
          <ul class="space-y-1.5 text-xs text-slate-300 pl-1">
            ${(lesson.keyPoints || []).map((kp) => `<li class="flex items-start gap-2"><span class="text-emerald-400">•</span><span>${kp}</span></li>`).join("")}
          </ul>
        </div>

        <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <i data-lucide="alert-triangle" class="w-4 h-4"></i> Common Traps to Avoid
          </h4>
          <ul class="space-y-1.5 text-xs text-slate-300 pl-1">
            ${(lesson.commonMistakes || []).map((cm) => `<li class="flex items-start gap-2"><span class="text-rose-400">•</span><span>${cm}</span></li>`).join("")}
          </ul>
        </div>
      </div>
    </div>
  `;
}
