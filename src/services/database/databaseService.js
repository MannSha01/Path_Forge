// ===================================================
// PATH FORGE - DATABASE SERVICE LAYER
// Backend Database (Firebase Firestore) as Authoritative Source of Truth
// with LocalStorage as Cache and Offline Fallback
// Canonical Account Key: Firebase Auth UID
//
// INITIALIZATION ORDER:
//   1. DatabaseService is constructed (Firestore NOT yet ready)
//   2. AuthService initializes Firebase App
//   3. AuthService calls databaseService.initFirestoreAfterAuth(app)
//   4. Firestore is now configured and all remote ops work
// ===================================================

import { LocalStorageService } from "../storage/localStorageService.js";

/**
 * Storage collection identifiers
 */
const COLLECTIONS = {
  USERS: "users",
  GOALS: "goals",
  JOURNEY_STATE: "journey_state",
  TOPIC_PROGRESS: "topic_progress",
  SKILL_PROFILES: "skill_profiles",
  STUDY_PLANS: "study_plans",
  PLAN_ITEMS: "plan_items",
  LESSONS: "lessons",
  ASSESSMENTS: "assessments",
  DRAFT_ANSWERS: "draft_answers",
  QUESTIONS: "questions",
  QUESTION_ATTEMPTS: "question_attempts",
  QUESTION_HISTORY: "question_history",
  ADAPTATIONS: "adaptations",
  LEARNING_SESSIONS: "learning_sessions",
  NOTES: "notes",
  CMS_TOPICS: "cms_topics",
  CMS_MODULES: "cms_modules",
  CMS_MEDIA: "cms_media",
  ADMIN_USERS: "admin_users"
};

// Local storage prefix for cached collections
const LOCAL_COLLECTIONS = {
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
  NOTES: "db_notes",
  CMS_TOPICS: "db_cms_topics",
  CMS_MODULES: "db_cms_modules",
  CMS_MEDIA: "db_cms_media",
  ADMIN_USERS: "db_admin_users"
};

class DatabaseService {
  constructor() {
    this.isRemoteConfigured = false;
    this.firestore = null;
    this.firestoreSDK = null;
    // NOTE: We do NOT call _initFirestore() here.
    // Firebase App may not exist yet (AuthService hasn't called initializeApp).
    // initFirestoreAfterAuth(app) is called by AuthService after Firebase is ready.
  }

  // =================================================
  // FIRESTORE INITIALIZATION — called by AuthService after Firebase app is ready
  // This solves the race condition where DatabaseService is constructed
  // before AuthService has called initializeApp().
  // =================================================

  async initFirestoreAfterAuth(firebaseApp) {
    if (this.isRemoteConfigured) return; // Already initialized

    try {
      if (typeof window !== "undefined") {
        const firestoreMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
        this.firestore = firestoreMod.getFirestore(firebaseApp);
        this.firestoreSDK = firestoreMod;
        this.isRemoteConfigured = true;
        console.log("[DatabaseService] Firestore initialized successfully.");
      } else {
        // Node.js (tests / SSR)
        try {
          const firestoreMod = await import("firebase/firestore");
          this.firestore = firestoreMod.getFirestore(firebaseApp);
          this.firestoreSDK = firestoreMod;
          this.isRemoteConfigured = true;
        } catch {
          this.isRemoteConfigured = false;
        }
      }
    } catch (err) {
      console.warn("[DatabaseService] Firestore initialization failed, falling back to local storage:", err.message);
      this.isRemoteConfigured = false;
    }
  }

  // =================================================
  // DUAL-TIER REMOTE SYNC HELPERS
  // =================================================

  async _syncRemoteDoc(collectionName, docId, data) {
    if (!this.firestore || !this.firestoreSDK || !docId) return;
    try {
      const { doc, setDoc } = this.firestoreSDK;
      const docRef = doc(this.firestore, collectionName, docId);
      await setDoc(docRef, data, { merge: true });
    } catch (err) {
      console.warn(`[DatabaseService] Remote sync to ${collectionName}/${docId} failed:`, err.message);
    }
  }

  async _fetchRemoteDoc(collectionName, docId) {
    if (!this.firestore || !this.firestoreSDK || !docId) return null;
    try {
      const { doc, getDoc } = this.firestoreSDK;
      const docRef = doc(this.firestore, collectionName, docId);
      const snap = await getDoc(docRef);
      if (snap && snap.exists()) {
        return snap.data();
      }
    } catch (err) {
      console.warn(`[DatabaseService] Remote read from ${collectionName}/${docId} failed:`, err.message);
    }
    return null;
  }

  async _queryRemoteDocs(collectionName, field, value) {
    if (!this.firestore || !this.firestoreSDK || !value) return [];
    try {
      const { collection, query, where, getDocs } = this.firestoreSDK;
      const q = query(collection(this.firestore, collectionName), where(field, "==", value));
      const snap = await getDocs(q);
      const results = [];
      snap.forEach((d) => results.push(d.data()));
      return results;
    } catch (err) {
      console.warn(`[DatabaseService] Remote query on ${collectionName} failed:`, err.message);
      return [];
    }
  }

  // =================================================
  // LOCAL CACHE HELPERS
  // =================================================

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

  // =================================================
  // USERS (Primary key: Firebase UID)
  // =================================================

