// ===================================================
// PATH FORGE - DATABASE SERVICE LAYER
// Unified persistence interface supporting remote & persistent local fallback
// ===================================================

import { LocalStorageService } from "../storage/localStorageService.js";

/**
 * Storage keys for entity collections.
 */
const COLLECTIONS = {
  USERS: "db_users",
  GOALS: "db_goals",
  SKILL_PROFILES: "db_skill_profiles",
  STUDY_PLANS: "db_study_plans",
  PLAN_ITEMS: "db_plan_items",
  LESSONS: "db_lessons",
  QUESTIONS: "db_questions",
  QUESTION_ATTEMPTS: "db_question_attempts",
  LEARNING_SESSIONS: "db_learning_sessions",
  NOTES: "db_notes"
};

class DatabaseService {
  constructor() {
    this.isRemoteConfigured = false; // Set to true when remote database endpoint/URL is integrated
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

  // --- USERS ---

  async saveUser(user) {
    if (!user || !user.userId) throw new Error("Invalid user record");
    const users = this._getCollection(COLLECTIONS.USERS);
    const now = new Date().toISOString();
    const existing = users[user.userId] || {};

    const record = {
      ...existing,
      ...user,
      createdAt: existing.createdAt || now,
      updatedAt: now
    };

    users[user.userId] = record;
    this._saveCollection(COLLECTIONS.USERS, users);
    return record;
  }

  async getUser(userId) {
    const users = this._getCollection(COLLECTIONS.USERS);
    return users[userId] || null;
  }

  // --- GOALS ---

  async saveGoal(goal) {
    if (!goal || !goal.userId) throw new Error("Goal requires a valid userId");
    const goals = this._getCollection(COLLECTIONS.GOALS);
    const goalId = goal.goalId || this._generateId("goal");
    const record = {
      ...goal,
      goalId,
      createdAt: goal.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    goals[goalId] = record;
    this._saveCollection(COLLECTIONS.GOALS, goals);
    return record;
  }

  async getGoalByUserId(userId) {
    const goals = this._getCollection(COLLECTIONS.GOALS);
    const userGoals = Object.values(goals).filter((g) => g.userId === userId);
    // Return latest goal
    return userGoals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
  }

  // --- SKILL PROFILES ---

  async saveSkillProfile(userId, skills) {
    if (!userId) throw new Error("Valid userId required for skill profile");
    const profiles = this._getCollection(COLLECTIONS.SKILL_PROFILES);
    const record = {
      userId,
      skills: skills || {},
      updatedAt: new Date().toISOString()
    };
    profiles[userId] = record;
    this._saveCollection(COLLECTIONS.SKILL_PROFILES, profiles);
    return record;
  }

  async getSkillProfile(userId) {
    const profiles = this._getCollection(COLLECTIONS.SKILL_PROFILES);
    return profiles[userId]?.skills || {};
  }

  // --- STUDY PLANS & PLAN ITEMS ---

  async saveStudyPlan(plan) {
    if (!plan || !plan.userId) throw new Error("Plan requires a valid userId");
    const plans = this._getCollection(COLLECTIONS.STUDY_PLANS);
    const planId = plan.planId || this._generateId("plan");
    const record = {
      ...plan,
      planId,
      updatedAt: new Date().toISOString()
    };
    plans[planId] = record;
    this._saveCollection(COLLECTIONS.STUDY_PLANS, plans);
    return record;
  }

  async getStudyPlanByUserId(userId) {
    const plans = this._getCollection(COLLECTIONS.STUDY_PLANS);
    const userPlans = Object.values(plans).filter((p) => p.userId === userId);
    return userPlans.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] || null;
  }

  // --- QUESTION ATTEMPTS ---

  async recordQuestionAttempt(attempt) {
    if (!attempt || !attempt.userId) throw new Error("Attempt requires userId");
    const attempts = this._getCollection(COLLECTIONS.QUESTION_ATTEMPTS);
    const attemptId = this._generateId("att");
    const record = {
      ...attempt,
      attemptId,
      timestamp: new Date().toISOString()
    };
    attempts[attemptId] = record;
    this._saveCollection(COLLECTIONS.QUESTION_ATTEMPTS, attempts);
    return record;
  }

  async getRecentAttempts(userId, limit = 10) {
    const attempts = this._getCollection(COLLECTIONS.QUESTION_ATTEMPTS);
    return Object.values(attempts)
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // --- LEARNING SESSIONS ---

  async logLearningSession(session) {
    const sessions = this._getCollection(COLLECTIONS.LEARNING_SESSIONS);
    const sessionId = this._generateId("sess");
    const record = {
      ...session,
      sessionId,
      timestamp: new Date().toISOString()
    };
    sessions[sessionId] = record;
    this._saveCollection(COLLECTIONS.LEARNING_SESSIONS, sessions);
    return record;
  }

  async getTodayMinutesSpent(userId) {
    const sessions = this._getCollection(COLLECTIONS.LEARNING_SESSIONS);
    const todayStr = new Date().toISOString().split("T")[0];
    return Object.values(sessions)
      .filter((s) => s.userId === userId && s.timestamp.startsWith(todayStr))
      .reduce((acc, s) => acc + (s.minutesSpent || 0), 0);
  }

  // --- NOTES ---

  async saveNote(note) {
    if (!note || !note.userId) throw new Error("Note requires userId");
    const notes = this._getCollection(COLLECTIONS.NOTES);
    const noteId = note.noteId || this._generateId("note");
    const record = {
      ...note,
      noteId,
      createdAt: note.createdAt || new Date().toISOString()
    };
    notes[noteId] = record;
    this._saveCollection(COLLECTIONS.NOTES, notes);
    return record;
  }

  async getNotesByUserId(userId) {
    const notes = this._getCollection(COLLECTIONS.NOTES);
    return Object.values(notes)
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export const databaseService = new DatabaseService();
