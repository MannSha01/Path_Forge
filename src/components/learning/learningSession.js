// ===================================================
// PATH FORGE - LEARNING SESSION CONTROLLER
// Adaptive Topic Learning Loop: Lesson -> Background 3 MCQs -> Complete Topic -> Evaluation ->
// Alternating Lane Adaptation & Prerequisite Overrides -> Cumulative Assessment (Every 4 Topics)
// ===================================================

import { $, refreshLucide, on } from "../../utils/dom.js";
import { aiService } from "../../services/ai/aiService.js";
import { processAssessmentAnswers } from "../../services/learning/skillEngine.js";
import { progressService } from "../../services/learning/progressService.js";
import { databaseService } from "../../services/database/databaseService.js";
import { LocalStorageService } from "../../services/storage/localStorageService.js";
import { calculateAlternatingLaneAdaptations } from "../../services/scheduler/scheduler.js";
import { renderLessonContent } from "./lesson.js";
import { renderAssessmentQuestion, renderAssessmentResults } from "./assessment.js";
import { getTopicById, getTopicsForRole } from "../../data/curriculum.js";

export class LearningSessionController {
  constructor({ containerId, onSessionComplete }) {
    this.container = $(containerId);
    this.onSessionComplete = onSessionComplete;
    this.currentLesson = null;
    this.currentLessonRecord = null;
    this.currentStatus = "NOT_STARTED"; // NOT_STARTED | LEARNING | ASSESSMENT | CUMULATIVE_ASSESSMENT | COMPLETED
    this.user = null;
    this.uid = null;
    this.topicId = null;
    this.nextTopicId = null;
    this.goal = null;
    this.skillProfile = {};
    this.assessmentQuestions = [];
    this.currentQuestionIndex = 0;
    this.userAnswers = []; // array of selected option indices (0-3)
    this.questionGenStatus = "NOT_STARTED"; // NOT_STARTED | GENERATING | READY | FAILED
    this.questionGenPromise = null;
    this.activeAssessmentId = null;
    this.isCumulativeMode = false;
    this.cumulativeCoveredTopicIds = [];
  }

