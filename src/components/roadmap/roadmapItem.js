// ===================================================
// PATH FORGE - ROADMAP ITEM COMPONENT
// Milestone timeline step card with dynamic adaptive status badges
// ===================================================

/**
 * Creates a single roadmap item DOM element.
 * @param {object} item - Plan item or role step
 * @param {number} index - Index in timeline
 * @param {boolean} isCompleted - Whether milestone is completed
 * @param {(item: object) => void} onToggleCheck
 * @param {(item: object) => void} onLaunchLesson
 * @returns {HTMLDivElement}
 */
export function createRoadmapItem(item, index, isCompleted, onToggleCheck, onLaunchLesson) {
  const stepCard = document.createElement("div");
  stepCard.className = "relative group flex items-start gap-4 sm:gap-6";

  const status = item.status || (isCompleted ? "completed" : "scheduled");

  let badgeColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
  let statusLabel = `Step ${index + 1}`;

  if (isCompleted) {
    badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    statusLabel = "Completed";
  } else if (status === "needs_revision") {
    badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
    statusLabel = "Needs Revision ⚠️";
  } else if (status === "accelerated") {
    badgeColor = "bg-purple-500/20 text-purple-300 border-purple-500/30";
    statusLabel = "Accelerated ⚡";
  } else if (status === "current") {
    badgeColor = "bg-cyan-500/20 text-cyan-300 border-cyan-500/30 ring-1 ring-cyan-500/30";
    statusLabel = "Current Focus";
  }

  stepCard.innerHTML = `
    <!-- Checkbox Node -->
    <label class="relative z-10 flex items-center justify-center -ml-[31px] sm:-ml-[39px] mt-4 cursor-pointer">
      <input 
        type="checkbox" 
        data-id="${item.topicId || item.id}" 
        ${isCompleted ? "checked" : ""}
        class="step-checkbox sr-only"
      />
      <div class="w-8 h-8 rounded-full bg-slate-950 border-2 ${isCompleted ? "border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" : "border-indigo-500/50 text-indigo-400 group-hover:border-indigo-400"} flex items-center justify-center transition-all duration-300">
        ${isCompleted ? '<i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>' : `<span class="text-xs font-bold">${index + 1}</span>`}
      </div>
    </label>

    <!-- Glass Step Card -->
    <div class="glass-card flex-1 p-5 sm:p-6 rounded-2xl transition-all duration-300 ${isCompleted ? "opacity-75 border-emerald-500/30" : "border-slate-800"}">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 flex-wrap mb-1.5">
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badgeColor}">
              ${statusLabel}
            </span>
            ${item.date ? `<span class="text-[10px] text-slate-500 font-mono">Date: ${item.date}</span>` : ""}
            <h3 class="text-base sm:text-lg font-bold text-white ${isCompleted ? "line-through text-slate-400" : ""}">
              ${item.title}
            </h3>
          </div>

          <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">${item.summary || item.skill || ""}</p>

          <div class="flex items-center gap-4 mt-3 text-xs text-slate-400 font-medium">
            <span class="inline-flex items-center gap-1.5 bg-slate-950/50 px-2.5 py-1 rounded-lg border border-slate-800">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-indigo-400"></i> ${item.durationMinutes ? `${item.durationMinutes} min` : item.duration || "1-2 Weeks"}
            </span>
          </div>
        </div>

        <!-- Launch Lesson CTA -->
        <button
          class="start-module-btn self-end sm:self-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
        >
          <i data-lucide="play" class="w-3.5 h-3.5 fill-white"></i>
          <span>Study Module</span>
        </button>
      </div>
    </div>
  `;

  const checkbox = stepCard.querySelector(".step-checkbox");
  if (checkbox && onToggleCheck) {
    checkbox.addEventListener("change", (e) => onToggleCheck(item, e.target.checked));
  }

  const startBtn = stepCard.querySelector(".start-module-btn");
  if (startBtn && onLaunchLesson) {
    startBtn.addEventListener("click", () => onLaunchLesson(item));
  }

  return stepCard;
}
