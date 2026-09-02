// ===================================================
// PATH FORGE - ROADMAP COMPONENT
// Milestones timeline, syllabus accordions & progress calculation
// ===================================================

import { $, $$, refreshLucide } from "../utils/dom.js";
import { triggerConfetti } from "../utils/animations.js";
import { getProgress, saveProgress } from "../services/storage.js";

let hasCelebrated = false;

/**
 * Renders the roadmap view for a specific role.
 *
 * @param {object} role - The selected role object.
 * @param {string} categoryName - The human-readable category name.
 */
export function renderRoadmap(role, categoryName) {
  if (!role) return;

  const roadmapDomainTag = $("#roadmap-domain-tag");
  const pathwayTitle = $("#pathway-title");
  const pathwayDesc = $("#pathway-desc");
  const stepsContainer = $("#steps-container");

  if (roadmapDomainTag) roadmapDomainTag.textContent = categoryName || "Career Pathway";
  if (pathwayTitle) pathwayTitle.textContent = role.title;
  if (pathwayDesc) pathwayDesc.textContent = role.tagline;

  if (!stepsContainer) return;
  stepsContainer.innerHTML = "";

  const completedMap = getProgress();

  role.steps.forEach((step, index) => {
    const isChecked = !!completedMap[step.id];

    const stepCard = document.createElement("div");
    stepCard.className = "relative group flex items-start gap-4 sm:gap-6";

    stepCard.innerHTML = `
      <!-- Node Checkbox -->
      <label class="relative z-10 flex items-center justify-center -ml-[31px] sm:-ml-[39px] mt-4 cursor-pointer">
        <input 
          type="checkbox" 
          data-id="${step.id}" 
          ${isChecked ? "checked" : ""}
          class="step-checkbox sr-only"
        />
        <div class="w-8 h-8 rounded-full bg-slate-950 border-2 ${isChecked ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'border-indigo-500/50 text-indigo-400 group-hover:border-indigo-400'} flex items-center justify-center transition-all duration-300">
          ${isChecked 
            ? '<i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>' 
            : `<span class="text-xs font-bold">${index + 1}</span>`
          }
        </div>
      </label>

      <!-- Glass Step Card -->
      <div class="glass-card flex-1 p-5 sm:p-6 rounded-2xl transition-all duration-300 ${isChecked ? 'opacity-75 border-emerald-500/30' : ''}">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 flex-wrap mb-1.5">
              <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isChecked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'} uppercase tracking-wider">
                Step ${index + 1}
              </span>
              <h3 class="text-base sm:text-lg font-bold text-white ${isChecked ? 'line-through text-slate-400' : ''}">
                ${step.title}
              </h3>
            </div>

            <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">${step.summary}</p>

            <div class="flex items-center gap-4 mt-3 text-xs text-slate-400 font-medium">
              <span class="inline-flex items-center gap-1.5 bg-slate-950/50 px-2.5 py-1 rounded-lg border border-slate-800">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-indigo-400"></i> ${step.duration}
              </span>
              <span class="inline-flex items-center gap-1.5 bg-slate-950/50 px-2.5 py-1 rounded-lg border border-slate-800">
                <i data-lucide="book-open" class="w-3.5 h-3.5 text-cyan-400"></i> ${step.resources ? step.resources.length : 0} Courses/Docs
              </span>
            </div>
          </div>

          <!-- Toggle Expand Button -->
          <button 
            data-target="expand-${step.id}" 
            class="toggle-details-btn self-end sm:self-center px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition border border-slate-700/80 hover:border-indigo-500 flex items-center gap-2 whitespace-nowrap shadow-sm group/btn cursor-pointer"
          >
            <i data-lucide="book-open-check" class="w-3.5 h-3.5"></i>
            <span class="btn-label">View Course Syllabus</span>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 chevron-icon transition-transform duration-300"></i>
          </button>
        </div>

        <!-- COLLAPSIBLE EXPANDED DETAILS SECTION -->
        <div id="expand-${step.id}" class="hidden mt-5 pt-5 border-t border-slate-800/80 space-y-4 transition-all">
          
          ${step.syllabus && step.syllabus.length ? `
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-1.5">
                <i data-lucide="calendar" class="w-3.5 h-3.5 text-indigo-400"></i> Step-by-Step Curriculum
              </h4>
              <ul class="space-y-1.5 pl-1">
                ${step.syllabus.map(item => `
                  <li class="text-xs text-slate-300 flex items-start gap-2">
                    <span class="text-indigo-400 font-bold">•</span>
                    <span>${item}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

          ${step.concepts && step.concepts.length ? `
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-400"></i> Core Competencies
              </h4>
              <div class="flex flex-wrap gap-1.5">
                ${step.concepts.map(c => `<span class="bg-slate-950 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg border border-slate-800 font-medium">${c}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          ${step.resources && step.resources.length ? `
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <i data-lucide="graduation-cap" class="w-3.5 h-3.5 text-cyan-400"></i> Direct Free Courses & Documentation
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${step.resources.map(r => `
                  <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="bg-slate-950/80 hover:bg-slate-900 p-2.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 text-indigo-400 hover:text-indigo-300 text-xs transition flex items-center justify-between font-medium group/link">
                    <span class="truncate">${r.name}</span>
                    <i data-lucide="external-link" class="w-3.5 h-3.5 shrink-0 group-hover/link:translate-x-0.5 transition"></i>
                  </a>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${step.project ? `
            <div class="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl">
              <h4 class="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <i data-lucide="code" class="w-3.5 h-3.5 text-indigo-400"></i> Milestone Project Challenge
              </h4>
              <p class="text-xs text-slate-300 leading-relaxed">${step.project}</p>
            </div>
          ` : ''}

        </div>
      </div>
    `;

    stepsContainer.appendChild(stepCard);
  });

  refreshLucide();
  bindStepEvents(role, categoryName);
  updateProgress(role);
}

/**
 * Attaches event listeners to checkboxes and expand buttons.
 */
function bindStepEvents(role, categoryName) {
  $$(".step-checkbox").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const stepId = e.target.getAttribute("data-id");
      const currentMap = getProgress();
      currentMap[stepId] = e.target.checked;
      saveProgress(currentMap);
      renderRoadmap(role, categoryName);
    });
  });

  $$(".toggle-details-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const targetId = e.currentTarget.getAttribute("data-target");
      const contentEl = document.getElementById(targetId);
      const chevronIcon = e.currentTarget.querySelector(".chevron-icon");
      const labelEl = e.currentTarget.querySelector(".btn-label");

      if (!contentEl) return;

      if (contentEl.classList.contains("hidden")) {
        contentEl.classList.remove("hidden");
        if (chevronIcon) chevronIcon.style.transform = "rotate(180deg)";
        if (labelEl) labelEl.textContent = "Hide Syllabus";
      } else {
        contentEl.classList.add("hidden");
        if (chevronIcon) chevronIcon.style.transform = "rotate(0deg)";
        if (labelEl) labelEl.textContent = "View Course Syllabus";
      }
    });
  });
}

/**
 * Calculates and updates the completion percentage, progress bar, and trophy icon.
 * @param {object} role
 */
export function updateProgress(role) {
  if (!role || !role.steps) return;

  const progressBar = $("#progress-bar");
  const progressPercent = $("#progress-percent");
  const trophyContainer = $("#trophy-container");

  const completedMap = getProgress();
  const steps = role.steps;
  const completedCount = steps.filter((s) => completedMap[s.id]).length;
  const percentage = Math.round((completedCount / steps.length) * 100) || 0;

  if (progressBar) progressBar.style.width = `${percentage}%`;
  if (progressPercent) progressPercent.textContent = `${percentage}%`;

  if (!trophyContainer) return;

  if (percentage === 100) {
    trophyContainer.className =
      "w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center animate-bounce shadow-[0_0_20px_rgba(245,158,11,0.4)]";
    if (!hasCelebrated) {
      triggerConfetti();
      hasCelebrated = true;
    }
  } else {
    trophyContainer.className =
      "w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-600 flex items-center justify-center";
    hasCelebrated = false;
  }
}