  async startSession({ user, topicId, skillProfile = {}, goal = null, nextTopicId = null }) {
    this.user = user;
    this.uid = user?.uid || user?.userId;
    this.topicId = topicId;
    this.nextTopicId = nextTopicId;
    this.skillProfile = skillProfile;
    this.goal = goal;
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.questionGenStatus = "NOT_STARTED";
    this.isCumulativeMode = false;

    if (!this.container) return;

    // Show initial loading state
    this.container.innerHTML = `
      <div class="glass-card rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
        <i data-lucide="sparkles" class="w-10 h-10 text-indigo-400 animate-spin mx-auto"></i>
        <h3 class="text-lg font-bold text-white">AI Teacher is Preparing Your Topic Lesson...</h3>
        <p class="text-xs text-slate-400">Synthesizing topic content, architectural examples, and interview points tailored to your current mastery.</p>
      </div>
    `;
    refreshLucide();

    try {
      // 1. Check for existing persisted lesson for this user & topic (Resume / Reload behavior)
      let existingLesson = null;
      if (this.uid) {
        existingLesson = await databaseService.getLessonByUserAndTopic(this.uid, this.topicId);
      }

      if (existingLesson && existingLesson.content) {
        this.currentLessonRecord = existingLesson;
        this.currentLesson = existingLesson.content;
        this.currentStatus = existingLesson.status || "LEARNING";

        // Restore journey state
        if (this.uid) {
          await databaseService.saveJourneyState({
            uid: this.uid,
            status: this.currentStatus,
            currentTopicId: this.topicId,
            currentLessonState: "LOADED"
          });
        }

        // If user reloads during ASSESSMENT, restore assessment stage
        if (this.currentStatus === "ASSESSMENT") {
          await this.loadOrGenerateAssessment();
          return;
        }

        this.renderLessonStage();
      } else {
        // 2. Fresh generation with full learner context
        const topic = getTopicById(this.topicId);
        const targetSkill = topic?.concepts?.[0] || topic?.title || this.topicId;
        const currentMastery = this.skillProfile[targetSkill]?.mastery || 30;

        // Query recent performance & adaptations
        const pastAssessments = this.uid
          ? await databaseService.getAssessmentsByUserAndTopic(this.uid)
          : [];
        const latestAssessment = pastAssessments[0] || null;

        const adaptations = this.uid
          ? await databaseService.getAdaptations(this.uid)
          : [];
        const topicAdaptation = adaptations.find((a) => a.targetTopicId === this.topicId || a.affectedTopicId === this.topicId);

        const context = {
          targetRole: this.goal?.targetRole || this.goal?.targetPosition || "Software Engineer",
          targetCompany: this.goal?.targetCompany || "",
          userMastery: currentMastery,
          previousPerformance: latestAssessment
            ? {
                score: latestAssessment.score,
                weakConcepts: latestAssessment.analysis?.weakConcepts || []
              }
            : null,
          adaptationContext: topicAdaptation
            ? {
                reason: topicAdaptation.reason,
                weakConcepts: topicAdaptation.oldState?.weakConcepts || []
              }
            : null,
          dailyMinutes: this.goal?.dailyStudyMinutes || this.goal?.dailyMinutes || topic?.estimatedMinutes || 45,
          jobRequirements: this.goal?.jobDescription || ""
        };

        this.currentLesson = await aiService.generateLesson(this.topicId, context);
        this.currentStatus = "LEARNING";

        if (this.uid) {
          this.currentLessonRecord = await databaseService.saveLesson({
            uid: this.uid,
            topicId: this.topicId,
            content: this.currentLesson,
            masteryContext: { userMastery: currentMastery },
            status: "LEARNING"
          });

          await databaseService.saveJourneyState({
            uid: this.uid,
            status: "LEARNING",
            currentTopicId: this.topicId,
            currentLessonState: "ACTIVE"
          });

          await databaseService.saveTopicProgress({
            uid: this.uid,
            topicId: this.topicId,
            status: "LEARNING",
            lessonProgress: 50
          });
        }

        this.renderLessonStage();
      }

      // 3. Concurrently kick off background 3-MCQ generation (Requirement 7)
      this.triggerBackgroundQuestionGeneration();
    } catch (err) {
      this.container.innerHTML = `
        <div class="glass-card rounded-3xl p-8 text-center text-rose-400 space-y-4 max-w-lg mx-auto">
          <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-400 mx-auto"></i>
          <p class="text-sm font-semibold">Unable to generate this lesson right now. Your progress is safe. Try again.</p>
          <button id="retry-lesson-btn" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-xs font-bold transition cursor-pointer">
            Retry Lesson Generation
          </button>
        </div>
      `;
      refreshLucide();
      $("#retry-lesson-btn")?.addEventListener("click", () =>
        this.startSession({ user, topicId, skillProfile, goal, nextTopicId })
      );
    }
  }

  // --- BACKGROUND 3-QUESTION GENERATION (REQUIREMENT 7 & 8) ---