  async saveUser(user) {
    const uid = this._extractUid(user);
    if (!uid) throw new Error("Invalid user record: uid required");
    const users = this._getCollection(LOCAL_COLLECTIONS.USERS);
    const now = new Date().toISOString();
    const existing = users[uid] || {};

    const record = {
      ...existing,
      uid,
      userId: uid,
      displayName: user.displayName || existing.displayName || "Candidate",
      email: user.email || existing.email || "",
      photoURL: user.photoURL || existing.photoURL || "",
      createdAt: existing.createdAt || user.createdAt || now,
      updatedAt: now
    };

    // 1. Update local cache
    users[uid] = record;
    this._saveCollection(LOCAL_COLLECTIONS.USERS, users);

    // 2. Persist to authoritative backend database
    await this._syncRemoteDoc(COLLECTIONS.USERS, uid, record);

    return record;
  }

  async getUser(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return null;

    // 1. Try authoritative backend database first
    const remote = await this._fetchRemoteDoc(COLLECTIONS.USERS, uid);
    if (remote) {
      const users = this._getCollection(LOCAL_COLLECTIONS.USERS);
      users[uid] = remote;
      this._saveCollection(LOCAL_COLLECTIONS.USERS, users);
      return remote;
    }

    // 2. Fall back to local cache
    const users = this._getCollection(LOCAL_COLLECTIONS.USERS);
    return users[uid] || null;
  }

  // =================================================
  // GOALS (Primary key: goalId, associated with Firebase UID)
  // =================================================

  async saveGoal(goal) {
    const uid = this._extractUid(goal.uid || goal.userId || goal);
    if (!uid) throw new Error("Goal requires a valid uid");
    const goals = this._getCollection(LOCAL_COLLECTIONS.GOALS);
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

    // 1. Update local cache
    goals[goalId] = record;
    this._saveCollection(LOCAL_COLLECTIONS.GOALS, goals);

    // 2. Persist to authoritative backend database
    await this._syncRemoteDoc(COLLECTIONS.GOALS, goalId, record);

    return record;
  }

  async getGoalByUserId(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return null;

    // 1. Try authoritative backend database
    const remoteGoals = await this._queryRemoteDocs(COLLECTIONS.GOALS, "uid", uid);
    if (remoteGoals && remoteGoals.length > 0) {
      const goals = this._getCollection(LOCAL_COLLECTIONS.GOALS);
      remoteGoals.forEach((g) => {
        goals[g.goalId] = g;
      });
      this._saveCollection(LOCAL_COLLECTIONS.GOALS, goals);
      return remoteGoals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    }

    // 2. Fall back to local cache
    const goals = this._getCollection(LOCAL_COLLECTIONS.GOALS);
    const userGoals = Object.values(goals).filter((g) => g.uid === uid || g.userId === uid);
    return userGoals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
  }

  // =================================================
  // LEARNING JOURNEY STATE (Primary key: Firebase UID)
  // =================================================

  async saveJourneyState(journey) {
    const uid = this._extractUid(journey.uid || journey.userId || journey);
    if (!uid) throw new Error("Journey state requires a valid uid");
    const journeys = this._getCollection(LOCAL_COLLECTIONS.JOURNEY_STATE);
    const now = new Date().toISOString();
    const existing = journeys[uid] || {};

    const record = {
      ...existing,
      ...journey,
      uid,
      userId: uid,
      journeyId: journey.journeyId || existing.journeyId || this._generateId("jrn"),
      status: journey.status || existing.status || "NOT_STARTED",
      currentTopicId: journey.currentTopicId || existing.currentTopicId || null,
      currentTopicIndex: typeof journey.currentTopicIndex === "number" ? journey.currentTopicIndex : (existing.currentTopicIndex ?? 0),
      currentModuleId: journey.currentModuleId || existing.currentModuleId || null,
      currentLessonState: journey.currentLessonState || existing.currentLessonState || null,
      currentAssessmentState: journey.currentAssessmentState || existing.currentAssessmentState || null,
      lastActiveAt: now,
      createdAt: existing.createdAt || now,
      updatedAt: now
    };

    // 1. Update local cache
    journeys[uid] = record;
    this._saveCollection(LOCAL_COLLECTIONS.JOURNEY_STATE, journeys);

    // 2. Persist to authoritative backend database
    await this._syncRemoteDoc(COLLECTIONS.JOURNEY_STATE, uid, record);

    return record;
  }

  async getJourneyState(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return null;

    // 1. Try authoritative backend database
    const remote = await this._fetchRemoteDoc(COLLECTIONS.JOURNEY_STATE, uid);
    if (remote) {
      const journeys = this._getCollection(LOCAL_COLLECTIONS.JOURNEY_STATE);
      journeys[uid] = remote;
      this._saveCollection(LOCAL_COLLECTIONS.JOURNEY_STATE, journeys);
      return remote;
    }

    // 2. Fall back to local cache
    const journeys = this._getCollection(LOCAL_COLLECTIONS.JOURNEY_STATE);
    return journeys[uid] || null;
  }

  // =================================================
  // TOPIC PROGRESS (Primary key: ${uid}___${topicId})
  // =================================================

