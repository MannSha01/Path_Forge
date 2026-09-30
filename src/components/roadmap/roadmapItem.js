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

  let badgeColor = "bg-teal-50 text-teal-800 border-teal-200";
  let statusLabel = `Step ${index + 1}`;

  if (isCompleted) {
    badgeColor = "bg-teal-100 text-teal-900 border-teal-300";
    statusLabel = "Completed";
  } else if (status === "needs_revision") {
    badgeColor = "bg-rose-50 text-rose-800 border-rose-200";
    statusLabel = "Needs Revision ⚠️";
  } else if (status === "accelerated") {
    badgeColor = "bg-purple-50 text-purple-800 border-purple-200";
    statusLabel = "Accelerated ⚡";
  } else if (status === "adapted" || item.adapted) {
    badgeColor = "bg-teal-50 text-teal-800 border-teal-200 ring-1 ring-teal-300";
    statusLabel = "Adapted for you ✨";
  } else if (status === "current") {
    badgeColor = "bg-teal-50 text-teal-800 border-teal-200 ring-1 ring-teal-300";
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
      <div class="w-8 h-8 rounded-full bg-white border-2 ${isCompleted ? "border-teal-500 bg-teal-50 text-teal-600 shadow-xs" : "border-slate-300 text-slate-700 group-hover:border-teal-500"} flex items-center justify-center transition-all duration-300">
        ${isCompleted ? '<i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>' : `<span class="text-xs font-bold">${index + 1}</span>`}
      </div>
    </label>

    <!-- Glass Step Card -->
    <div class="glass-card flex-1 p-5 sm:p-6 rounded-2xl transition-all duration-300 ${isCompleted ? "opacity-80 border-teal-300 bg-white" : "border-slate-200 bg-white shadow-xs"}">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 flex-wrap mb-1.5">
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badgeColor}">
              ${statusLabel}
            </span>
            ${item.date ? `<span class="text-[10px] text-slate-500 font-mono">Date: ${item.date}</span>` : ""}
            <h3 class="text-base sm:text-lg font-bold text-slate-900 ${isCompleted ? "line-through text-slate-400" : ""}">
              ${item.title}
            </h3>
          </div>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">${item.summary || item.skill || ""}</p>

          <div class="flex items-center gap-4 mt-3 text-xs text-slate-600 font-medium">
            <span class="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-teal-600"></i> ${item.durationMinutes ? `${item.durationMinutes} min` : item.duration || "1-2 Weeks"}
            </span>
          </div>
        </div>

        <!-- Launch Lesson CTA -->
        <button
          class="start-module-btn self-end sm:self-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-teal-600/20 flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
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