  async triggerBackgroundQuestionGeneration() {
    if (!this.topicId) return;

    // Check if questions are already persisted for this topic
    if (this.uid) {
      const existingAssessments = await databaseService.getAssessmentsByUserAndTopic(this.uid, this.topicId);
      const readyAssessment = existingAssessments.find((a) => a.questions?.length === 3);
      if (readyAssessment) {
        this.assessmentQuestions = readyAssessment.questions;
        this.activeAssessmentId = readyAssessment.assessmentId;
        this.questionGenStatus = "READY";
        this.updateLessonStatusBadges();
        // Trigger Topic N+1 pre-generation
        this.triggerBackgroundPreGeneration();
        return;
      }
    }

    this.questionGenStatus = "GENERATING";

    this.questionGenPromise = (async () => {
      const topic = getTopicById(this.topicId);
      const targetSkill = topic?.concepts?.[0] || topic?.title || this.topicId;
      const currentMastery = this.skillProfile[targetSkill]?.mastery || 30;

      const prevQuestionTexts = this.uid
        ? await databaseService.getQuestionHistory(this.uid, this.topicId)
        : [];

      const result = await aiService.generateQuestions(
        this.topicId,
        {
          userMastery: currentMastery,
          targetRole: this.goal?.targetRole || this.goal?.targetPosition || "Software Engineer"
        },
        prevQuestionTexts
      );

      this.assessmentQuestions = result.questions || [];
      this.activeAssessmentId = result.assessmentId || `asm_${this.topicId}_${Date.now()}`;
      this.questionGenStatus = "READY";

      // Save questions in database with READY status
      if (this.uid && this.assessmentQuestions.length === 3) {
        await databaseService.saveAssessment({
          assessmentId: this.activeAssessmentId,
          uid: this.uid,
          topicId: this.topicId,
          assessmentType: "topic",
          questions: this.assessmentQuestions,
          questionCount: 3,
          status: "READY"
        });

        await databaseService.saveQuestionHistory(
          this.uid,
          this.topicId,
          this.assessmentQuestions.map((q) => q.question)
        );
      }

      this.updateLessonStatusBadges();

      // Once 3 questions are READY -> prepare Topic N+1 (Requirement 7)
      this.triggerBackgroundPreGeneration();
      return this.assessmentQuestions;
    })().catch((err) => {
      console.warn("Background question generation failed:", err);
      this.questionGenStatus = "FAILED";
      const dot = $("#lesson-assessment-dot");
      const text = $("#lesson-assessment-text");
      if (dot && text) {
        dot.className = "w-2 h-2 rounded-full bg-rose-400";
        text.innerText = "Assessment synthesis retry available";
      }
    });
  }

  updateLessonStatusBadges() {
    const indicator = $("#lesson-assessment-indicator");
    if (indicator) {
      indicator.innerHTML = `<i data-lucide="check" class="w-3 h-3 text-cyan-400"></i> <span>Assessment ready</span>`;
      indicator.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium";
    }
    const nextBadge = $("#lesson-next-topic-indicator");
    if (nextBadge && this.nextTopicId) {
      nextBadge.classList.remove("hidden");
    }
    refreshLucide();
  }

  // --- BACKGROUND PRE-GENERATION OF TOPIC N+1 (REQUIREMENT 21, 22, 23) ---

  async triggerBackgroundPreGeneration() {
    if (!this.nextTopicId || !this.uid) return;

    try {
      const existing = await databaseService.getLessonByUserAndTopic(this.uid, this.nextTopicId);
      if (existing) return;

      const nextTopic = getTopicById(this.nextTopicId);
      if (!nextTopic) return;

      const currentMastery = this.skillProfile[nextTopic.concepts?.[0] || nextTopic.title]?.mastery || 30;
      const preparedContent = await aiService.prepareNextTopic(this.nextTopicId, {
        targetRole: this.goal?.targetRole || this.goal?.targetPosition || "Software Engineer",
        targetCompany: this.goal?.targetCompany || "",
        userMastery: currentMastery
      });

      if (preparedContent) {
        await databaseService.saveLesson({
          uid: this.uid,
          topicId: this.nextTopicId,
          content: preparedContent,
          masteryContext: { userMastery: currentMastery, preGenerated: true },
          status: "PREPARED",
          generationVersion: 1,
          adaptationVersion: 1
        });
      }
    } catch (err) {
      console.warn("Background pre-generation failed silently:", err.message);
    }
  }

  // --- STAGE 1: LESSON CONTENT ---

