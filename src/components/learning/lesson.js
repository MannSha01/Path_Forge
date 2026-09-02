// ===================================================
// PATH FORGE - LESSON VIEWER COMPONENT (SCHEMA V2)
// In-depth concept explanation, structured sections, code examples & interview points
// ===================================================

/**
 * Escapes HTML characters for safe code rendering.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generates HTML for the concept learning view according to Schema V2.
 * @param {object} lesson
 * @returns {string}
 */
export function renderLessonContent(lesson) {
  const sections = lesson.sections || [
    {
      heading: "Concept Overview",
      content: lesson.explanation || "Core principles and implementation details.",
      examples: lesson.examples || []
    }
  ];

  const practicalEx = lesson.practicalExample || (lesson.examples && lesson.examples.length ? {
    description: "Production Implementation Example",
    code: lesson.examples[0],
    language: "javascript"
  } : null);

  return `
    <div class="space-y-6 text-left">
      <!-- Header Banner -->
      <div class="space-y-3 border-b border-slate-800 pb-5">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
              ${lesson.topic || "Core Topic"}
            </span>
            <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <i data-lucide="clock" class="w-3 h-3"></i>
              <span>${lesson.estimatedMinutes || 30} Min Study</span>
            </span>
          </div>
          <span class="text-xs text-slate-400 font-medium">Topic Learning Mode</span>
        </div>

        <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">${lesson.title}</h2>
        <div class="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs sm:text-sm text-indigo-200 font-medium flex items-start gap-2.5">
          <i data-lucide="target" class="w-4 h-4 text-cyan-400 shrink-0 mt-0.5"></i>
          <div>
            <span class="font-bold text-cyan-300">Core Objective:</span> ${lesson.objective || "Master core mechanisms and architectural patterns."}
          </div>
        </div>

        <!-- Subtle Background Status Indicators -->
        <div class="flex items-center flex-wrap gap-2.5 pt-1 text-[11px]">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            <i data-lucide="check" class="w-3 h-3 text-emerald-400"></i> Lesson ready
          </span>
          <span id="lesson-assessment-indicator" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 font-medium transition-all">
            <span id="lesson-assessment-dot" class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span id="lesson-assessment-text">Generating assessment...</span>
          </span>
          <span id="lesson-next-topic-indicator" class="hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
            <i data-lucide="sparkles" class="w-3 h-3 text-indigo-400"></i> Next topic prepared
          </span>
        </div>
      </div>

      <!-- Structured Sections -->
      <div class="space-y-5">
        ${sections
          .map(
            (sec, idx) => `
          <div class="p-5 sm:p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <h3 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center border border-indigo-500/30">${idx + 1}</span>
              <span>${sec.heading}</span>
            </h3>
            <div class="leading-relaxed text-xs sm:text-sm text-slate-300 whitespace-pre-line font-normal">
              ${sec.content}
            </div>

            ${
              sec.examples && sec.examples.length
                ? `
              <div class="pt-2 space-y-2">
                <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Illustrative Examples:</div>
                <div class="space-y-1.5 pl-2 border-l-2 border-indigo-500/40">
                  ${sec.examples
                    .map(
                      (ex) => `
                    <div class="text-xs text-indigo-200 font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                      ${ex}
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>

      <!-- Practical Real-World Code Example -->
      ${
        practicalEx
          ? `
        <div class="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-3 relative overflow-hidden">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <i data-lucide="code-2" class="w-4 h-4 text-cyan-400"></i> Production Implementation Example
            </h4>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 uppercase">
              ${practicalEx.language || "code"}
            </span>
          </div>

          <p class="text-xs text-slate-300">${practicalEx.description}</p>

          <pre class="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-100 overflow-x-auto leading-relaxed"><code>${escapeHTML(practicalEx.code)}</code></pre>
        </div>
      `
          : ""
      }

      <!-- Two-Column Key Principles & Common Traps -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div class="p-5 rounded-2xl bg-slate-950/60 border border-emerald-500/20 space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <i data-lucide="check-circle-2" class="w-4 h-4"></i> Key Principles
          </h4>
          <ul class="space-y-2 text-xs text-slate-300">
            ${(lesson.keyPoints || [])
              .map(
                (kp) => `
              <li class="flex items-start gap-2">
                <span class="text-emerald-400 font-bold shrink-0">•</span>
                <span>${kp}</span>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>

        <div class="p-5 rounded-2xl bg-slate-950/60 border border-rose-500/20 space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-4 h-4"></i> Common Traps to Avoid
          </h4>
          <ul class="space-y-2 text-xs text-slate-300">
            ${(lesson.commonMistakes || [])
              .map(
                (cm) => `
              <li class="flex items-start gap-2">
                <span class="text-rose-400 font-bold shrink-0">•</span>
                <span>${cm}</span>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      </div>

      <!-- Technical Interview Discussion Points -->
      ${
        lesson.interviewPoints && lesson.interviewPoints.length
          ? `
        <div class="p-5 rounded-2xl bg-slate-950/60 border border-indigo-500/20 space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
            <i data-lucide="briefcase" class="w-4 h-4 text-indigo-400"></i> Technical Interview Discussion Points
          </h4>
          <div class="grid grid-cols-1 gap-2.5">
            ${lesson.interviewPoints
              .map(
                (ip) => `
              <div class="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                <i data-lucide="help-circle" class="w-4 h-4 text-indigo-400 shrink-0 mt-0.5"></i>
                <span>${ip}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }

      <!-- Completion Action Bar -->
      <div class="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-xs text-slate-400 text-center sm:text-left">
          <span class="font-bold text-slate-200">Ready to test your comprehension?</span>
          <p class="text-[11px] text-slate-500 mt-0.5">Completing this topic will launch a 3-question adaptive assessment.</p>
        </div>

        <button
          id="complete-topic-btn"
          class="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
        >
          <span>Complete Topic</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `;
}
