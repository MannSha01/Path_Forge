// ===================================================
// PATH FORGE - ADAPTIVE ROADMAP CONTROLLER (NORDIC SLATE)
// Subway transit skill tree with real-time adaptation paths
// ===================================================

import { $, refreshLucide } from "../../utils/dom.js";
import { triggerConfetti } from "../../utils/animations.js";

let hasCelebrated = false;

/**
 * Renders the adaptive subway transit roadmap view.
 * @param {object} params
 * @param {string} params.title - Role or goal title
 * @param {string} params.categoryName - Category tag
 * @param {object[]} params.items - List of plan items or pathway steps
 * @param {Record<string, boolean>} params.completedMap - Completed map
 * @param {(item: object, checked: boolean) => void} params.onToggleCheck
 * @param {(item: object) => void} params.onLaunchLesson
 */
export function renderAdaptiveRoadmap({
  title = "Career Pathway",
  categoryName = "Adaptive Preparation",
  items = [],
  completedMap = {},
  onToggleCheck,
  onLaunchLesson
}) {
  const roadmapDomainTag = $("#roadmap-domain-tag");
  const pathwayTitle = $("#pathway-title");
  const pathwayDesc = $("#pathway-desc");
  const stepsContainer = $("#steps-container");
  const progressBar = $("#progress-bar");
  const progressPercent = $("#progress-percent");
  const trophyContainer = $("#trophy-container");

  if (roadmapDomainTag) roadmapDomainTag.textContent = categoryName;
  if (pathwayTitle) pathwayTitle.textContent = title;
  if (pathwayDesc) pathwayDesc.textContent = "Interactive transit roadmap tailored to your target position.";

  if (!stepsContainer) return;
  stepsContainer.innerHTML = "";

  const completedCount = items.filter((it) => completedMap[it.topicId || it.id]).length;
  const percentage = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  if (progressBar) progressBar.style.width = `${percentage}%`;
  if (progressPercent) progressPercent.textContent = `${percentage}%`;

  if (percentage === 100) {
    if (trophyContainer) {
      trophyContainer.className =
        "w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center animate-bounce shadow-md";
    }
    if (!hasCelebrated) {
      triggerConfetti();
      hasCelebrated = true;
    }
  } else {
    if (trophyContainer) {
      trophyContainer.className =
        "w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center";
    }
    hasCelebrated = false;
  }

  // Render Subway Stations
  items.forEach((item, index) => {
    const itemId = item.topicId || item.id || `topic_${index}`;
    const isCompleted = Boolean(completedMap[itemId]);
    const isCurrent = item.status === "current" && !isCompleted;
    const isAdapted = item.status === "adapted" || item.adapted || item.status === "needs_revision";

    let stationRing = "border-teal-300 bg-teal-50 text-teal-700";
    let accentBorder = "border-l-4 border-l-teal-500";
    let badgeHtml = `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">Scheduled Ahead</span>`;
    let cardTint = "bg-teal-50/20";

    if (isCompleted) {
      stationRing = "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20";
      accentBorder = "border-l-4 border-l-emerald-500";
      badgeHtml = `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> Completed</span>`;
      cardTint = "bg-emerald-50/30";
    } else if (isCurrent) {
      stationRing = "border-teal-600 bg-teal-600 text-white ring-4 ring-teal-100 shadow-md shadow-teal-600/30";
      accentBorder = "border-l-4 border-l-teal-600";
      badgeHtml = `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 border border-teal-300 animate-pulse font-extrabold">You Are Here</span>`;
      cardTint = "bg-teal-50/70 ring-1 ring-teal-500/20";
    } else if (isAdapted) {
      stationRing = "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20";
      accentBorder = "border-l-4 border-l-amber-500";
      badgeHtml = `<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">Reinforcement Loop ✨</span>`;
      cardTint = "bg-amber-50/30";
    }

    const cardEl = document.createElement("div");
    cardEl.className = "relative flex items-start gap-4 sm:gap-6 group";
    cardEl.innerHTML = `
      <!-- Station Node Marker -->
      <div class="relative z-10 w-8 h-8 rounded-full border-2 ${stationRing} flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-transform duration-200 group-hover:scale-110">
        ${isCompleted ? `<i data-lucide="check" class="w-4 h-4"></i>` : index + 1}
      </div>

      <!-- Station Detail Card -->
      <div class="flex-grow glass-card ${cardTint} p-4 sm:p-5 rounded-2xl ${accentBorder} space-y-2 hover:border-slate-300 transition-all shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="text-sm sm:text-base font-bold text-slate-900 group-hover:text-teal-600 transition">
                ${item.title}
              </h4>
              ${badgeHtml}
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              ${item.skill || item.category || "Core Concept"} • ${item.durationMinutes || 45} mins
            </p>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
            <label class="flex items-center gap-1.5 cursor-pointer text-xs text-slate-500 hover:text-slate-700 select-none mr-2">
              <input type="checkbox" class="w-4 h-4 rounded text-teal-600 accent-teal-600 cursor-pointer" ${isCompleted ? "checked" : ""} />
              <span class="text-[11px] font-medium hidden sm:inline">Done</span>
            </label>
            <button
              class="launch-lesson-btn px-3.5 py-1.5 ${
                isCurrent
                  ? "bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs"
                  : "bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold"
              } text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <i data-lucide="${isCurrent ? "play" : "book-open"}" class="w-3.5 h-3.5"></i>
              <span>${isCurrent ? "Start Station" : "Review"}</span>
            </button>
          </div>
        </div>

        ${
          item.adaptationReason
            ? `<div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-600 shrink-0"></i>
                <span>${item.adaptationReason}</span>
              </div>`
            : ""
        }
      </div>
    `;

    // Checkbox listener
    const checkbox = cardEl.querySelector("input[type='checkbox']");
    if (checkbox && onToggleCheck) {
      checkbox.addEventListener("change", (e) => {
        onToggleCheck(item, e.target.checked);
      });
    }

    // Launch lesson listener
    const launchBtn = cardEl.querySelector(".launch-lesson-btn");
    if (launchBtn && onLaunchLesson) {
      launchBtn.addEventListener("click", () => {
        onLaunchLesson(item);
      });
    }

    stepsContainer.appendChild(cardEl);
  });

  refreshLucide();
}
