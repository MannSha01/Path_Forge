// ===================================================
// PATH FORGE - DATABASE SERVICE LAYER
// Unified persistence interface supporting multi-user isolation,
// Firebase Auth UID as primary key, Journey State, Topic Progress & Dual-Tier Storage
// ===================================================

import { LocalStorageService } from "../storage/localStorageService.js";

/**
 * Storage keys for entity collections.
 */
const COLLECTIONS = {
  USERS: "db_users",
  GOALS: "db_goals",
  JOURNEY_STATE: "db_journey_state",
  TOPIC_PROGRESS: "db_topic_progress",
  SKILL_PROFILES: "db_skill_profiles",
  STUDY_PLANS: "db_study_plans",
  PLAN_ITEMS: "db_plan_items",
  LESSONS: "db_lessons",
  ASSESSMENTS: "db_assessments",
  DRAFT_ANSWERS: "db_draft_answers",
  QUESTIONS: "db_questions",
  QUESTION_ATTEMPTS: "db_question_attempts",
  QUESTION_HISTORY: "db_question_history",
  ADAPTATIONS: "db_adaptations",
  LEARNING_SESSIONS: "db_learning_sessions",
  NOTES: "db_notes"
};

class DatabaseService {
  constructor() {
    this.isRemoteConfigured = false;
    this.firestore = null;
    this._initFirestore();
  }

