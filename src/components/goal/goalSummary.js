// ===================================================
// PATH FORGE - GOAL SUMMARY COMPONENT
// AI skill gap analysis breakdown & study plan activation
// ===================================================

import { $, refreshLucide } from "../../utils/dom.js";
import { aiService } from "../../services/ai/aiService.js";

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
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
            <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Gap Analysis Complete
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">${analysis.targetRole}</h2>
          <p class="text-xs sm:text-sm text-slate-600 mt-1">Target Company: <strong class="text-slate-900">${analysis.targetCompany}</strong></p>
        </div>

        <div class="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-xs self-stretch sm:self-auto justify-between">
          <div>
            <span class="text-3xl font-black bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
              ${analysis.estimatedReadiness}%
            </span>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Readiness</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <i data-lucide="gauge" class="w-5 h-5"></i>
          </div>
        </div>
      </div>

      <!-- Skills Matrix -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/90 shadow-xs space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
            <i data-lucide="check" class="w-4 h-4"></i> Existing Strengths Found
          </h4>
          <div class="flex flex-wrap gap-1.5 pt-1">
            ${(analysis.currentSkills || ["Foundational Problem Solving"])
              .map((s) => `<span class="bg-teal-100/70 text-teal-900 text-xs px-2.5 py-1 rounded-lg border border-teal-200 font-medium">${s}</span>`)
              .join("")}
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/90 shadow-xs space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
            <i data-lucide="alert-circle" class="w-4 h-4"></i> Critical Skill Gaps to Bridge
          </h4>
          <div class="flex flex-wrap gap-1.5 pt-1">
            ${(analysis.skillGaps || ["Full Curriculum Track"])
              .map((s) => `<span class="bg-rose-100/70 text-rose-900 text-xs px-2.5 py-1 rounded-lg border border-rose-200 font-medium">${s}</span>`)
              .join("")}
          </div>
        </div>
      </div>

      <!-- Priority Focus & Projects -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-800">Curated Portfolio Milestones</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          ${(analysis.recommendedProjects || ["Fullstack Production Application", "Automated Testing Suite"])
            .map((p) => `
              <div class="p-3 bg-white border border-slate-200 shadow-xs rounded-xl flex items-center gap-2.5">
                <i data-lucide="folder-git-2" class="w-4 h-4 text-teal-600 shrink-0"></i>
                <span class="text-slate-800 font-medium">${p}</span>
              </div>
            `)
            .join("")}
        </div>
      </div>

      <!-- ATS Resume Bullet Polisher Section -->
      <div class="p-5 rounded-2xl bg-white border border-teal-200/90 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
            </div>
            <div>
              <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">ATS Resume Bullet Polisher</h4>
              <p class="text-[11px] text-slate-600">Transform weak experience into Google XYZ achievements matching ${analysis.targetRole}</p>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <textarea
            id="ats-bullet-input"
            rows="2"
            placeholder="Paste a resume bullet (e.g. Worked on frontend components and fixed bugs)..."
            class="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition resize-none"
          ></textarea>
          
          <button
            id="ats-polish-btn"
            class="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
          >
            <i data-lucide="wand-2" class="w-3.5 h-3.5"></i>
            <span>Polish for ATS</span>
          </button>
        </div>

        <!-- Dynamic Output Container -->
        <div id="ats-output-card" class="hidden space-y-3 pt-3 border-t border-slate-200">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <!-- Before -->
            <div class="p-3 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-rose-700 uppercase">Original</span>
                <span id="ats-score-before" class="text-[10px] font-mono font-bold text-rose-800"></span>
              </div>
              <p id="ats-text-before" class="text-slate-600 text-xs italic"></p>
            </div>

            <!-- After -->
            <div class="p-3 rounded-xl bg-teal-50/60 border border-teal-200 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-teal-800 uppercase">ATS Optimized (XYZ Formula)</span>
                <span id="ats-score-after" class="text-[10px] font-mono font-bold text-teal-800"></span>
              </div>
              <p id="ats-text-after" class="text-slate-900 text-xs font-medium"></p>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] text-slate-600 font-semibold">Keywords Injected:</span>
              <div id="ats-keywords-list" class="flex flex-wrap gap-1"></div>
            </div>
            <button
              id="ats-copy-bullet-btn"
              class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded-lg border border-slate-200 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span id="ats-copy-label">Copy Bullet</span>
            </button>
          </div>
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

  // Attach ATS Polisher Event Listeners
  const inputEl = $("#ats-bullet-input");
  const polishBtn = $("#ats-polish-btn");
  const outputCard = $("#ats-output-card");
  const copyBtn = $("#ats-copy-bullet-btn");

  if (polishBtn && inputEl) {
    polishBtn.addEventListener("click", async () => {
      const rawBullet = inputEl.value.trim();
      if (!rawBullet) return;

      polishBtn.disabled = true;
      polishBtn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> <span>Optimizing...</span>`;
      refreshLucide();

      try {
        const rewrite = await aiService.rewriteResumeBullet({
          bulletPoint: rawBullet,
          targetRole: analysis.targetRole,
          targetCompany: analysis.targetCompany,
          jobDescription: analysis.jobDescription || ""
        });

        outputCard.classList.remove("hidden");
        $("#ats-text-before").textContent = rewrite.original;
        $("#ats-text-after").textContent = rewrite.optimized;
        $("#ats-score-before").textContent = `Score: ${rewrite.scoreBefore}/100`;
        $("#ats-score-after").textContent = `Score: ${rewrite.scoreAfter}/100`;

        const kwContainer = $("#ats-keywords-list");
        kwContainer.innerHTML = (rewrite.keywordsAdded || [])
          .map((kw) => `<span class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${kw}</span>`)
          .join("");

        copyBtn.onclick = () => {
          navigator.clipboard.writeText(rewrite.optimized);
          const label = $("#ats-copy-label");
          label.textContent = "Copied!";
          setTimeout(() => { label.textContent = "Copy Bullet"; }, 2000);
        };
      } catch (err) {
        console.error("Failed to polish bullet:", err);
      } finally {
        polishBtn.disabled = false;
        polishBtn.innerHTML = `<i data-lucide="wand-2" class="w-3.5 h-3.5"></i> <span>Polish for ATS</span>`;
        refreshLucide();
      }
    });
  }

  const launchBtn = $("#launch-study-plan-btn");
  if (launchBtn) {
    launchBtn.addEventListener("click", onLaunchPlan);
  }
}
