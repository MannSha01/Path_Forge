// ===================================================
// PATH FORGE - GOAL SUMMARY COMPONENT
// AI skill gap analysis breakdown & study plan activation
// ===================================================

import { $, refreshLucide } from "../../utils/dom.js";

/**
 * Renders the goal summary and skill gap breakdown.
 * @param {object} analysis - The structured analysis result
 * @param {() => void} onLaunchPlan - Callback to advance to the live dashboard
 */
export function renderGoalSummary(analysis, onLaunchPlan) {
  const container = $("#goal-summary-container");
  if (!container) return;

  container.innerHTML = `
    <div class="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-indigo-500/30">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Gap Analysis Complete
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">${analysis.targetRole}</h2>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">Target Company: <strong class="text-slate-200">${analysis.targetCompany}</strong></p>
        </div>

        <div class="flex items-center gap-4 bg-slate-950/80 px-5 py-3 rounded-2xl border border-slate-800 self-stretch sm:self-auto justify-between">
          <div>
            <span class="text-3xl font-black bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              ${analysis.estimatedReadiness}%
            </span>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Readiness</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <i data-lucide="gauge" class="w-5 h-5"></i>
          </div>
        </div>
      </div>

      <!-- Skills Matrix -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <i data-lucide="check" class="w-4 h-4"></i> Existing Strengths Found
          </h4>
          <div class="flex flex-wrap gap-1.5 pt-1">
            ${(analysis.currentSkills || ["Foundational Problem Solving"])
              .map((s) => `<span class="bg-emerald-950/40 text-emerald-300 text-xs px-2.5 py-1 rounded-lg border border-emerald-500/30">${s}</span>`)
              .join("")}
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <i data-lucide="alert-circle" class="w-4 h-4"></i> Critical Skill Gaps to Bridge
          </h4>
          <div class="flex flex-wrap gap-1.5 pt-1">
            ${(analysis.skillGaps || ["Full Curriculum Track"])
              .map((s) => `<span class="bg-rose-950/40 text-rose-300 text-xs px-2.5 py-1 rounded-lg border border-rose-500/30 font-medium">${s}</span>`)
              .join("")}
          </div>
        </div>
      </div>

      <!-- Priority Focus & Projects -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-300">Curated Portfolio Milestones</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          ${(analysis.recommendedProjects || ["Fullstack Production Application", "Automated Testing Suite"])
            .map((p) => `
              <div class="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-2.5">
                <i data-lucide="folder-git-2" class="w-4 h-4 text-cyan-400 shrink-0"></i>
                <span class="text-slate-200 font-medium">${p}</span>
              </div>
            `)
            .join("")}
        </div>
      </div>

      <button
        id="launch-study-plan-btn"
        class="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
      >
        <span>Launch Personalized Dashboard & Start Day 1</span>
        <i data-lucide="arrow-right" class="w-4 h-4"></i>
      </button>
    </div>
  `;

  refreshLucide();

  const launchBtn = $("#launch-study-plan-btn");
  if (launchBtn) {
    launchBtn.addEventListener("click", onLaunchPlan);
  }
}