  async saveTopicProgress(progress) {
    const uid = this._extractUid(progress.uid || progress.userId);
    const topicId = progress.topicId;
    if (!uid || !topicId) throw new Error("Topic progress requires uid and topicId");

    const store = this._getCollection(LOCAL_COLLECTIONS.TOPIC_PROGRESS);
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
      status: progress.status || existing.status || "AVAILABLE",
      startedAt: existing.startedAt || progress.startedAt || now,
      completedAt: progress.completedAt || (progress.status === "COMPLETED" ? now : existing.completedAt) || null,
      lastStudiedAt: now,
      lessonProgress: typeof progress.lessonProgress === "number" ? progress.lessonProgress : (existing.lessonProgress ?? 0),
      assessmentCompleted: progress.assessmentCompleted !== undefined ? Boolean(progress.assessmentCompleted) : Boolean(existing.assessmentCompleted),
      assessmentId: progress.assessmentId || existing.assessmentId || null,
      topicScore: progress.topicScore !== undefined ? progress.topicScore : existing.topicScore,
      mastery: progress.mastery !== undefined ? progress.mastery : existing.mastery,
      confidence: progress.confidence !== undefined ? progress.confidence : existing.confidence,
      updatedAt: now
    };

    // 1. Update local cache
    store[key] = record;
    this._saveCollection(LOCAL_COLLECTIONS.TOPIC_PROGRESS, store);

    // 2. Sync to user completed topics local map
    if (record.status === "COMPLETED" || record.completedAt) {
      const userCompleted = LocalStorageService.getUserCompletedTopics(uid);
      userCompleted[topicId] = true;
      LocalStorageService.setUserCompletedTopics(uid, userCompleted);
    }

    // 3. Persist to authoritative backend database
    await this._syncRemoteDoc(COLLECTIONS.TOPIC_PROGRESS, key, record);