  renderLessonStage() {
    if (!this.container || !this.currentLesson) return;

    this.container.innerHTML = `
      <div class="glass-card rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
        ${renderLessonContent(this.currentLesson)}
      </div>
    `;

    refreshLucide();

    if (this.questionGenStatus === "READY") {
      this.updateLessonStatusBadges();
    }

    const completeBtn = $("#complete-topic-btn");
    if (completeBtn) {
      on(completeBtn, "click", () => this.handleCompleteTopic());
    }
  }

  // --- STAGE 2: TOPIC COMPLETION & ASSESSMENT LAUNCH (REQUIREMENT 32) ---

  async handleCompleteTopic() {
    this.currentStatus = "ASSESSMENT";
    if (this.currentLessonRecord?.lessonId) {
      await databaseService.updateLessonStatus(this.currentLessonRecord.lessonId, "ASSESSMENT");
    }

    if (this.uid) {
      await databaseService.saveJourneyState({
        uid: this.uid,
        status: "ASSESSMENT",
        currentTopicId: this.topicId,
        currentAssessmentState: "READY"
      });
    }

    await this.loadOrGenerateAssessment();
  }

  async loadOrGenerateAssessment() {
    if (this.questionGenStatus === "READY" && this.assessmentQuestions.length === 3) {
      // Questions already prepared in background! Immediately launch without waiting
      this.currentQuestionIndex = 0;
      // Restore draft answers if exist
      if (this.uid && this.activeAssessmentId) {
        const savedDraft = await databaseService.getDraftAnswers(this.activeAssessmentId, this.uid);
        this.userAnswers = savedDraft.length === 3 ? savedDraft : new Array(3).fill(null);
      } else {
        this.userAnswers = new Array(3).fill(null);
      }
      this.renderAssessmentStage();
      return;
    }

    // If still generating in background, display graceful non-blocking state
    this.container.innerHTML = `
      <div class="glass-card rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
        <i data-lucide="brain-circuit" class="w-10 h-10 text-cyan-400 animate-spin mx-auto"></i>
        <h3 class="text-lg font-bold text-white">Synthesizing 3 Adaptive Practice MCQs...</h3>
        <p class="text-xs text-slate-400">Crafting conceptually unique questions for "${this.currentLesson?.title || "this topic"}" with anti-repeat protection.</p>
      </div>
    `;
    refreshLucide();

    try {
      if (this.questionGenPromise) {
        await this.questionGenPromise;
      } else {
        await this.triggerBackgroundQuestionGeneration();
      }

      this.currentQuestionIndex = 0;
      this.userAnswers = new Array(this.assessmentQuestions.length).fill(null);
      this.renderAssessmentStage();
    } catch (err) {
      this.container.innerHTML = `
        <div class="glass-card rounded-3xl p-8 text-center text-rose-400 space-y-4 max-w-lg mx-auto">
          <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-400 mx-auto"></i>
          <p class="text-sm font-semibold">Unable to generate assessment at this moment. Your lesson progress is preserved.</p>
          <button id="retry-assessment-btn" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-xs font-bold transition cursor-pointer">
            Retry Assessment Generation
          </button>
        </div>
      `;
      refreshLucide();
      $("#retry-assessment-btn")?.addEventListener("click", () => this.loadOrGenerateAssessment());
    }
  }

