// ===================================================
// PATH FORGE - HOME LANDING COMPONENT
// Hero CTA for "SET YOUR GOAL", domain exploration & quick quiz
// ===================================================

import { $, on, refreshLucide } from "../../utils/dom.js";

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