  async _initFirestore() {
    // Attempt to connect to Firestore in browser when Firebase App is initialized
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      try {
        const { getApps } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
        const apps = getApps();
        if (apps.length > 0) {
          const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
          this.firestore = getFirestore(apps[0]);
          this.isRemoteConfigured = true;
        }
      } catch (err) {
        // Fallback gracefully to local persistent storage
        this.isRemoteConfigured = false;
      }
    }
  }

  // --- GENERIC COLLECTION HELPERS ---

  _getCollection(collectionKey) {
    return LocalStorageService.get(collectionKey, {});
  }

  _saveCollection(collectionKey, data) {
    LocalStorageService.set(collectionKey, data);
  }

  _generateId(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _extractUid(userOrUid) {
    if (!userOrUid) return null;
    if (typeof userOrUid === "object") {
      return userOrUid.uid || userOrUid.userId || null;
    }
    return String(userOrUid);
  }

  // --- USERS (Primary key: uid) ---

  async saveUser(user) {
    const uid = this._extractUid(user);
    if (!uid) throw new Error("Invalid user record: uid required");
    const users = this._getCollection(COLLECTIONS.USERS);
    const now = new Date().toISOString();
    const existing = users[uid] || {};

    const record = {
      ...existing,
      uid,
      userId: uid, // legacy backward-compatibility alias
      displayName: user.displayName || existing.displayName || "Candidate",
      email: user.email || existing.email || "",
      photoURL: user.photoURL || existing.photoURL || "",
      createdAt: existing.createdAt || user.createdAt || now,
      updatedAt: now
    };

    users[uid] = record;
    this._saveCollection(COLLECTIONS.USERS, users);
    return record;
  }

  async getUser(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return null;
    const users = this._getCollection(COLLECTIONS.USERS);
    return users[uid] || null;
  }

  // --- GOALS (Primary key: uid) ---

  async saveGoal(goal) {
    const uid = this._extractUid(goal.uid || goal.userId || goal);
    if (!uid) throw new Error("Goal requires a valid uid");
    const goals = this._getCollection(COLLECTIONS.GOALS);
    const goalId = goal.goalId || this._generateId("goal");
    const now = new Date().toISOString();
    const existing = goals[goalId] || {};

    const record = {
      ...existing,
      ...goal,
      goalId,
      uid,
      userId: uid,
      targetRole: goal.targetRole || goal.targetPosition || "Software Engineer",
      targetPosition: goal.targetPosition || goal.targetRole || "Software Engineer",
      targetCompany: goal.targetCompany || "Industry Standard",
      deadline: goal.deadline || "",
      dailyStudyMinutes: Number(goal.dailyStudyMinutes || goal.dailyMinutes || 60),
      dailyMinutes: Number(goal.dailyStudyMinutes || goal.dailyMinutes || 60),
      jobDescription: goal.jobDescription || "",
      resume: goal.resume || goal.resumeText || "",
      resumeText: goal.resumeText || goal.resume || "",
      experience: goal.experience || "",
      goalAnalysis: goal.goalAnalysis || null,
      createdAt: existing.createdAt || goal.createdAt || now,
      updatedAt: now
    };

    goals[goalId] = record;
    this._saveCollection(COLLECTIONS.GOALS, goals);
    return record;
  }

  async getGoalByUserId(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return null;
    const goals = this._getCollection(COLLECTIONS.GOALS);
    const userGoals = Object.values(goals).filter((g) => (g.uid === uid || g.userId === uid));
    return userGoals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
  }

  // --- LEARNING JOURNEY STATE ---

  async saveJourneyState(journey) {
    const uid = this._extractUid(journey.uid || journey.userId || journey);
    if (!uid) throw new Error("Journey state requires a valid uid");
    const journeys = this._getCollection(COLLECTIONS.JOURNEY_STATE);
    const now = new Date().toISOString();
    const existing = journeys[uid] || {};

    const record = {
      ...existing,
      ...journey,
      uid,
      userId: uid,
      journeyId: journey.journeyId || existing.journeyId || this._generateId("jrn"),
      status: journey.status || existing.status || "NOT_STARTED", // NOT_STARTED | LEARNING | ASSESSMENT | ANALYZING | COMPLETED | PAUSED
      currentTopicId: journey.currentTopicId || existing.currentTopicId || null,
      currentTopicIndex: typeof journey.currentTopicIndex === "number" ? journey.currentTopicIndex : (existing.currentTopicIndex ?? 0),
      currentModuleId: journey.currentModuleId || existing.currentModuleId || null,
      currentLessonState: journey.currentLessonState || existing.currentLessonState || null,
      currentAssessmentState: journey.currentAssessmentState || existing.currentAssessmentState || null,
      lastActiveAt: now,
      createdAt: existing.createdAt || now,
      updatedAt: now
    };

    journeys[uid] = record;
    this._saveCollection(COLLECTIONS.JOURNEY_STATE, journeys);
    return record;
  }

  async getJourneyState(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return null;
    const journeys = this._getCollection(COLLECTIONS.JOURNEY_STATE);
    return journeys[uid] || null;
  }

  // --- TOPIC PROGRESS ---

  async saveTopicProgress(progress) {
    const uid = this._extractUid(progress.uid || progress.userId);
    const topicId = progress.topicId;
    if (!uid || !topicId) throw new Error("Topic progress requires uid and topicId");

    const store = this._getCollection(COLLECTIONS.TOPIC_PROGRESS);
    const key = `${uid}___${topicId}`;
    const now = new Date().toISOString();
    const existing = store[key] || {};

    const record = {
      ...existing,
      ...progress,
      uid,
      userId: uid,
      topicId,
      topicIndex: typeof progress.topicIndex === "number" ? progress.topicIndex : (existing.topicIndex ?? 0),
      status: progress.status || existing.status || "AVAILABLE", // LOCKED | AVAILABLE | LEARNING | ASSESSMENT | COMPLETED | NEEDS_REVIEW | REINFORCED | ACCELERATED
      startedAt: existing.startedAt || progress.startedAt || now,
      completedAt: progress.completedAt || existing.completedAt || null,
      lastStudiedAt: now,
      lessonProgress: typeof progress.lessonProgress === "number" ? progress.lessonProgress : (existing.lessonProgress ?? 0),
      assessmentCompleted: progress.assessmentCompleted !== undefined ? Boolean(progress.assessmentCompleted) : Boolean(existing.assessmentCompleted),
      assessmentId: progress.assessmentId || existing.assessmentId || null,
      topicScore: progress.topicScore !== undefined ? progress.topicScore : existing.topicScore,
      mastery: progress.mastery !== undefined ? progress.mastery : existing.mastery,
      confidence: progress.confidence !== undefined ? progress.confidence : existing.confidence,
      updatedAt: now
    };

    store[key] = record;
    this._saveCollection(COLLECTIONS.TOPIC_PROGRESS, store);
    return record;
  }

  async getTopicProgress(userOrUid, topicId) {
    const uid = this._extractUid(userOrUid);
    if (!uid || !topicId) return null;
    const store = this._getCollection(COLLECTIONS.TOPIC_PROGRESS);
    return store[`${uid}___${topicId}`] || null;
  }

  async getAllTopicProgress(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return {};
    const store = this._getCollection(COLLECTIONS.TOPIC_PROGRESS);
    const result = {};
    const prefix = `${uid}___`;
    Object.entries(store).forEach(([k, v]) => {
      if (k.startsWith(prefix)) {
        result[v.topicId] = v;
      }
    });
    return result;
  }

  // --- SKILL PROFILES ---

  async saveSkillProfile(userOrUid, skills) {
    const uid = this._extractUid(userOrUid);
    if (!uid) throw new Error("Valid uid required for skill profile");
    const profiles = this._getCollection(COLLECTIONS.SKILL_PROFILES);
    const record = {
      uid,
      userId: uid,
      skills: skills || {},
      updatedAt: new Date().toISOString()
    };
    profiles[uid] = record;
    this._saveCollection(COLLECTIONS.SKILL_PROFILES, profiles);
    return record;
  }

  async getSkillProfile(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return {};
    const profiles = this._getCollection(COLLECTIONS.SKILL_PROFILES);
    return profiles[uid]?.skills || {};
  }

  // --- STUDY PLANS ---

  async saveStudyPlan(plan) {
    const uid = this._extractUid(plan.uid || plan.userId);
    if (!uid) throw new Error("Plan requires a valid uid");
    const plans = this._getCollection(COLLECTIONS.STUDY_PLANS);
    const planId = plan.planId || this._generateId("plan");
    const record = {
      ...plan,
      planId,
      uid,
      userId: uid,
      updatedAt: new Date().toISOString()
    };
    plans[planId] = record;
    this._saveCollection(COLLECTIONS.STUDY_PLANS, plans);
    return record;
  }

  async getStudyPlanByUserId(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return null;
    const plans = this._getCollection(COLLECTIONS.STUDY_PLANS);
    const userPlans = Object.values(plans).filter((p) => (p.uid === uid || p.userId === uid));
    return userPlans.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] || null;
  }

  // --- LESSONS (Topic Learning Content) ---

  async saveLesson({
    lessonId,
    uid,
    userId,
    topicId,
    content,
    timestamp,
    generatedAt,
    generationVersion = 1,
    curriculumVersion = 1,
    adaptationVersion = 1,
    masteryContext,
    status = "LEARNING"
  }) {
    const authoritativeUid = this._extractUid(uid || userId);
    if (!authoritativeUid || !topicId) throw new Error("Lesson requires uid and topicId");
    const lessons = this._getCollection(COLLECTIONS.LESSONS);
    const id = lessonId || this._generateId("les");
    const existing = lessons[id] || {};

    // Race condition protection: do not overwrite newer adaptation with stale generated content
    if (existing.adaptationVersion && adaptationVersion < existing.adaptationVersion) {
      console.warn(`Refusing to overwrite lesson ${id} with older adaptation version`);
      return existing;
    }

    const record = {
      ...existing,
      lessonId: id,
      uid: authoritativeUid,
      userId: authoritativeUid,
      topicId,
      content,
      generatedAt: generatedAt || timestamp || existing.generatedAt || new Date().toISOString(),
      generationVersion: Math.max(generationVersion, existing.generationVersion || 1),
      curriculumVersion: curriculumVersion || existing.curriculumVersion || 1,
      adaptationVersion: Math.max(adaptationVersion, existing.adaptationVersion || 1),
      masteryContext: masteryContext || existing.masteryContext || {},
      status, // PREPARED | LEARNING | ASSESSMENT | COMPLETED | NEEDS_REVIEW
      updatedAt: new Date().toISOString()
    };

    lessons[id] = record;
    this._saveCollection(COLLECTIONS.LESSONS, lessons);
    return record;
  }

  async getLesson(lessonId) {
    const lessons = this._getCollection(COLLECTIONS.LESSONS);
    return lessons[lessonId] || null;
  }

  async getLessonByUserAndTopic(userOrUid, topicId) {
    const uid = this._extractUid(userOrUid);
    if (!uid || !topicId) return null;
    const lessons = this._getCollection(COLLECTIONS.LESSONS);
    const userLessons = Object.values(lessons).filter(
      (l) => (l.uid === uid || l.userId === uid) && l.topicId === topicId
    );
    return userLessons.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] || null;
  }

  async updateLessonStatus(lessonId, status) {
    const lessons = this._getCollection(COLLECTIONS.LESSONS);
    if (lessons[lessonId]) {
      lessons[lessonId].status = status;
      lessons[lessonId].updatedAt = new Date().toISOString();
      this._saveCollection(COLLECTIONS.LESSONS, lessons);
      return lessons[lessonId];
    }
    return null;
  }

  // --- ASSESSMENTS (3-MCQ & Cumulative Sessions) ---

  async saveAssessment({
    assessmentId,
    uid,
    userId,
    topicId,
    assessmentType = "topic",
    coveredTopics = [],
    score,
    percentage,
    timestamp,
    generatedAt,
    generationVersion = 1,
    status = "COMPLETED",
    analysis = {},
    questions = [],
    questionCount = 3,
    answers = []
  }) {
    const authoritativeUid = this._extractUid(uid || userId);
    if (!authoritativeUid || !topicId) throw new Error("Assessment requires uid and topicId");
    const assessments = this._getCollection(COLLECTIONS.ASSESSMENTS);
    const id = assessmentId || this._generateId("asm");
    const existing = assessments[id] || {};

    const record = {
      ...existing,
      assessmentId: id,
      uid: authoritativeUid,
      userId: authoritativeUid,
      topicId,
      assessmentType, // "topic" | "cumulative"
      coveredTopics: Array.isArray(coveredTopics) && coveredTopics.length ? coveredTopics : [topicId],
      questionCount: questions.length || questionCount || 3,
      score: typeof score === "number" ? score : 0,
      percentage: typeof percentage === "number" ? percentage : 0,
      status, // "GENERATING" | "READY" | "COMPLETED" | "FAILED"
      generatedAt: generatedAt || timestamp || existing.generatedAt || new Date().toISOString(),
      completedAt: status === "COMPLETED" ? new Date().toISOString() : null,
      generationVersion: generationVersion || existing.generationVersion || 1,
      analysis,
      questions,
      answers
    };

    assessments[id] = record;
    this._saveCollection(COLLECTIONS.ASSESSMENTS, assessments);
    return record;
  }

  async getAssessment(assessmentId) {
    const assessments = this._getCollection(COLLECTIONS.ASSESSMENTS);
    return assessments[assessmentId] || null;
  }

  async getAssessmentsByUserAndTopic(userOrUid, topicId = null) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return [];
    const assessments = this._getCollection(COLLECTIONS.ASSESSMENTS);
    return Object.values(assessments)
      .filter((a) => (a.uid === uid || a.userId === uid) && (!topicId || a.topicId === topicId))
      .sort((a, b) => new Date(b.generatedAt || b.timestamp) - new Date(a.generatedAt || a.timestamp));
  }

  // --- DRAFT ANSWERS (Autosave & Reload Restoration) ---

  async saveDraftAnswers({ assessmentId, uid, userId, topicId, answers = [] }) {
    const authoritativeUid = this._extractUid(uid || userId);
    if (!authoritativeUid || !assessmentId) return;
    const store = this._getCollection(COLLECTIONS.DRAFT_ANSWERS);
    const key = `${authoritativeUid}___${assessmentId}`;
    store[key] = {
      assessmentId,
      uid: authoritativeUid,
      topicId,
      answers,
      updatedAt: new Date().toISOString()
    };
    this._saveCollection(COLLECTIONS.DRAFT_ANSWERS, store);
  }

  async getDraftAnswers(assessmentId, userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid || !assessmentId) return [];
    const store = this._getCollection(COLLECTIONS.DRAFT_ANSWERS);
    return store[`${uid}___${assessmentId}`]?.answers || [];
  }

  async clearDraftAnswers(assessmentId, userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid || !assessmentId) return;
    const store = this._getCollection(COLLECTIONS.DRAFT_ANSWERS);
    delete store[`${uid}___${assessmentId}`];
    this._saveCollection(COLLECTIONS.DRAFT_ANSWERS, store);
  }

  // --- QUESTION ATTEMPTS ---

  async recordQuestionAttempt(attempt) {
    const uid = this._extractUid(attempt.uid || attempt.userId);
    if (!uid) throw new Error("Attempt requires uid");
    const attempts = this._getCollection(COLLECTIONS.QUESTION_ATTEMPTS);
    const attemptId = this._generateId("att");
    const record = {
      ...attempt,
      attemptId,
      uid,
      userId: uid,
      timestamp: attempt.timestamp || new Date().toISOString()
    };
    attempts[attemptId] = record;
    this._saveCollection(COLLECTIONS.QUESTION_ATTEMPTS, attempts);
    return record;
  }

  async recordQuestionAttempts(attemptsList = []) {
    const results = [];
    for (const att of attemptsList) {
      const res = await this.recordQuestionAttempt(att);
      results.push(res);
    }
    return results;
  }

  async getRecentAttempts(userOrUid, limit = 10) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return [];
    const attempts = this._getCollection(COLLECTIONS.QUESTION_ATTEMPTS);
    return Object.values(attempts)
      .filter((a) => (a.uid === uid || a.userId === uid))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // --- QUESTION REPEAT HISTORY ---

  async getQuestionHistory(userOrUid, topicId) {
    const uid = this._extractUid(userOrUid);
    if (!uid || !topicId) return [];
    const history = this._getCollection(COLLECTIONS.QUESTION_HISTORY);
    const key = `${uid}___${topicId}`;
    return history[key] || [];
  }

  async saveQuestionHistory(userOrUid, topicId, questions = []) {
    const uid = this._extractUid(userOrUid);
    if (!uid || !topicId) return;
    const history = this._getCollection(COLLECTIONS.QUESTION_HISTORY);
    const key = `${uid}___${topicId}`;
    const existing = history[key] || [];
    const newTexts = questions.map((q) => (typeof q === "string" ? q : q.question)).filter(Boolean);
    const combined = Array.from(new Set([...existing, ...newTexts]));
    history[key] = combined;
    this._saveCollection(COLLECTIONS.QUESTION_HISTORY, history);
  }

  // --- ADAPTATIONS (Alternating Lanes, Distance Decay, Prerequisites) ---

  async saveAdaptation({
    adaptationId,
    uid,
    userId,
    sourceTopicId,
    sourceAssessmentId,
    targetTopicId,
    affectedTopicId,
    reason,
    effectStrength = 1.0,
    adaptationType = "odd_even_lane",
    previousState,
    newState,
    createdAt,
    timestamp,
    adaptationVersion = 1
  }) {
    const authoritativeUid = this._extractUid(uid || userId);
    if (!authoritativeUid) throw new Error("Adaptation requires uid");
    const adaptations = this._getCollection(COLLECTIONS.ADAPTATIONS);
    const id = adaptationId || this._generateId("adp");
    const record = {
      adaptationId: id,
      uid: authoritativeUid,
      userId: authoritativeUid,
      sourceTopicId: sourceTopicId || null,
      sourceAssessmentId: sourceAssessmentId || null,
      targetTopicId: targetTopicId || affectedTopicId,
      affectedTopicId: targetTopicId || affectedTopicId,
      reason,
      effectStrength,
      adaptationType, // "odd_even_lane" | "prerequisite_override" | "cumulative_reinforcement" | "acceleration"
      previousState: previousState || {},
      newState: newState || {},
      adaptationVersion,
      createdAt: createdAt || timestamp || new Date().toISOString()
    };
    adaptations[id] = record;
    this._saveCollection(COLLECTIONS.ADAPTATIONS, adaptations);
    return record;
  }

  async getAdaptations(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return [];
    const adaptations = this._getCollection(COLLECTIONS.ADAPTATIONS);
    return Object.values(adaptations)
      .filter((a) => (a.uid === uid || a.userId === uid))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // --- LEARNING SESSIONS ---

  async logLearningSession(session) {
    const uid = this._extractUid(session.uid || session.userId);
    const sessions = this._getCollection(COLLECTIONS.LEARNING_SESSIONS);
    const sessionId = this._generateId("sess");
    const record = {
      ...session,
      sessionId,
      uid,
      userId: uid,
      timestamp: new Date().toISOString()
    };
    sessions[sessionId] = record;
    this._saveCollection(COLLECTIONS.LEARNING_SESSIONS, sessions);
    return record;
  }

  async getTodayMinutesSpent(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return 0;
    const sessions = this._getCollection(COLLECTIONS.LEARNING_SESSIONS);
    const todayStr = new Date().toISOString().split("T")[0];
    return Object.values(sessions)
      .filter((s) => (s.uid === uid || s.userId === uid) && s.timestamp.startsWith(todayStr))
      .reduce((acc, s) => acc + (s.minutesSpent || 0), 0);
  }

  // --- NOTES ---

  async saveNote(note) {
    const uid = this._extractUid(note.uid || note.userId);
    if (!uid) throw new Error("Note requires uid");
    const notes = this._getCollection(COLLECTIONS.NOTES);
    const noteId = note.noteId || this._generateId("note");
    const record = {
      ...note,
      noteId,
      uid,
      userId: uid,
      createdAt: note.createdAt || new Date().toISOString()
    };
    notes[noteId] = record;
    this._saveCollection(COLLECTIONS.NOTES, notes);
    return record;
  }

  async getNotesByUserId(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return [];
    const notes = this._getCollection(COLLECTIONS.NOTES);
    return Object.values(notes)
      .filter((n) => (n.uid === uid || n.userId === uid))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export const databaseService = new DatabaseService();