  renderAssessmentStage() {
    const question = this.assessmentQuestions[this.currentQuestionIndex];
    if (!question) {
      this.renderLessonStage();
      return;
    }

    const selectedOption = this.userAnswers[this.currentQuestionIndex];

    this.container.innerHTML = `
      <div class="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
        ${renderAssessmentQuestion({
          question,
          currentIndex: this.currentQuestionIndex,
          totalQuestions: this.assessmentQuestions.length,
          selectedOptionIndex: selectedOption,
          allAnswers: this.userAnswers,
          assessmentType: this.isCumulativeMode ? "cumulative" : "topic"
        })}
      </div>
    `;

    refreshLucide();

    // Option Click Handlers with AUTOSAVING (Requirement 10)
    this.container.querySelectorAll(".mcq-option-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const optionIdx = parseInt(e.currentTarget.getAttribute("data-option-index"), 10);
        this.userAnswers[this.currentQuestionIndex] = optionIdx;

        // Autosave draft answers immediately to database
        if (this.uid && this.activeAssessmentId) {
          await databaseService.saveDraftAnswers({
            assessmentId: this.activeAssessmentId,
            uid: this.uid,
            topicId: this.topicId,
            answers: this.userAnswers
          });
        }

        this.renderAssessmentStage();
      });
    });

    // Jump Dots Handler
    this.container.querySelectorAll(".jump-dot-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const jumpIdx = parseInt(e.currentTarget.getAttribute("data-jump-index"), 10);
        this.currentQuestionIndex = jumpIdx;
        this.renderAssessmentStage();
      });
    });

    // Prev Button
    on($("#prev-mcq-btn"), "click", () => {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
        this.renderAssessmentStage();
      }
    });

    // Next Button
    on($("#next-mcq-btn"), "click", () => {
      if (this.currentQuestionIndex < this.assessmentQuestions.length - 1) {
        this.currentQuestionIndex++;
        this.renderAssessmentStage();
      }
    });

    // Submit Assessment Button
    on($("#submit-assessment-btn"), "click", () => {
      if (this.isCumulativeMode) {
        this.handleCumulativeSubmission();
      } else {
        this.handleAssessmentSubmission();
      }
    });
  }

  // --- STAGE 3: DETERMINISTIC SCORING & ALTERNATING ADAPTATION (REQUIREMENT 11, 12, 13, 15, 16) ---

  async handleAssessmentSubmission() {
    this.container.innerHTML = `
      <div class="glass-card rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
        <i data-lucide="cpu" class="w-10 h-10 text-emerald-400 animate-spin mx-auto"></i>
        <h3 class="text-lg font-bold text-white">Analyzing Assessment Performance...</h3>
        <p class="text-xs text-slate-400">Evaluating conceptual understanding, updating skill profiles & adapting upcoming pathway lessons.</p>
      </div>
    `;
    refreshLucide();

    const preparedAnswers = this.assessmentQuestions.map((q, idx) => ({
      questionId: q.id,
      selectedIndex: this.userAnswers[idx] !== null && this.userAnswers[idx] !== undefined ? this.userAnswers[idx] : -1
    }));

    const nextTopic = this.nextTopicId ? getTopicById(this.nextTopicId) : null;

    try {
      // 1. Evaluate assessment (Deterministic Scoring + Exactly ONE AI Analysis Call)
      const evalResult = await aiService.evaluateAssessment({
        topicTitle: this.currentLesson.title,
        questions: this.assessmentQuestions,
        userAnswers: preparedAnswers,
        targetRole: this.goal?.targetRole || this.goal?.targetPosition || "Software Engineer",
        nextTopicTitle: nextTopic?.title || "Upcoming Module",
        assessmentType: "topic"
      });

      const { score, totalQuestions, percentage, answeredDetails, analysis } = evalResult;

      // 2. Skill Engine bounded updates for each answer (0 <= mastery <= 100)
      const skillUpdate = processAssessmentAnswers(this.skillProfile, answeredDetails);
      this.skillProfile = skillUpdate.updatedProfile;

      // 3. Persist to Database Service
      if (this.uid) {
        await databaseService.saveSkillProfile(this.uid, this.skillProfile);

        // Record individual question attempts
        const attemptsToSave = answeredDetails.map((a) => ({
          assessmentId: this.activeAssessmentId,
          questionId: a.questionId,
          uid: this.uid,
          selectedAnswer: a.selectedIndex,
          isCorrect: a.isCorrect,
          difficulty: a.difficulty,
          skill: a.skill,
          timestamp: new Date().toISOString()
        }));
        await databaseService.recordQuestionAttempts(attemptsToSave);

        // Save completed assessment record
        await databaseService.saveAssessment({
          assessmentId: this.activeAssessmentId,
          uid: this.uid,
          topicId: this.topicId,
          assessmentType: "topic",
          score,
          percentage,
          analysis,
          questions: this.assessmentQuestions,
          answers: preparedAnswers,
          status: "COMPLETED"
        });

        // Clear draft answers now that it's submitted
        await databaseService.clearDraftAnswers(this.activeAssessmentId, this.uid);

        // Record active learning time
        await progressService.recordTimeSpent(
          this.uid,
          this.currentLesson.estimatedMinutes || 30,
          this.currentLesson.title
        );

        // 4. Alternating Lane Adaptation & Prerequisite Overrides (Requirements 13, 15, 16)
        const roleId = this.goal?.targetRoleId || "frontend";
        const allRoleTopics = getTopicsForRole(roleId);
        const sourceIndex = allRoleTopics.findIndex((t) => t.id === this.topicId);

        const weakConcepts = analysis.weakConcepts || [];
        const isWeak = score <= 1 || weakConcepts.length > 0;

        if (sourceIndex >= 0) {
          const laneAdaptations = calculateAlternatingLaneAdaptations({
            sourceIndex,
            sourceTopicId: this.topicId,
            allTopics: allRoleTopics,
            isWeak,
            weakConcepts,
            skillProfile: this.skillProfile
          });

          // Persist each adaptation decision to database
          for (const adp of laneAdaptations) {
            await databaseService.saveAdaptation({
              uid: this.uid,
              sourceTopicId: this.topicId,
              sourceAssessmentId: this.activeAssessmentId,
              targetTopicId: adp.targetTopicId,
              reason: adp.reason,
              effectStrength: adp.effectStrength,
              adaptationType: adp.adaptationType,
              adaptationVersion: Date.now()
            });
          }
        }

        // Patch prepared next topic if weak
        if (this.nextTopicId && isWeak && weakConcepts.length > 0) {
          const preparedNextLesson = await databaseService.getLessonByUserAndTopic(this.uid, this.nextTopicId);
          if (preparedNextLesson && preparedNextLesson.status === "PREPARED") {
            const adaptedLesson = await aiService.generateLesson(this.nextTopicId, {
              targetRole: this.goal?.targetRole || this.goal?.targetPosition || "Software Engineer",
              targetCompany: this.goal?.targetCompany || "",
              userMastery: this.skillProfile[nextTopic?.concepts?.[0] || this.nextTopicId]?.mastery || 30,
              previousPerformance: { score, weakConcepts },
              adaptationContext: { weakConcepts }
            });

            await databaseService.saveLesson({
              lessonId: preparedNextLesson.lessonId,
              uid: this.uid,
              topicId: this.nextTopicId,
              content: adaptedLesson,
              status: "PREPARED",
              adaptationVersion: Date.now()
            });
          }
        }

        // 5. Mark lesson and topic progress COMPLETED
        if (this.currentLessonRecord?.lessonId) {
          await databaseService.updateLessonStatus(this.currentLessonRecord.lessonId, "COMPLETED");
        }

        await databaseService.saveTopicProgress({
          uid: this.uid,
          topicId: this.topicId,
          topicIndex: sourceIndex >= 0 ? sourceIndex : 0,
          status: "COMPLETED",
          completedAt: new Date().toISOString(),
          assessmentCompleted: true,
          assessmentId: this.activeAssessmentId,
          topicScore: percentage
        });

        const completedMap = LocalStorageService.get("completed_topics", {});
        completedMap[this.topicId] = true;
        LocalStorageService.set("completed_topics", completedMap);

        // Auto-save permanent study notes
        try {
          const notes = await aiService.generateNotes(this.currentLesson);
          await databaseService.saveNote({
            uid: this.uid,
            lessonId: this.currentLesson.title,
            ...notes
          });
        } catch (noteErr) {
          console.warn("Failed to generate auto-notes:", noteErr);
        }
      }

      this.currentStatus = "COMPLETED";

      // Check if this topic triggers a 4-topic cumulative milestone (Requirement 34)
      const completedIds = Object.keys(LocalStorageService.get("completed_topics", {}));
      const isMilestoneForCumulative = completedIds.length > 0 && completedIds.length % 4 === 0;

      // 6. Render Results Screen
      this.container.innerHTML = `
        <div class="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
          ${renderAssessmentResults({
            score,
            total: totalQuestions,
            percentage,
            analysis,
            nextTopicTitle: nextTopic?.title || "Upcoming Module",
            answeredDetails,
            assessmentType: "topic",
            isMilestoneForCumulative
          })}
        </div>
      `;

      refreshLucide();

      if (isMilestoneForCumulative) {
        const precedingTopics = completedIds.slice(-4);
        on($("#start-cumulative-btn"), "click", () => {
          this.launchCumulativeAssessment(precedingTopics);
        });
      } else {
        on($("#move-to-next-topic-btn"), "click", () => {
          if (this.onSessionComplete) {
            this.onSessionComplete({
              topicId: this.topicId,
              nextTopicId: this.nextTopicId,
              skillProfile: this.skillProfile,
              score,
              percentage
            });
          }
        });
      }
    } catch (submitErr) {
      console.error("Error during assessment evaluation:", submitErr);
      this.container.innerHTML = `
        <div class="glass-card rounded-3xl p-8 text-center text-rose-400 space-y-4 max-w-lg mx-auto">
          <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-400 mx-auto"></i>
          <p class="text-sm font-semibold">An error occurred while evaluating your assessment. Your selected answers have been preserved.</p>
          <button id="retry-submit-btn" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-xs font-bold transition cursor-pointer">
            Retry Submission
          </button>
        </div>
      `;
      refreshLucide();
      $("#retry-submit-btn")?.addEventListener("click", () => this.handleAssessmentSubmission());
    }
  }

  // --- STAGE 4: CUMULATIVE ASSESSMENT (EVERY 4 TOPICS — REQUIREMENTS 34-40) ---

  async launchCumulativeAssessment(coveredTopicIds = []) {
    this.isCumulativeMode = true;
    this.cumulativeCoveredTopicIds = coveredTopicIds;
    this.currentStatus = "CUMULATIVE_ASSESSMENT";

    this.container.innerHTML = `
      <div class="glass-card rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
        <i data-lucide="sparkles" class="w-10 h-10 text-amber-400 animate-spin mx-auto"></i>
        <h3 class="text-lg font-bold text-white">Synthesizing 4-Topic Cumulative Milestone Assessment...</h3>
        <p class="text-xs text-slate-400">Crafting cross-topic synthesis questions evaluating long-term retention across your last 4 completed topics.</p>
      </div>
    `;
    refreshLucide();

    try {
      const prevTexts = this.uid
        ? await databaseService.getQuestionHistory(this.uid, "cumulative")
        : [];

      const result = await aiService.generateCumulativeQuestions(
        coveredTopicIds,
        {
          targetRole: this.goal?.targetRole || this.goal?.targetPosition || "Software Engineer",
          userMastery: 50
        },
        prevTexts
      );

      this.assessmentQuestions = result.questions || [];
      this.activeAssessmentId = result.assessmentId || `cum_${Date.now()}`;
      this.currentQuestionIndex = 0;
      this.userAnswers = new Array(this.assessmentQuestions.length).fill(null);

      if (this.uid) {
        await databaseService.saveAssessment({
          assessmentId: this.activeAssessmentId,
          uid: this.uid,
          topicId: coveredTopicIds.join("_"),
          assessmentType: "cumulative",
          coveredTopics: coveredTopicIds,
          questions: this.assessmentQuestions,
          questionCount: this.assessmentQuestions.length,
          status: "READY"
        });

        await databaseService.saveQuestionHistory(
          this.uid,
          "cumulative",
          this.assessmentQuestions.map((q) => q.question)
        );
      }

      this.renderAssessmentStage();
    } catch (err) {
      console.error("Failed to launch cumulative assessment:", err);
      // If cumulative generation fails, allow learner to proceed to next topic without blocker
      if (this.onSessionComplete) {
        this.onSessionComplete({
          topicId: this.topicId,
          nextTopicId: this.nextTopicId,
          skillProfile: this.skillProfile
        });
      }
    }
  }

  async handleCumulativeSubmission() {
    this.container.innerHTML = `
      <div class="glass-card rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
        <i data-lucide="cpu" class="w-10 h-10 text-amber-400 animate-spin mx-auto"></i>
        <h3 class="text-lg font-bold text-white">Evaluating Retention Across 4 Topics...</h3>
        <p class="text-xs text-slate-400">Updating cross-topic competency and calibrating future pathway milestones.</p>
      </div>
    `;
    refreshLucide();

    const preparedAnswers = this.assessmentQuestions.map((q, idx) => ({
      questionId: q.id,
      selectedIndex: this.userAnswers[idx] !== null && this.userAnswers[idx] !== undefined ? this.userAnswers[idx] : -1
    }));

    try {
      const evalResult = await aiService.evaluateAssessment({
        topicTitle: "Cumulative Retention Checkpoint",
        questions: this.assessmentQuestions,
        userAnswers: preparedAnswers,
        targetRole: this.goal?.targetRole || this.goal?.targetPosition || "Software Engineer",
        assessmentType: "cumulative",
        coveredTopics: this.cumulativeCoveredTopicIds
      });

      const { score, totalQuestions, percentage, answeredDetails, analysis } = evalResult;

      // Update skill engine with retention weighting
      const skillUpdate = processAssessmentAnswers(this.skillProfile, answeredDetails, { isCumulative: true });
      this.skillProfile = skillUpdate.updatedProfile;

      if (this.uid) {
        await databaseService.saveSkillProfile(this.uid, this.skillProfile);

        await databaseService.saveAssessment({
          assessmentId: this.activeAssessmentId,
          uid: this.uid,
          topicId: this.cumulativeCoveredTopicIds.join("_"),
          assessmentType: "cumulative",
          coveredTopics: this.cumulativeCoveredTopicIds,
          score,
          percentage,
          analysis,
          questions: this.assessmentQuestions,
          answers: preparedAnswers,
          status: "COMPLETED"
        });

        // Record cumulative adaptation reinforcement if needed
        if (analysis.weakConcepts?.length) {
          for (const weak of analysis.weakConcepts) {
            await databaseService.saveAdaptation({
              uid: this.uid,
              targetTopicId: this.nextTopicId,
              reason: `Cumulative retention reinforcement needed for: ${weak}`,
              adaptationType: "cumulative_reinforcement",
              effectStrength: 0.8
            });
          }
        }
      }

      // Render Cumulative Results
      this.container.innerHTML = `
        <div class="glass-card rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
          ${renderAssessmentResults({
            score,
            total: totalQuestions,
            percentage,
            analysis,
            answeredDetails,
            assessmentType: "cumulative",
            isMilestoneForCumulative: false
          })}
        </div>
      `;

      refreshLucide();

      on($("#move-to-next-topic-btn"), "click", () => {
        if (this.onSessionComplete) {
          this.onSessionComplete({
            topicId: this.topicId,
            nextTopicId: this.nextTopicId,
            skillProfile: this.skillProfile,
            score,
            percentage
          });
        }
      });
    } catch (err) {
      console.error("Cumulative evaluation failed:", err);
      if (this.onSessionComplete) {
        this.onSessionComplete({
          topicId: this.topicId,
          nextTopicId: this.nextTopicId,
          skillProfile: this.skillProfile
        });
      }
    }
  }
}
