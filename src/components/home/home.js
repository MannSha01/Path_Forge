// ===================================================
// PATH FORGE - HOME LANDING COMPONENT
// State-aware Hero CTA: Set Goal / Start Learning / Resume Learning
// ===================================================

import { $, on, refreshLucide } from "../../utils/dom.js";

export function updateHomeHeroCTA({
  authUser,
  goal,
  journey,
  activeTopic,
  onResumeLearning,
  onStartLearning,
  onSetGoal,
  onTakeQuiz,
  onViewDashboard,
  onViewRoadmap
}) {
  const container = $("#hero-cta-container");
  if (!container) return;

  const isLoggedIn = Boolean(authUser);
  const hasGoal = Boolean(goal);
  const hasJourney = Boolean(journey && journey.currentTopicId);

  if (!isLoggedIn || !hasGoal) {
    // 1. Not Logged In or No Goal -> "SET YOUR GOAL"
    container.innerHTML = `
      <button id="hero-set-goal-btn" class="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer">
        <i data-lucide="target" class="w-4 h-4"></i>
        <span>${isLoggedIn ? "SET A GOAL" : "SET YOUR GOAL"}</span>
      </button>
      <button id="hero-take-quiz-btn" class="w-full sm:w-auto px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-sm rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95">
        <i data-lucide="sparkles" class="w-4 h-4 text-indigo-400"></i>
        <span>Take 1-Min Career Quiz</span>
      </button>
    `;
    on($("#hero-set-goal-btn"), "click", onSetGoal);
    on($("#hero-take-quiz-btn"), "click", onTakeQuiz);
  } else if (!hasJourney) {
    // 2. Goal Exists + No Learning Progress -> "START LEARNING"
    container.innerHTML = `
      <button id="hero-start-learning-btn" class="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-600/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer">
        <i data-lucide="play" class="w-4 h-4 fill-current"></i>
        <span>START LEARNING</span>
      </button>
      <button id="hero-view-dashboard-btn" class="w-full sm:w-auto px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-sm rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95">
        <i data-lucide="layout-dashboard" class="w-4 h-4 text-cyan-400"></i>
        <span>View Dashboard</span>
      </button>
    `;
    on($("#hero-start-learning-btn"), "click", onStartLearning);
    on($("#hero-view-dashboard-btn"), "click", onViewDashboard);
  } else {
    // 3. Active Learning Journey -> Prominent "RESUME LEARNING" (Requirement 24)
    const topicLabel = activeTopic?.title || "Active Topic";
    container.innerHTML = `
      <button id="hero-resume-learning-btn" class="w-full sm:w-auto px-9 py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400 hover:from-indigo-500 hover:to-cyan-300 text-white font-black text-sm rounded-2xl shadow-2xl shadow-indigo-600/50 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer ring-2 ring-cyan-400/30">
        <i data-lucide="zap" class="w-5 h-5 text-cyan-200 fill-cyan-200 animate-pulse"></i>
        <div class="text-left">
          <div class="text-[10px] uppercase tracking-wider text-cyan-200 font-bold">Resume Learning</div>
          <div class="text-xs sm:text-sm font-extrabold text-white truncate max-w-[220px] sm:max-w-xs">${topicLabel}</div>
        </div>
        <i data-lucide="arrow-right" class="w-4 h-4 ml-1 text-white"></i>
      </button>
      <button id="hero-view-roadmap-btn" class="w-full sm:w-auto px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-sm rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95">
        <i data-lucide="map" class="w-4 h-4 text-indigo-400"></i>
        <span>View Roadmap</span>
      </button>
    `;
    on($("#hero-resume-learning-btn"), "click", onResumeLearning);
    on($("#hero-view-roadmap-btn"), "click", onViewRoadmap);
  }

  refreshLucide();
}

export function initHomeView({ onSetGoal, onTakeQuiz, onExploreTech, onExploreNonTech }) {
  const setGoalBtn = $("#hero-set-goal-btn");
  const quickQuizBtn = $("#hero-take-quiz-btn");
  const techBtn = $("#btn-select-tech");
  const nonTechBtn = $("#btn-select-non-tech");

  if (setGoalBtn) {
    on(setGoalBtn, "click", onSetGoal);
  }

  if (quickQuizBtn) {
    on(quickQuizBtn, "click", onTakeQuiz);
  }

  if (techBtn) {
    on(techBtn, "click", onExploreTech);
  }

  if (nonTechBtn) {
    on(nonTechBtn, "click", onExploreNonTech);
  }

  refreshLucide();
}
