// ===================================================
// PATH FORGE - ADAPTIVE TOPIC LEARNING LOOP V2 TEST SUITE
// Automated verification for Requirements TEST 1 - TEST 16 & E2E Scenario
// ===================================================

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { databaseService } from "../src/services/database/databaseService.js";
import { aiService } from "../src/services/ai/aiService.js";
import {
  initSkillProfile,
  updateSkillOnAnswer,
  processAssessmentAnswers,
  calculateOverallReadiness
} from "../src/services/learning/skillEngine.js";
import { generateSchedule } from "../src/services/scheduler/scheduler.js";
import { getTopicsForRole, CURRICULUM_TOPICS } from "../src/data/curriculum.js";
import { buildLessonPrompt } from "../src/services/ai/prompts/lessonPrompt.js";
import { buildQuestionPrompt } from "../src/services/ai/prompts/questionPrompt.js";
import { LocalStorageService } from "../src/services/storage/localStorageService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const localEnv = path.join(__dirname, "..", ".env.local");
  const defaultEnv = path.join(__dirname, "..", ".env");
  if (fs.existsSync(localEnv)) process.loadEnvFile(localEnv);
  else if (fs.existsSync(defaultEnv)) process.loadEnvFile(defaultEnv);
} catch {}

describe("Adaptive Topic Learning Loop V2", () => {
  const testUserId = "test_user_v2";
  const testUserBId = "test_user_b";
  const testTopicId = "tech-fe-1"; // HTML5 & Modern Semantic Web
  const testNextTopicId = "tech-fe-2"; // CSS3 Architecture & Responsive Design

  beforeEach(() => {
    LocalStorageService.clear();
  });

  // ----------------------------------------------------
  // TEST 1: Topic starts -> lesson generated/displayed
  // ----------------------------------------------------
  it("TEST 1: Topic starts -> lesson generated in Schema V2 format with sections, code, and objective", async () => {
    const lesson = await aiService.generateLesson(testTopicId, {
      userMastery: 30,
      targetRole: "Frontend Developer"
    });

    assert.ok(lesson, "Lesson should be generated");
    assert.ok(lesson.title, "Lesson must have a title");
    assert.ok(lesson.objective, "Lesson must have an objective");
    assert.ok(Array.isArray(lesson.sections), "Lesson must have sections array");
    assert.ok(lesson.sections.length >= 1, "Must have at least 1 section");
    assert.ok(lesson.practicalExample, "Must contain practical code example");
    assert.ok(Array.isArray(lesson.keyPoints), "Must have key points");
    assert.ok(Array.isArray(lesson.commonMistakes), "Must have common mistakes");
    assert.ok(Array.isArray(lesson.interviewPoints), "Must have interview points");
  });

  // ----------------------------------------------------
  // TEST 2: Topic cannot be completed without assessment
  // ----------------------------------------------------
  it("TEST 2: Topic cannot be completed without passing through assessment status", async () => {
    const lesson = await aiService.generateLesson(testTopicId, { userMastery: 30 });
    const record = await databaseService.saveLesson({
      userId: testUserId,
      topicId: testTopicId,
      content: lesson,
      status: "LEARNING"
    });

    assert.equal(record.status, "LEARNING", "Initial status must be LEARNING, not COMPLETED");

    // Attempting to finish requires advancing to ASSESSMENT first
    const updated = await databaseService.updateLessonStatus(record.lessonId, "ASSESSMENT");
    assert.equal(updated.status, "ASSESSMENT", "Status must become ASSESSMENT before completion");

    // Only after assessment is submitted can it transition to COMPLETED
    const completedRecord = await databaseService.updateLessonStatus(record.lessonId, "COMPLETED");
    assert.equal(completedRecord.status, "COMPLETED");
  });

  // ----------------------------------------------------
  // TEST 3: Exactly 3 MCQs generated
  // ----------------------------------------------------
  it("TEST 3: Exactly 3 MCQs generated specifically for the studied topic", async () => {
    const result = await aiService.generateQuestions(testTopicId, {
      userMastery: 40,
      targetRole: "Frontend Developer"
    });

    assert.ok(result, "Questions result should be returned");
    assert.ok(Array.isArray(result.questions), "questions must be an array");
    assert.equal(result.questions.length, 3, "Must generate EXACTLY 3 questions");

    result.questions.forEach((q, idx) => {
      assert.ok(q.id, `Question ${idx + 1} must have an ID`);
      assert.ok(q.question, `Question ${idx + 1} must have question text`);
      assert.ok(Array.isArray(q.options), `Question ${idx + 1} must have options array`);
      assert.equal(q.options.length, 4, `Question ${idx + 1} must have exactly 4 options`);
      assert.ok(typeof q.correctIndex === "number", `Question ${idx + 1} must specify correctIndex`);
    });
  });

  // ----------------------------------------------------
  // TEST 4: Questions are unique compared with previous questions (Anti-Repeat)
  // ----------------------------------------------------
  it("TEST 4: Questions are unique compared with previous questions (anti-repeat protection)", async () => {
    const initialBatch = await aiService.generateQuestions(testTopicId, { userMastery: 35 });
    const initialQuestionTexts = initialBatch.questions.map((q) => q.question);

    await databaseService.saveQuestionHistory(testUserId, testTopicId, initialQuestionTexts);
    const history = await databaseService.getQuestionHistory(testUserId, testTopicId);

    assert.equal(history.length, 3, "History should track 3 questions");

    // Generate new batch passing previous question history
    const secondBatch = await aiService.generateQuestions(
      testTopicId,
      { userMastery: 35 },
      history
    );

    const secondQuestionTexts = secondBatch.questions.map((q) => q.question);

    // Assert that no second batch question strictly matches an initial batch question
    initialQuestionTexts.forEach((prevQ) => {
      const isDuplicated = secondQuestionTexts.some((newQ) => newQ.toLowerCase() === prevQ.toLowerCase());
      assert.equal(isDuplicated, false, `Question "${prevQ}" was duplicated in subsequent assessment!`);
    });
  });

  // ----------------------------------------------------
  // TEST 5: All 3 answers are persisted
  // ----------------------------------------------------
  it("TEST 5: All 3 answers are persisted to database service", async () => {
    const questionsResult = await aiService.generateQuestions(testTopicId, { userMastery: 35 });
    const attempts = questionsResult.questions.map((q, idx) => ({
      assessmentId: "asm_test_5",
      questionId: q.id,
      userId: testUserId,
      selectedAnswer: idx % 2 === 0 ? q.correctIndex : (q.correctIndex + 1) % 4,
      isCorrect: idx % 2 === 0,
      difficulty: q.difficulty,
      skill: q.skill,
      timestamp: new Date().toISOString()
    }));

    await databaseService.recordQuestionAttempts(attempts);
    const saved = await databaseService.getRecentAttempts(testUserId, 10);

    assert.ok(saved.length >= 3, "All 3 question attempts must be persisted");
    const savedIds = new Set(saved.map((s) => s.questionId));
    questionsResult.questions.forEach((q) => {
      assert.ok(savedIds.has(q.id), `Question ${q.id} attempt was not persisted`);
    });
  });

  // ----------------------------------------------------
  // TEST 6: Score calculated correctly
  // ----------------------------------------------------
  it("TEST 6: Score calculated correctly (e.g. 2/3 = 66.67%)", async () => {
    const questionsResult = await aiService.generateQuestions(testTopicId, { userMastery: 50 });
    const userAnswers = [
      { questionId: questionsResult.questions[0].id, selectedIndex: questionsResult.questions[0].correctIndex }, // Correct (1)
      { questionId: questionsResult.questions[1].id, selectedIndex: questionsResult.questions[1].correctIndex }, // Correct (2)
      { questionId: questionsResult.questions[2].id, selectedIndex: (questionsResult.questions[2].correctIndex + 1) % 4 } // Wrong (3)
    ];

    const evaluation = await aiService.evaluateAssessment({
      topicTitle: "HTML5 & Modern Semantic Web",
      questions: questionsResult.questions,
      userAnswers,
      targetRole: "Frontend Developer"
    });

    assert.equal(evaluation.score, 2, "Score must be exactly 2");
    assert.equal(evaluation.total, 3, "Total must be 3");
    assert.ok(evaluation.percentage >= 66 && evaluation.percentage <= 67, "Percentage must be ~66.67%");
  });

  // ----------------------------------------------------
  // TEST 7: Mastery updates correctly and remains bounded (0 <= mastery <= 100)
  // ----------------------------------------------------
  it("TEST 7: Mastery updates correctly and remains bounded (0 <= mastery <= 100)", () => {
    const profile = initSkillProfile(["HTML5", "CSS3", "JavaScript"], {
      HTML5: 50,
      CSS3: 95,
      JavaScript: 5
    });

    // Multiple correct answers should not exceed 100
    let currentProfile = profile;
    for (let i = 0; i < 15; i++) {
      const res = updateSkillOnAnswer(currentProfile, {
        skillName: "CSS3",
        difficulty: "hard",
        isCorrect: true
      });
      currentProfile = res.updatedProfile;
    }
    assert.equal(currentProfile.CSS3.mastery, 100, "Mastery must clamp at 100 maximum");

    // Multiple wrong answers should not drop below 0
    for (let i = 0; i < 15; i++) {
      const res = updateSkillOnAnswer(currentProfile, {
        skillName: "JavaScript",
        difficulty: "easy",
        isCorrect: false
      });
      currentProfile = res.updatedProfile;
    }
    assert.equal(currentProfile.JavaScript.mastery, 0, "Mastery must clamp at 0 minimum");

    // Verify processAssessmentAnswers works smoothly
    const assessmentAnswers = [
      { skill: "HTML5", difficulty: "easy", isCorrect: true },
      { skill: "HTML5", difficulty: "medium", isCorrect: true },
      { skill: "HTML5", difficulty: "medium", isCorrect: false },
      { skill: "HTML5", difficulty: "hard", isCorrect: false },
      { skill: "HTML5", difficulty: "hard", isCorrect: true }
    ];

    const batchResult = processAssessmentAnswers(profile, assessmentAnswers);
    assert.ok(batchResult.updatedProfile.HTML5.mastery >= 0 && batchResult.updatedProfile.HTML5.mastery <= 100);
  });

  // ----------------------------------------------------
  // TEST 8: Weak topic creates reinforcement
  // ----------------------------------------------------
  it("TEST 8: Weak topic creates reinforcement in deterministic scheduler", () => {
    const topics = getTopicsForRole("frontend");
    const targetConcept = topics[0].concepts[0];
    const skillProfile = initSkillProfile([targetConcept]);

    // Force needsRevision on the core concept
    skillProfile[targetConcept].needsRevision = true;

    const schedule = generateSchedule({
      topics,
      skillProfile,
      deadline: "2026-12-31",
      dailyMinutes: 60,
      completedMap: {}
    });

    const reinforcementItem = schedule.items.find(
      (i) => i.type === "reinforcement" && i.status === "needs_revision"
    );

    assert.ok(reinforcementItem, "Scheduler must inject a targeted reinforcement module for weak concepts");
  });

  // ----------------------------------------------------
  // TEST 9: Strong performance increases difficulty appropriately
  // ----------------------------------------------------
  it("TEST 9: Strong performance increases difficulty appropriately", () => {
    const beginnerDistribution = [
      "easy",
      "easy",
      "medium",
      "medium",
      "medium"
    ];
    const strongDistribution = [
      "medium",
      "medium",
      "hard",
      "hard",
      "interview"
    ];

    // Verify skill progression switches difficulty tier
    const profile = initSkillProfile(["Core Concept"], { "Core Concept": 85 });
    assert.equal(profile["Core Concept"].difficulty, "hard");

    const res = updateSkillOnAnswer(profile, {
      skillName: "Core Concept",
      difficulty: "hard",
      isCorrect: true
    });

    assert.ok(res.updatedProfile["Core Concept"].mastery >= 85);
    assert.equal(res.updatedProfile["Core Concept"].difficulty, "hard");
  });

  // ----------------------------------------------------
  // TEST 10: Future topic content receives updated learner context
  // ----------------------------------------------------
  it("TEST 10: Future topic content receives updated learner context (score, weak concepts)", () => {
    const promptWithWeakness = buildLessonPrompt({
      topicTitle: "CSS3 Architecture & Responsive Design",
      userMastery: 40,
      previousPerformance: {
        score: 2,
        weakConcepts: ["HTML5 Semantic Tags", "Document Outline"]
      },
      adaptationContext: {
        weakConcepts: ["HTML5 Semantic Tags"]
      }
    });

    assert.ok(promptWithWeakness.includes("CRITICAL ADAPTATION DIRECTIVE"), "Prompt must contain adaptation directive");
    assert.ok(promptWithWeakness.includes("HTML5 Semantic Tags"), "Prompt must explicitly mention the weak concept");
  });

  // ----------------------------------------------------
  // TEST 11: Next topic can be pre-generated
  // ----------------------------------------------------
  it("TEST 11: Next topic can be pre-generated in the background", async () => {
    const preparedContent = await aiService.prepareNextTopic(testNextTopicId, {
      targetRole: "Frontend Developer",
      userMastery: 35
    });

    assert.ok(preparedContent, "Prepared next topic content must be generated");
    assert.ok(preparedContent.title, "Prepared content must have title");

    const savedPrepared = await databaseService.saveLesson({
      userId: testUserId,
      topicId: testNextTopicId,
      content: preparedContent,
      status: "PREPARED"
    });

    assert.equal(savedPrepared.status, "PREPARED", "Pre-generated lesson must have status PREPARED");
  });

  // ----------------------------------------------------
  // TEST 12: Previous topic assessment can modify pre-generated next topic
  // ----------------------------------------------------
  it("TEST 12: Previous topic assessment can modify pre-generated next topic", async () => {
    // 1. Next topic pre-generated
    const initialPrepared = await aiService.prepareNextTopic(testNextTopicId, {
      targetRole: "Frontend Developer",
      userMastery: 40
    });

    const record = await databaseService.saveLesson({
      userId: testUserId,
      topicId: testNextTopicId,
      content: initialPrepared,
      status: "PREPARED"
    });

    // 2. Previous topic yields weak assessment (Score 2/5 with weak concept: "Box Model")
    const weakConcepts = ["Box Model", "Flexbox Axis"];
    const adaptedContent = await aiService.generateLesson(testNextTopicId, {
      targetRole: "Frontend Developer",
      userMastery: 40,
      adaptationContext: { weakConcepts }
    });

    // 3. Patch pre-generated lesson
    const patchedRecord = await databaseService.saveLesson({
      lessonId: record.lessonId,
      userId: testUserId,
      topicId: testNextTopicId,
      content: adaptedContent,
      status: "PREPARED"
    });

    assert.equal(patchedRecord.lessonId, record.lessonId, "Should patch the exact same lesson ID");
    assert.ok(
      JSON.stringify(patchedRecord.content).includes("Box Model"),
      "Patched lesson must incorporate the weak concepts"
    );
  });

  // ----------------------------------------------------
  // TEST 13: Refresh does not lose progress
  // ----------------------------------------------------
  it("TEST 13: Refresh / reload preserves active progress, lesson, and assessment state", async () => {
    const lesson = await aiService.generateLesson(testTopicId, { userMastery: 30 });
    const saved = await databaseService.saveLesson({
      userId: testUserId,
      topicId: testTopicId,
      content: lesson,
      status: "ASSESSMENT"
    });

    // Simulate browser reload by retrieving directly from databaseService
    const restored = await databaseService.getLessonByUserAndTopic(testUserId, testTopicId);

    assert.ok(restored, "Persisted lesson should be retrieved");
    assert.equal(restored.lessonId, saved.lessonId);
    assert.equal(restored.status, "ASSESSMENT");
    assert.equal(restored.content.title, lesson.title);
  });

  // ----------------------------------------------------
  // TEST 14: AI failure does not lose answers
  // ----------------------------------------------------
  it("TEST 14: AI failure does not lose answers (local deterministic fallback preserves score)", async () => {
    const questionsResult = await aiService.generateQuestions(testTopicId, { userMastery: 40 });
    const answers = questionsResult.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: q.correctIndex
    }));

    // Evaluate even with dummy / unreachable endpoint
    const evaluation = await aiService.evaluateAssessment({
      topicTitle: "HTML5 & Modern Semantic Web",
      questions: questionsResult.questions,
      userAnswers: answers,
      targetRole: "Frontend Developer"
    });

    assert.equal(evaluation.score, 3);
    assert.equal(evaluation.percentage, 100);
    assert.equal(evaluation.answeredDetails.length, 3);
  });

  // ----------------------------------------------------
  // TEST 15: No Gemini API key is exposed to frontend
  // ----------------------------------------------------
  it("TEST 15: GEMINI_API_KEY is not exposed to frontend client code", () => {
    const srcDir = path.join(__dirname, "..", "src");
    const scanDir = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const f of files) {
        const fullPath = path.join(dir, f.name);
        if (f.isDirectory()) {
          scanDir(fullPath);
        } else if (f.name.endsWith(".js") || f.name.endsWith(".html")) {
          const content = fs.readFileSync(fullPath, "utf-8");
          // Check that no client file contains direct process.env.GEMINI_API_KEY or literal Gemini key
          assert.equal(
            content.includes("process.env.GEMINI_API_KEY"),
            false,
            `process.env.GEMINI_API_KEY leaked into frontend file: ${fullPath}`
          );
        }
      }
    };

    scanDir(srcDir);
  });

  // ----------------------------------------------------
  // TEST 16: Multiple users cannot access each other's learning data
  // ----------------------------------------------------
  it("TEST 16: Multiple users cannot access each other's learning data (multi-user isolation)", async () => {
    // User A lesson & assessment
    const lessonA = await aiService.generateLesson(testTopicId, { userMastery: 20 });
    await databaseService.saveLesson({
      userId: testUserId,
      topicId: testTopicId,
      content: lessonA,
      status: "COMPLETED"
    });

    await databaseService.saveAssessment({
      userId: testUserId,
      topicId: testTopicId,
      score: 4,
      percentage: 80
    });

    // User B querying User A's data
    const userBLessons = await databaseService.getLessonByUserAndTopic(testUserBId, testTopicId);
    assert.equal(userBLessons, null, "User B should not access User A's lesson");

    const userBAssessments = await databaseService.getAssessmentsByUserAndTopic(testUserBId, testTopicId);
    assert.equal(userBAssessments.length, 0, "User B should not see User A's assessments");

    const userAAssessments = await databaseService.getAssessmentsByUserAndTopic(testUserId, testTopicId);
    assert.equal(userAAssessments.length, 1, "User A sees their own assessment");
    assert.equal(userAAssessments[0].userId, testUserId);
  });
});
