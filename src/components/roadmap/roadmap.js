// ===================================================
// PATH FORGE - ADAPTIVE ROADMAP CONTROLLER
// Live schedule timeline visualization & progress meter
// ===================================================

import { $, refreshLucide } from "../../utils/dom.js";
import { triggerConfetti } from "../../utils/animations.js";
import { createRoadmapItem } from "./roadmapItem.js";

let hasCelebrated = false;

/**
 * Renders the adaptive roadmap view.
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
  if (pathwayDesc) pathwayDesc.textContent = "Personalized adaptive study timeline tailored to your target position.";

  if (!stepsContainer) return;
  stepsContainer.innerHTML = "";

  const completedCount = items.filter((it) => completedMap[it.topicId || it.id]).length;
  const percentage = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  if (progressBar) progressBar.style.width = `${percentage}%`;
  if (progressPercent) progressPercent.textContent = `${percentage}%`;

  if (percentage === 100) {
    if (trophyContainer) {
      trophyContainer.className =
        "w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center animate-bounce shadow-[0_0_20px_rgba(245,158,11,0.4)]";
    }
    if (!hasCelebrated) {
      triggerConfetti();
      hasCelebrated = true;
    }
  } else {
    if (trophyContainer) {
      trophyContainer.className =
        "w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-600 flex items-center justify-center";
    }
    hasCelebrated = false;
  }

  items.forEach((item, index) => {
    const isCompleted = Boolean(completedMap[item.topicId || item.id]);
    const node = createRoadmapItem(item, index, isCompleted, onToggleCheck, onLaunchLesson);
    stepsContainer.appendChild(node);
  });

  refreshLucide();
}
