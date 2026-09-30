import { ContentRenderer } from "../content/contentRenderer.js";

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
 * Generates HTML for the concept learning view according to Nordic Slate styling.
 * @param {object} lesson
 * @returns {string}
 */
export function renderLessonContent(lesson) {
  const blocks = lesson.blocks || lesson.publishedBlocks || lesson.draftBlocks || null;

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

  const renderedBody = Array.isArray(blocks) && blocks.length > 0
    ? ContentRenderer.render(blocks)
    : `
      <!-- Structured Sections -->
      <div class="space-y-5">
        ${sections
          .map(
            (sec, idx) => `
          <div class="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <h3 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
              <span class="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-mono font-bold flex items-center justify-center border border-indigo-200">${idx + 1}</span>
              <span>${sec.heading}</span>
            </h3>
            <div class="leading-relaxed text-xs sm:text-sm text-slate-600 whitespace-pre-line font-normal">
              ${sec.content}
            </div>

            ${
              sec.examples && sec.examples.length
                ? `
              <div class="pt-2 space-y-2">
                <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Illustrative Examples:</div>
                <div class="space-y-1.5 pl-2.5 border-l-2 border-indigo-400">
                  ${sec.examples
                    .map(
                      (ex) => `
                    <div class="text-xs text-indigo-900 font-mono bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
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
        <div class="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 relative overflow-hidden">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <i data-lucide="code-2" class="w-4 h-4 text-indigo-600"></i> Production Implementation Example
            </h4>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase font-semibold">
              ${practicalEx.language || "code"}
            </span>
          </div>

          <p class="text-xs text-slate-600">${practicalEx.description}</p>

          <pre class="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-100 overflow-x-auto leading-relaxed shadow-inner"><code>${escapeHTML(practicalEx.code)}</code></pre>
        </div>
      `
          : ""
      }
    `;

  return `
    <div class="space-y-6">
      <!-- Objective Banner -->
      <div class="p-6 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-indigo-950 space-y-1.5">
        <div class="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
          <i data-lucide="target" class="w-4 h-4"></i>
          <span>Topic Objective</span>
        </div>
        <p class="text-xs sm:text-sm text-indigo-900/90 leading-relaxed font-medium">
          ${lesson.objective || "Master core principles and production trade-offs for this topic."}
        </p>
      </div>

      <!-- Main Lesson Body -->
      ${renderedBody}

      <!-- Key Architectural Principles -->
      ${
        lesson.keyPoints && lesson.keyPoints.length
          ? `
        <div class="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
            <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> Key Architectural Principles
          </h4>
          <ul class="space-y-2 text-xs text-emerald-950 font-medium">
            ${lesson.keyPoints
              .map(
                (kp) => `
              <li class="flex items-start gap-2">
                <span class="text-emerald-600 font-bold mt-0.5">•</span>
                <span>${kp}</span>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      `
          : ""
      }

      <!-- Common Pitfalls & Anti-Patterns -->
      ${
        lesson.commonMistakes && lesson.commonMistakes.length
          ? `
        <div class="p-6 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-600"></i> Common Traps & Pitfalls to Avoid
          </h4>
          <ul class="space-y-2 text-xs text-rose-950 font-medium">
            ${lesson.commonMistakes
              .map(
                (cm) => `
              <li class="flex items-start gap-2">
                <span class="text-rose-600 font-bold mt-0.5">•</span>
                <span>${cm}</span>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      `
          : ""
      }
    </div>
  `;
}
