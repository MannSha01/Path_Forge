// ===================================================
// PATH FORGE - LEARNING SESSION CONTROLLER
// Continuous loop: Teach -> Practice -> Evaluate -> Skill Update -> Reschedule
// ===================================================

import { $, refreshLucide, on } from "../../utils/dom.js";
import { aiService } from "../../services/ai/aiService.js";
import { updateSkillOnAnswer } from "../../services/learning/skillEngine.js";
import { progressService } from "../../services/learning/progressService.js";
import { databaseService } from "../../services/database/databaseService.js";
import { renderLessonContent } from "./lesson.js";
import { renderQuestionContent } from "./question.js";
import { renderFeedbackContent } from "./answerFeedback.js";

export class LearningSessionController {
  constructor({ containerId, onSessionComplete }) {
    this.container = $(containerId);
    this.onSessionComplete = onSessionComplete;
    this.currentLesson = null;
    this.currentQuestionIndex = 0;
    this.user = null;
    this.topicId = null;
    this.skillProfile = {};
  }

  async startSession({ user, topicId, skillProfile = {} }) {
    this.user = user;
    this.topicId = topicId;
    this.skillProfile = skillProfile;
    this.currentQuestionIndex = 0;

    if (!this.container) return;

    // Show Loading State
    this.container.innerHTML = `
      <div class="glass-card rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
        <i data-lucide="sparkles" class="w-10 h-10 text-indigo-400 animate-spin mx-auto"></i>
        <h3 class="text-lg font-bold text-white">AI Teacher is Preparing Your Adaptive Lesson...</h3>
        <p class="text-xs text-slate-400">Tailoring examples and practice questions to your current skill profile.</p>
      </div>
    `;
    refreshLucide();

    try {
      const targetSkill = skillProfile[topicId]?.skill || topicId;
      const currentMastery = skillProfile[targetSkill]?.mastery || 30;

      this.currentLesson = await aiService.generateLesson(topicId, currentMastery);
      this.renderLessonStage();
    } catch (err) {
      this.container.innerHTML = `
        <div class="glass-card rounded-3xl p-8 text-center text-rose-400 space-y-4">
          <p>Failed to load lesson: ${err.message}</p>
          <button id="retry-lesson-btn" class="px-4 py-2 bg-indigo-600 rounded-xl text-white text-xs font-bold">Retry</button>
        </div>
      `;
      $("#retry-lesson-btn")?.addEventListener("click", () => this.startSession({ user, topicId, skillProfile }));
      refreshLucide();
    }
  }

  renderLessonStage() {
    this.container.innerHTML = `
      <div class="glass-card rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
        ${renderLessonContent(this.currentLesson)}

        <div class="pt-4 border-t border-slate-800 flex justify-end">
          <button
            id="proceed-to-practice-btn"
            class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition cursor-pointer active:scale-95"
          >
            <span>Proceed to Practice Evaluation</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;

    refreshLucide();
    on($("#proceed-to-practice-btn"), "click", () => this.renderQuestionStage());
  }

  renderQuestionStage() {
    const questions = this.currentLesson.questions || [];
    const question = questions[this.currentQuestionIndex];

    if (!question) {
      this.completeSession();
      return;
    }

    this.container.innerHTML = `
      <div class="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
        ${renderQuestionContent(question, this.currentQuestionIndex + 1, questions.length)}
      </div>
    `;

    refreshLucide();

    this.container.querySelectorAll(".practice-option-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const optionIdx = parseInt(e.currentTarget.getAttribute("data-option-index"), 10);
        await this.handleAnswerSubmission(question, optionIdx);
      });
    });
  }

  async handleAnswerSubmission(question, selectedIndex) {
    const isCorrect = selectedIndex === question.correctIndex;
    const skillName = question.skill || question.topic || "Core Concept";

    // 1. Update Skill Profile via SkillEngine
    const { updatedProfile, delta, status } = updateSkillOnAnswer(this.skillProfile, {
      skillName,
      difficulty: question.difficulty || "medium",
      isCorrect
    });
    this.skillProfile = updatedProfile;

    // 2. Persist updated skills to Database
    if (this.user?.userId) {
      await databaseService.saveSkillProfile(this.user.userId, this.skillProfile);
      await databaseService.recordQuestionAttempt({
        userId: this.user.userId,
        questionId: question.id,
        skill: skillName,
        difficulty: question.difficulty,
        selectedIndex,
        isCorrect
      });
      await progressService.recordTimeSpent(this.user.userId, 15, this.currentLesson.title);
    }

    // 3. Render immediate adaptive feedback
    this.container.innerHTML = `
      <div class="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
        ${renderFeedbackContent({
          isCorrect,
          explanation: question.explanation,
          masteryDelta: delta,
          status
        })}
      </div>
    `;

    refreshLucide();

    on($("#next-session-step-btn"), "click", async () => {
      this.currentQuestionIndex++;
      if (this.currentQuestionIndex < (this.currentLesson.questions?.length || 0)) {
        this.renderQuestionStage();
      } else {
        await this.completeSession();
      }
    });
  }

  async completeSession() {
    // Generate and save permanent notes
    if (this.user?.userId && this.currentLesson) {
      try {
        const notes = await aiService.generateNotes(this.currentLesson);
        await databaseService.saveNote({
          userId: this.user.userId,
          lessonId: this.currentLesson.title,
          ...notes
        });
      } catch (err) {
        console.warn("Failed to auto-save notes:", err);
      }
    }

    if (this.onSessionComplete) {
      this.onSessionComplete({
        topicId: this.topicId,
        skillProfile: this.skillProfile
      });
    }
  }
}