    return record;
  }

  async getTopicProgress(userOrUid, topicId) {
    const uid = this._extractUid(userOrUid);
    if (!uid || !topicId) return null;
    const key = `${uid}___${topicId}`;

    // 1. Try authoritative backend database
    const remote = await this._fetchRemoteDoc(COLLECTIONS.TOPIC_PROGRESS, key);
    if (remote) {
      const store = this._getCollection(LOCAL_COLLECTIONS.TOPIC_PROGRESS);
      store[key] = remote;
      this._saveCollection(LOCAL_COLLECTIONS.TOPIC_PROGRESS, store);
      return remote;
    }

    // 2. Fall back to local cache
    const store = this._getCollection(LOCAL_COLLECTIONS.TOPIC_PROGRESS);
    return store[key] || null;
  }

  async getAllTopicProgress(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return {};

    // 1. Try authoritative backend database
    const remoteList = await this._queryRemoteDocs(COLLECTIONS.TOPIC_PROGRESS, "uid", uid);
    if (remoteList && remoteList.length > 0) {
      const store = this._getCollection(LOCAL_COLLECTIONS.TOPIC_PROGRESS);
      const result = {};
      remoteList.forEach((r) => {
        store[`${uid}___${r.topicId}`] = r;
        result[r.topicId] = r;
      });
      this._saveCollection(LOCAL_COLLECTIONS.TOPIC_PROGRESS, store);
      return result;
    }

    // 2. Fall back to local cache
    const store = this._getCollection(LOCAL_COLLECTIONS.TOPIC_PROGRESS);
    const result = {};
    const prefix = `${uid}___`;
    Object.entries(store).forEach(([k, v]) => {
      if (k.startsWith(prefix)) {
        result[v.topicId] = v;
      }
    });
    return result;
  }

  // =================================================
  // SKILL PROFILES (Primary key: Firebase UID)
  // =================================================

  async saveSkillProfile(userOrUid, skills) {
    const uid = this._extractUid(userOrUid);
    if (!uid) throw new Error("Valid uid required for skill profile");
    const profiles = this._getCollection(LOCAL_COLLECTIONS.SKILL_PROFILES);
    const record = {
      uid,
      userId: uid,
      skills: skills || {},
      updatedAt: new Date().toISOString()
    };

    // 1. Update local cache
    profiles[uid] = record;
    this._saveCollection(LOCAL_COLLECTIONS.SKILL_PROFILES, profiles);

    // 2. Persist to authoritative backend database
    await this._syncRemoteDoc(COLLECTIONS.SKILL_PROFILES, uid, record);

    return record;
  }

  async getSkillProfile(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return {};

    // 1. Try authoritative backend database
    const remote = await this._fetchRemoteDoc(COLLECTIONS.SKILL_PROFILES, uid);
    if (remote && remote.skills) {
      const profiles = this._getCollection(LOCAL_COLLECTIONS.SKILL_PROFILES);
      profiles[uid] = remote;
      this._saveCollection(LOCAL_COLLECTIONS.SKILL_PROFILES, profiles);
      return remote.skills;
    }

    // 2. Fall back to local cache
    const profiles = this._getCollection(LOCAL_COLLECTIONS.SKILL_PROFILES);
    return profiles[uid]?.skills || {};
  }

  // =================================================
  // STUDY PLANS (Primary key: planId, associated with Firebase UID)
  // =================================================

  async saveStudyPlan(plan) {
    const uid = this._extractUid(plan.uid || plan.userId);
    if (!uid) throw new Error("Plan requires a valid uid");
    const plans = this._getCollection(LOCAL_COLLECTIONS.STUDY_PLANS);
    const planId = plan.planId || this._generateId("plan");
    const record = {
      ...plan,
      planId,
      uid,
      userId: uid,
      updatedAt: new Date().toISOString()
    };

    // 1. Update local cache
    plans[planId] = record;
    this._saveCollection(LOCAL_COLLECTIONS.STUDY_PLANS, plans);

    // 2. Persist to authoritative backend database
    await this._syncRemoteDoc(COLLECTIONS.STUDY_PLANS, planId, record);

    return record;
  }

  async getStudyPlanByUserId(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return null;

    // 1. Try authoritative backend database
    const remotePlans = await this._queryRemoteDocs(COLLECTIONS.STUDY_PLANS, "uid", uid);
    if (remotePlans && remotePlans.length > 0) {
      const plans = this._getCollection(LOCAL_COLLECTIONS.STUDY_PLANS);
      remotePlans.forEach((p) => {
        plans[p.planId] = p;
      });
      this._saveCollection(LOCAL_COLLECTIONS.STUDY_PLANS, plans);
      return remotePlans.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
    }

    // 2. Fall back to local cache
    const plans = this._getCollection(LOCAL_COLLECTIONS.STUDY_PLANS);
    const userPlans = Object.values(plans).filter((p) => p.uid === uid || p.userId === uid);
    return userPlans.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] || null;
  }

  // =================================================
  // LESSONS (Topic Learning Content)
  // =================================================

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
    const lessons = this._getCollection(LOCAL_COLLECTIONS.LESSONS);
    const id = lessonId || this._generateId("les");
    const existing = lessons[id] || {};

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
      status,
      updatedAt: new Date().toISOString()
    };

    // 1. Update local cache
    lessons[id] = record;
    this._saveCollection(LOCAL_COLLECTIONS.LESSONS, lessons);

    // 2. Persist to authoritative backend database
    await this._syncRemoteDoc(COLLECTIONS.LESSONS, id, record);

    return record;
  }

  async getLesson(lessonId) {
    const lessons = this._getCollection(LOCAL_COLLECTIONS.LESSONS);
    return lessons[lessonId] || null;
  }

  async getLessonByUserAndTopic(userOrUid, topicId) {
    const uid = this._extractUid(userOrUid);
    if (!uid || !topicId) return null;

    // 1. Try authoritative backend database
    const remoteList = await this._queryRemoteDocs(COLLECTIONS.LESSONS, "uid", uid);
    if (remoteList && remoteList.length > 0) {
      const lessons = this._getCollection(LOCAL_COLLECTIONS.LESSONS);
      remoteList.forEach((l) => {
        lessons[l.lessonId] = l;
      });
      this._saveCollection(LOCAL_COLLECTIONS.LESSONS, lessons);
      const match = remoteList
        .filter((l) => l.topicId === topicId)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
      if (match) return match;
    }

    // 2. Fall back to local cache
    const lessons = this._getCollection(LOCAL_COLLECTIONS.LESSONS);
    const userLessons = Object.values(lessons).filter(
      (l) => (l.uid === uid || l.userId === uid) && l.topicId === topicId
    );
    return userLessons.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] || null;
  }

  async updateLessonStatus(lessonId, status) {
    const lessons = this._getCollection(LOCAL_COLLECTIONS.LESSONS);
    if (lessons[lessonId]) {
      lessons[lessonId].status = status;
      lessons[lessonId].updatedAt = new Date().toISOString();
      this._saveCollection(LOCAL_COLLECTIONS.LESSONS, lessons);
      await this._syncRemoteDoc(COLLECTIONS.LESSONS, lessonId, lessons[lessonId]);
      return lessons[lessonId];
    }
    return null;
  }

  // =================================================
  // ASSESSMENTS (3-MCQ & Cumulative Sessions)
  // =================================================

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
    const assessments = this._getCollection(LOCAL_COLLECTIONS.ASSESSMENTS);
    const id = assessmentId || this._generateId("asm");
    const existing = assessments[id] || {};

    const record = {
      ...existing,
      assessmentId: id,
      uid: authoritativeUid,
      userId: authoritativeUid,
      topicId,
      assessmentType,
      coveredTopics: Array.isArray(coveredTopics) && coveredTopics.length ? coveredTopics : [topicId],
      questionCount: questions.length || questionCount || 3,
      score: typeof score === "number" ? score : 0,
      percentage: typeof percentage === "number" ? percentage : 0,
      status,
      generatedAt: generatedAt || timestamp || existing.generatedAt || new Date().toISOString(),
      completedAt: status === "COMPLETED" ? new Date().toISOString() : null,
      generationVersion: generationVersion || existing.generationVersion || 1,
      analysis,
      questions,
      answers
    };

    // 1. Update local cache
    assessments[id] = record;
    this._saveCollection(LOCAL_COLLECTIONS.ASSESSMENTS, assessments);

    // 2. Persist to authoritative backend database
    await this._syncRemoteDoc(COLLECTIONS.ASSESSMENTS, id, record);

    return record;
  }

  async getAssessment(assessmentId) {
    const assessments = this._getCollection(LOCAL_COLLECTIONS.ASSESSMENTS);
    return assessments[assessmentId] || null;
  }

  async getAssessmentsByUserAndTopic(userOrUid, topicId = null) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return [];

    // 1. Try authoritative backend database
    const remoteList = await this._queryRemoteDocs(COLLECTIONS.ASSESSMENTS, "uid", uid);
    if (remoteList && remoteList.length > 0) {
      const assessments = this._getCollection(LOCAL_COLLECTIONS.ASSESSMENTS);
      remoteList.forEach((a) => {
        assessments[a.assessmentId] = a;
      });
      this._saveCollection(LOCAL_COLLECTIONS.ASSESSMENTS, assessments);
      return remoteList
        .filter((a) => !topicId || a.topicId === topicId)
        .sort((a, b) => new Date(b.generatedAt || b.timestamp) - new Date(a.generatedAt || a.timestamp));
    }

    // 2. Fall back to local cache
    const assessments = this._getCollection(LOCAL_COLLECTIONS.ASSESSMENTS);
    return Object.values(assessments)
      .filter((a) => (a.uid === uid || a.userId === uid) && (!topicId || a.topicId === topicId))
      .sort((a, b) => new Date(b.generatedAt || b.timestamp) - new Date(a.generatedAt || a.timestamp));
  }

  // =================================================
  // DRAFT ANSWERS (Autosave & Reload Restoration)
  // =================================================

  async saveDraftAnswers({ assessmentId, uid, userId, topicId, answers = [] }) {
    const authoritativeUid = this._extractUid(uid || userId);
    if (!authoritativeUid || !assessmentId) return;
    const store = this._getCollection(LOCAL_COLLECTIONS.DRAFT_ANSWERS);
    const key = `${authoritativeUid}___${assessmentId}`;
    store[key] = {
      assessmentId,
      uid: authoritativeUid,
      topicId,
      answers,
      updatedAt: new Date().toISOString()
    };
    this._saveCollection(LOCAL_COLLECTIONS.DRAFT_ANSWERS, store);
  }

  async getDraftAnswers(assessmentId, userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid || !assessmentId) return [];
    const store = this._getCollection(LOCAL_COLLECTIONS.DRAFT_ANSWERS);
    return store[`${uid}___${assessmentId}`]?.answers || [];
  }

  async clearDraftAnswers(assessmentId, userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid || !assessmentId) return;
    const store = this._getCollection(LOCAL_COLLECTIONS.DRAFT_ANSWERS);
    delete store[`${uid}___${assessmentId}`];
    this._saveCollection(LOCAL_COLLECTIONS.DRAFT_ANSWERS, store);
  }

  // =================================================
  // QUESTION ATTEMPTS
  // =================================================

  async recordQuestionAttempt(attempt) {
    const uid = this._extractUid(attempt.uid || attempt.userId);
    if (!uid) throw new Error("Attempt requires uid");
    const attempts = this._getCollection(LOCAL_COLLECTIONS.QUESTION_ATTEMPTS);
    const attemptId = this._generateId("att");
    const record = {
      ...attempt,
      attemptId,
      uid,
      userId: uid,
      timestamp: attempt.timestamp || new Date().toISOString()
    };
    attempts[attemptId] = record;
    this._saveCollection(LOCAL_COLLECTIONS.QUESTION_ATTEMPTS, attempts);
    await this._syncRemoteDoc(COLLECTIONS.QUESTION_ATTEMPTS, attemptId, record);
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
    const attempts = this._getCollection(LOCAL_COLLECTIONS.QUESTION_ATTEMPTS);
    return Object.values(attempts)
      .filter((a) => a.uid === uid || a.userId === uid)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // =================================================
  // QUESTION REPEAT HISTORY
  // =================================================

  async getQuestionHistory(userOrUid, topicId) {
    const uid = this._extractUid(userOrUid);
    if (!uid || !topicId) return [];
    const history = this._getCollection(LOCAL_COLLECTIONS.QUESTION_HISTORY);
    const key = `${uid}___${topicId}`;
    return history[key] || [];
  }

  async saveQuestionHistory(userOrUid, topicId, questions = []) {
    const uid = this._extractUid(userOrUid);
    if (!uid || !topicId) return;
    const history = this._getCollection(LOCAL_COLLECTIONS.QUESTION_HISTORY);
    const key = `${uid}___${topicId}`;
    const existing = history[key] || [];
    const newTexts = questions.map((q) => (typeof q === "string" ? q : q.question)).filter(Boolean);
    const combined = Array.from(new Set([...existing, ...newTexts]));
    history[key] = combined;
    this._saveCollection(LOCAL_COLLECTIONS.QUESTION_HISTORY, history);
  }

  // =================================================
  // ADAPTATIONS
  // =================================================

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
    const adaptations = this._getCollection(LOCAL_COLLECTIONS.ADAPTATIONS);
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
      adaptationType,
      previousState: previousState || {},
      newState: newState || {},
      adaptationVersion,
      createdAt: createdAt || timestamp || new Date().toISOString()
    };
    adaptations[id] = record;
    this._saveCollection(LOCAL_COLLECTIONS.ADAPTATIONS, adaptations);
    await this._syncRemoteDoc(COLLECTIONS.ADAPTATIONS, id, record);
    return record;
  }

  async getAdaptations(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return [];

    // 1. Try authoritative backend database
    const remoteList = await this._queryRemoteDocs(COLLECTIONS.ADAPTATIONS, "uid", uid);
    if (remoteList && remoteList.length > 0) {
      const adaptations = this._getCollection(LOCAL_COLLECTIONS.ADAPTATIONS);
      remoteList.forEach((a) => {
        adaptations[a.adaptationId] = a;
      });
      this._saveCollection(LOCAL_COLLECTIONS.ADAPTATIONS, adaptations);
      return remoteList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // 2. Fall back to local cache
    const adaptations = this._getCollection(LOCAL_COLLECTIONS.ADAPTATIONS);
    return Object.values(adaptations)
      .filter((a) => a.uid === uid || a.userId === uid)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // =================================================
  // LEARNING SESSIONS
  // =================================================

  async logLearningSession(session) {
    const uid = this._extractUid(session.uid || session.userId);
    const sessions = this._getCollection(LOCAL_COLLECTIONS.LEARNING_SESSIONS);
    const sessionId = this._generateId("sess");
    const record = {
      ...session,
      sessionId,
      uid,
      userId: uid,
      timestamp: new Date().toISOString()
    };
    sessions[sessionId] = record;
    this._saveCollection(LOCAL_COLLECTIONS.LEARNING_SESSIONS, sessions);
    await this._syncRemoteDoc(COLLECTIONS.LEARNING_SESSIONS, sessionId, record);
    return record;
  }

  async getTodayMinutesSpent(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return 0;
    const sessions = this._getCollection(LOCAL_COLLECTIONS.LEARNING_SESSIONS);
    const todayStr = new Date().toISOString().split("T")[0];
    return Object.values(sessions)
      .filter((s) => (s.uid === uid || s.userId === uid) && s.timestamp.startsWith(todayStr))
      .reduce((acc, s) => acc + (s.minutesSpent || 0), 0);
  }

  // =================================================
  // NOTES
  // =================================================

  async saveNote(note) {
    const uid = this._extractUid(note.uid || note.userId);
    if (!uid) throw new Error("Note requires uid");
    const notes = this._getCollection(LOCAL_COLLECTIONS.NOTES);
    const noteId = note.noteId || this._generateId("note");
    const record = {
      ...note,
      noteId,
      uid,
      userId: uid,
      createdAt: note.createdAt || new Date().toISOString()
    };
    notes[noteId] = record;
    this._saveCollection(LOCAL_COLLECTIONS.NOTES, notes);
    await this._syncRemoteDoc(COLLECTIONS.NOTES, noteId, record);
    return record;
  }

  async getNotesByUserId(userOrUid) {
    const uid = this._extractUid(userOrUid);
    if (!uid) return [];

    // 1. Try authoritative backend database
    const remoteList = await this._queryRemoteDocs(COLLECTIONS.NOTES, "uid", uid);
    if (remoteList && remoteList.length > 0) {
      const notes = this._getCollection(LOCAL_COLLECTIONS.NOTES);
      remoteList.forEach((n) => {
        notes[n.noteId] = n;
      });
      this._saveCollection(LOCAL_COLLECTIONS.NOTES, notes);
      return remoteList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // 2. Fall back to local cache
    const notes = this._getCollection(LOCAL_COLLECTIONS.NOTES);
    return Object.values(notes)
      .filter((n) => n.uid === uid || n.userId === uid)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // =================================================
  // ADMIN CMS: TOPICS
  // =================================================

  async getAdminTopics() {
    // 1. Try authoritative backend database
    if (this.firestore && this.firestoreSDK) {
      try {
        const { collection, getDocs } = this.firestoreSDK;
        const snap = await getDocs(collection(this.firestore, COLLECTIONS.CMS_TOPICS));
        if (snap && !snap.empty) {
          const remoteList = [];
          snap.forEach((d) => remoteList.push(d.data()));
          const store = this._getCollection(LOCAL_COLLECTIONS.CMS_TOPICS);
          remoteList.forEach((t) => {
            store[t.id || t.topicId] = t;
          });
          this._saveCollection(LOCAL_COLLECTIONS.CMS_TOPICS, store);
          return remoteList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }
      } catch (err) {
        console.warn("[DatabaseService] Remote read for CMS topics failed:", err.message);
      }
    }

    // 2. Fall back to local cache
    const store = this._getCollection(LOCAL_COLLECTIONS.CMS_TOPICS);
    return Object.values(store).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  async getTopic(topicId) {
    if (!topicId) return null;
    const remote = await this._fetchRemoteDoc(COLLECTIONS.CMS_TOPICS, topicId);
    if (remote) {
      const store = this._getCollection(LOCAL_COLLECTIONS.CMS_TOPICS);
      store[topicId] = remote;
      this._saveCollection(LOCAL_COLLECTIONS.CMS_TOPICS, store);
      return remote;
    }
    const store = this._getCollection(LOCAL_COLLECTIONS.CMS_TOPICS);
    return store[topicId] || null;
  }

  async saveTopic(topic) {
    const store = this._getCollection(LOCAL_COLLECTIONS.CMS_TOPICS);
    const id = topic.id || topic.topicId || this._generateId("topic");
    const existing = store[id] || {};
    const now = new Date().toISOString();

    const allTopics = Object.values(store);
    const maxOrder = allTopics.length > 0 ? Math.max(...allTopics.map((t) => t.order ?? 0)) : 0;

    const record = {
      ...existing,
      ...topic,
      id,
      topicId: id,
      title: topic.title || existing.title || "Untitled Topic",
      description: topic.description || existing.description || "",
      icon: topic.icon || existing.icon || "book-open",
      category: topic.category || existing.category || "General",
      status: topic.status || existing.status || "draft",
      order: typeof topic.order === "number" ? topic.order : (existing.order ?? maxOrder + 1),
      createdAt: existing.createdAt || topic.createdAt || now,
      updatedAt: now
    };

    store[id] = record;
    this._saveCollection(LOCAL_COLLECTIONS.CMS_TOPICS, store);
    await this._syncRemoteDoc(COLLECTIONS.CMS_TOPICS, id, record);
    return record;
  }

  async deleteTopic(topicId) {
    if (!topicId) return false;
    const store = this._getCollection(LOCAL_COLLECTIONS.CMS_TOPICS);
    delete store[topicId];
    this._saveCollection(LOCAL_COLLECTIONS.CMS_TOPICS, store);

    // Cascade delete associated modules
    const moduleStore = this._getCollection(LOCAL_COLLECTIONS.CMS_MODULES);
    Object.keys(moduleStore).forEach((mId) => {
      if (moduleStore[mId].topicId === topicId) {
        delete moduleStore[mId];
      }
    });
    this._saveCollection(LOCAL_COLLECTIONS.CMS_MODULES, moduleStore);

    if (this.firestore && this.firestoreSDK) {
      try {
        const { doc, deleteDoc } = this.firestoreSDK;
        await deleteDoc(doc(this.firestore, COLLECTIONS.CMS_TOPICS, topicId));
      } catch (err) {
        console.warn(`[DatabaseService] Remote delete for topic ${topicId} failed:`, err.message);
      }
    }
    return true;
  }

  async reorderTopics(orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    const store = this._getCollection(LOCAL_COLLECTIONS.CMS_TOPICS);
    orderedIds.forEach((id, idx) => {
      if (store[id]) {
        store[id].order = idx;
        store[id].updatedAt = new Date().toISOString();
        this._syncRemoteDoc(COLLECTIONS.CMS_TOPICS, id, store[id]);
      }
    });
    this._saveCollection(LOCAL_COLLECTIONS.CMS_TOPICS, store);
  }

  // =================================================
  // ADMIN CMS: MODULES
  // =================================================

  async getAdminModules(topicId = null) {
    if (this.firestore && this.firestoreSDK) {
      try {
        const { collection, getDocs, query, where } = this.firestoreSDK;
        const q = topicId
          ? query(collection(this.firestore, COLLECTIONS.CMS_MODULES), where("topicId", "==", topicId))
          : collection(this.firestore, COLLECTIONS.CMS_MODULES);
        const snap = await getDocs(q);
        if (snap && !snap.empty) {
          const remoteList = [];
          snap.forEach((d) => remoteList.push(d.data()));
          const store = this._getCollection(LOCAL_COLLECTIONS.CMS_MODULES);
          remoteList.forEach((m) => {
            store[m.id || m.moduleId] = m;
          });
          this._saveCollection(LOCAL_COLLECTIONS.CMS_MODULES, store);
          return remoteList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }
      } catch (err) {
        console.warn("[DatabaseService] Remote read for CMS modules failed:", err.message);
      }
    }

    const store = this._getCollection(LOCAL_COLLECTIONS.CMS_MODULES);
    let list = Object.values(store);
    if (topicId) {
      list = list.filter((m) => m.topicId === topicId);
    }
    return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  async getModule(moduleId) {
    if (!moduleId) return null;
    const remote = await this._fetchRemoteDoc(COLLECTIONS.CMS_MODULES, moduleId);
    if (remote) {
      const store = this._getCollection(LOCAL_COLLECTIONS.CMS_MODULES);
      store[moduleId] = remote;
      this._saveCollection(LOCAL_COLLECTIONS.CMS_MODULES, store);
      return remote;
    }
    const store = this._getCollection(LOCAL_COLLECTIONS.CMS_MODULES);
    return store[moduleId] || null;
  }

  async saveModule(module) {
    const store = this._getCollection(LOCAL_COLLECTIONS.CMS_MODULES);
    const id = module.id || module.moduleId || this._generateId("mod");
    const existing = store[id] || {};
    const now = new Date().toISOString();

    const topicModules = Object.values(store).filter((m) => m.topicId === (module.topicId || existing.topicId));
    const maxOrder = topicModules.length > 0 ? Math.max(...topicModules.map((m) => m.order ?? 0)) : 0;

    const record = {
      ...existing,
      ...module,
      id,
      moduleId: id,
      topicId: module.topicId || existing.topicId || "default_topic",
      title: module.title || existing.title || "Untitled Module",
      description: module.description || existing.description || "",
      estimatedMinutes: Number(module.estimatedMinutes || existing.estimatedMinutes || 20),
      difficulty: module.difficulty || existing.difficulty || "Beginner",
      status: module.status || existing.status || "draft",
      draftBlocks: Array.isArray(module.draftBlocks) ? module.draftBlocks : (existing.draftBlocks || []),
      publishedBlocks: Array.isArray(module.publishedBlocks) ? module.publishedBlocks : (existing.publishedBlocks || []),
      order: typeof module.order === "number" ? module.order : (existing.order ?? maxOrder + 1),
      publishedVersion: module.publishedVersion || existing.publishedVersion || 1,
      createdAt: existing.createdAt || module.createdAt || now,
      updatedAt: now
    };

    store[id] = record;
    this._saveCollection(LOCAL_COLLECTIONS.CMS_MODULES, store);
    await this._syncRemoteDoc(COLLECTIONS.CMS_MODULES, id, record);
    return record;
  }

  async publishModule(moduleId, isPublished = true) {
    const store = this._getCollection(LOCAL_COLLECTIONS.CMS_MODULES);
    const existing = store[moduleId];
    if (!existing) return null;

    const now = new Date().toISOString();
    const updated = {
      ...existing,
      status: isPublished ? "published" : "draft",
      publishedAt: isPublished ? now : existing.publishedAt,
      publishedBlocks: isPublished ? JSON.parse(JSON.stringify(existing.draftBlocks || [])) : existing.publishedBlocks,
      publishedVersion: isPublished ? (existing.publishedVersion || 1) + 1 : existing.publishedVersion,
      updatedAt: now
    };

    store[moduleId] = updated;
    this._saveCollection(LOCAL_COLLECTIONS.CMS_MODULES, store);
    await this._syncRemoteDoc(COLLECTIONS.CMS_MODULES, moduleId, updated);
    return updated;
  }

  async duplicateModule(moduleId) {
    const original = await this.getModule(moduleId);
    if (!original) return null;

    const newId = this._generateId("mod");
    const now = new Date().toISOString();

    // Deep clone draftBlocks with fresh IDs
    const clonedBlocks = (original.draftBlocks || []).map((b) => ({
      ...b,
      id: this._generateId("blk")
    }));

    const duplicated = {
      ...original,
      id: newId,
      moduleId: newId,
      title: `${original.title} (Copy)`,
      status: "draft",
      draftBlocks: clonedBlocks,
      publishedBlocks: [],
      publishedVersion: 1,
      order: (original.order ?? 0) + 1,
      createdAt: now,
      updatedAt: now
    };

    return await this.saveModule(duplicated);
  }

  async deleteModule(moduleId) {
    if (!moduleId) return false;
    const store = this._getCollection(LOCAL_COLLECTIONS.CMS_MODULES);
    delete store[moduleId];
    this._saveCollection(LOCAL_COLLECTIONS.CMS_MODULES, store);

    if (this.firestore && this.firestoreSDK) {
      try {
        const { doc, deleteDoc } = this.firestoreSDK;
        await deleteDoc(doc(this.firestore, COLLECTIONS.CMS_MODULES, moduleId));
      } catch (err) {
        console.warn(`[DatabaseService] Remote delete for module ${moduleId} failed:`, err.message);
      }
    }
    return true;
  }

  async reorderModules(topicId, orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    const store = this._getCollection(LOCAL_COLLECTIONS.CMS_MODULES);
    orderedIds.forEach((id, idx) => {
      if (store[id]) {
        store[id].order = idx;
        store[id].updatedAt = new Date().toISOString();
        this._syncRemoteDoc(COLLECTIONS.CMS_MODULES, id, store[id]);
      }
    });
    this._saveCollection(LOCAL_COLLECTIONS.CMS_MODULES, store);
  }

  // =================================================
  // ADMIN CMS: MEDIA LIBRARY
  // =================================================

  async getMediaLibrary() {
    const store = this._getCollection(LOCAL_COLLECTIONS.CMS_MEDIA);
    return Object.values(store).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async saveMedia(asset) {
    const store = this._getCollection(LOCAL_COLLECTIONS.CMS_MEDIA);
    const id = asset.id || this._generateId("media");
    const record = {
      ...asset,
      id,
      createdAt: asset.createdAt || new Date().toISOString()
    };
    store[id] = record;
    this._saveCollection(LOCAL_COLLECTIONS.CMS_MEDIA, store);
    await this._syncRemoteDoc(COLLECTIONS.CMS_MEDIA, id, record);
    return record;
  }

  async deleteMedia(mediaId) {
    if (!mediaId) return false;
    const store = this._getCollection(LOCAL_COLLECTIONS.CMS_MEDIA);
    delete store[mediaId];
    this._saveCollection(LOCAL_COLLECTIONS.CMS_MEDIA, store);

    if (this.firestore && this.firestoreSDK) {
      try {
        const { doc, deleteDoc } = this.firestoreSDK;
        await deleteDoc(doc(this.firestore, COLLECTIONS.CMS_MEDIA, mediaId));
      } catch (err) {
        console.warn(`[DatabaseService] Remote delete for media ${mediaId} failed:`, err.message);
      }
    }
    return true;
  }

  // =================================================
  // STUDENT RUNTIME: GET PUBLISHED CURRICULUM
  // =================================================

  async getPublishedCurriculumTopics() {
    const topics = await this.getAdminTopics();
    const publishedTopics = topics.filter((t) => t.status === "published");

    const allModules = await this.getAdminModules();
    const publishedModules = allModules.filter((m) => m.status === "published");

    return publishedTopics.map((topic) => {
      const topicModules = publishedModules
        .filter((m) => m.topicId === topic.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      return {
        id: topic.id,
        title: topic.title,
        description: topic.description,
        icon: topic.icon,
        category: topic.category,
        modules: topicModules,
        estimatedMinutes: topicModules.reduce((acc, m) => acc + (m.estimatedMinutes || 20), 0) || 45,
        syllabus: topicModules.map((m) => m.title),
        concepts: topicModules.map((m) => m.title)
      };
    });
  }
}

export const databaseService = new DatabaseService();
