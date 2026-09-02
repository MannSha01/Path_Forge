// ===================================================
// PATH FORGE - DASHBOARD COMPONENT
// Master dashboard controller assembling readiness, skills & today plan
// ===================================================

import { $, refreshLucide, on } from "../../utils/dom.js";
import { renderReadinessWidget } from "./readiness.js";
import { renderSkillGapsWidget } from "./skillGaps.js";
import { renderTodayPlanWidget } from "./todayPlan.js";
import { calculateOverallReadiness } from "../../services/learning/skillEngine.js";
import { calculateDaysRemaining } from "../../utils/validation.js";

/**
 * Renders the full personalized dashboard.
 *
 * @param {object} params
 * @param {object} params.user
 * @param {object} params.goal
 * @param {Record<string, object>} params.skillProfile
 * @param {object} params.schedule
 * @param {number} params.todayMinutesSpent
 * @param {() => void} params.onContinueLearning
 */
export function renderDashboard({
  user,
  goal,
  skillProfile = {},
  schedule,
  todayMinutesSpent = 0,
  onContinueLearning
}) {
  const container = $("#dashboard-content");
  if (!container) return;

  const targetRole = goal?.targetPosition || "Full Stack Developer";
  const targetCompany = goal?.targetCompany || "Industry Standard";
  const daysRemaining = calculateDaysRemaining(goal?.deadline);
  const readinessPercent = calculateOverallReadiness(skillProfile, Object.keys(skillProfile));
  const targetDailyMinutes = goal?.dailyMinutes || 60;

  // Filter today's tasks from the live schedule
  const todayDate = new Date().toISOString().split("T")[0];
  const todayTasks = (schedule?.items || []).filter((i) => i.date === todayDate || i.dayIndex === 1);

  container.innerHTML = `
    <div class="space-y-6 max-w-6xl mx-auto">
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-white flex items-center gap-2 flex-wrap">
            <span>Welcome back,</span>
            <span class="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">${user?.displayName || "Candidate"}</span>
            <span>👋</span>
          </h2>
          <div class="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
            <span class="inline-flex items-center gap-1.5 font-mono text-indigo-300 bg-indigo-950/40 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
              <i data-lucide="mail" class="w-3 h-3 text-indigo-400"></i>
              <span>${user?.email || "candidate@pathforge.dev"}</span>
            </span>
            <span class="text-slate-600 hidden sm:inline">•</span>
            <span class="text-slate-400">Live Adaptive Preparation Plan</span>
          </div>
        </div>
      </div>

      <!-- Readiness Banner -->
      ${renderReadinessWidget({
        targetRole,
        targetCompany,
        readinessPercent,
        daysRemaining,
        todayMinutesSpent,
        targetDailyMinutes
      })}

      <!-- Two-Column Widgets Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        ${renderTodayPlanWidget(todayTasks)}
        ${renderSkillGapsWidget(skillProfile)}
      </div>
    </div>
  `;

  refreshLucide();

  const continueBtn = $("#dashboard-continue-learning-btn");
  if (continueBtn && onContinueLearning) {
    on(continueBtn, "click", onContinueLearning);
  }
}
