// ===================================================
// PATH FORGE - DASHBOARD COMPONENT
// Master dashboard controller assembling readiness, skills, calendar & SRS
// ===================================================

import { $, refreshLucide, on } from "../../utils/dom.js";
import { renderReadinessWidget } from "./readiness.js";
import { renderSkillGapsWidget } from "./skillGaps.js";
import { renderTodayPlanWidget } from "./todayPlan.js";
import { calculateOverallReadiness } from "../../services/learning/skillEngine.js";
import { calculateDaysRemaining } from "../../utils/validation.js";
import { calendarService } from "../../services/calendar/calendarService.js";
import { srsEngine } from "../../services/learning/srsEngine.js";
import { FlashcardModal } from "../flashcards/flashcardModal.js";

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
  const userId = user?.userId || user?.uid || "default";

  // Filter today's tasks from the live schedule
  const todayDate = new Date().toISOString().split("T")[0];
  const todayTasks = (schedule?.items || []).filter((i) => i.date === todayDate || i.dayIndex === 1);

  // Calendar and SRS metrics
  const googleCalUrl = calendarService.getGoogleCalendarUrl(todayTasks[0], goal);
  const dueCards = srsEngine.getDueCards(userId);
  const dueCardsCount = dueCards.length;

  container.innerHTML = `
    <div class="space-y-6 max-w-6xl mx-auto">
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 flex-wrap">
            <span>Welcome back,</span>
            <span class="text-indigo-600">${user?.displayName || "Candidate"}</span>
            <span>👋</span>
          </h2>
          <div class="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
            <span class="inline-flex items-center gap-1.5 font-mono text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200/80">
              <i data-lucide="mail" class="w-3 h-3 text-indigo-500"></i>
              <span>${user?.email || "candidate@pathforge.dev"}</span>
            </span>
            <span class="text-slate-400 hidden sm:inline">•</span>
            <span class="text-slate-500">Live Adaptive Preparation Plan</span>
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
        ${renderTodayPlanWidget(todayTasks, { goal, dueCardsCount, googleCalUrl })}
        ${renderSkillGapsWidget(skillProfile)}
      </div>
    </div>
  `;

  refreshLucide();

  // 1. Continue Learning Session Button
  const continueBtn = $("#dashboard-continue-learning-btn");
  if (continueBtn && onContinueLearning) {
    on(continueBtn, "click", onContinueLearning);
  }

  // 2. Export .ics Calendar
  const exportIcsBtn = $("#btn-export-ics");
  if (exportIcsBtn) {
    on(exportIcsBtn, "click", () => {
      calendarService.downloadICSFile(schedule?.items || todayTasks, goal);
    });
  }

  // 3. Spaced Repetition (SM-2) Review Modal Trigger
  const srsReviewBtn = $("#btn-start-srs-review");
  if (srsReviewBtn) {
    on(srsReviewBtn, "click", () => {
      const modal = new FlashcardModal({
        userId,
        onComplete: () => {
          // Re-render dashboard to refresh due count
          renderDashboard({
            user,
            goal,
            skillProfile,
            schedule,
            todayMinutesSpent,
            onContinueLearning
          });
        }
      });
      modal.open();
    });
  }
}
