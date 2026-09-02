// ===================================================
// PATH FORGE - CUMULATIVE & ALTERNATING ADAPTIVE TEST SUITE
// Verifies: 3 MCQs/Topic, Cumulative Checkpoint every 4 topics,
// Alternating Odd/Even Lanes, Distance Decay, Prerequisite Overrides & UID Persistence
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
  processAssessmentAnswers,
  updateSkillOnAnswer
} from "../src/services/learning/skillEngine.js";
import {
  generateSchedule,
  calculateAlternatingLaneAdaptations
} from "../src/services/scheduler/scheduler.js";
import { getTopicsForRole } from "../src/data/curriculum.js";
import { LocalStorageService } from "../src/services/storage/localStorageService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const localEnv = path.join(__dirname, "..", ".env.local");
  const defaultEnv = path.join(__dirname, "..", ".env");
  if (fs.existsSync(localEnv)) process.loadEnvFile(localEnv);
  else if (fs.existsSync(defaultEnv)) process.loadEnvFile(defaultEnv);
} catch {}

describe("Adaptive Learning System V3: Persistence, Alternating Lanes & Cumulative", () => {
  const testUid = "firebase_user_alpha_777";
  const frontendTopics = getTopicsForRole("frontend");

  beforeEach(() => {
    LocalStorageService.clear();
  });

  // ----------------------------------------------------
  // 1. EXACTLY 3 QUESTIONS PER TOPIC ASSESSMENT
  // ----------------------------------------------------
  it("Every topic assessment contains exactly 3 questions", async () => {
    const result = await aiService.generateQuestions("tech-fe-1", {
      userMastery: 45,
      targetRole: "Frontend Developer"
    });

    assert.ok(result, "Questions result must exist");
    assert.equal(result.questions.length, 3, "Topic assessment must contain exactly 3 questions");
    assert.equal(result.questionCount, 3);
    assert.equal(result.assessmentType, "topic");
  });

  // ----------------------------------------------------
  // 2. DETERMINISTIC SCORING FOR 3 QUESTIONS
  // ----------------------------------------------------
  it("Scoring is strictly deterministic: 3/3 = 100%, 2/3 = 66.67%, 1/3 = 33.33%, 0/3 = 0%", async () => {
    const questionsResult = await aiService.generateQuestions("tech-fe-1", { userMastery: 50 });
    const qs = questionsResult.questions;

    // Test 3/3
    const eval3 = await aiService.evaluateAssessment({
      topicTitle: "HTML5",
      questions: qs,
      userAnswers: qs.map((q) => ({ questionId: q.id, selectedIndex: q.correctIndex }))
    });
    assert.equal(eval3.score, 3);
    assert.equal(eval3.totalQuestions, 3);
    assert.equal(eval3.percentage, 100);

    // Test 2/3
    const eval2 = await aiService.evaluateAssessment({
      topicTitle: "HTML5",
      questions: qs,
      userAnswers: [
        { questionId: qs[0].id, selectedIndex: qs[0].correctIndex },
        { questionId: qs[1].id, selectedIndex: qs[1].correctIndex },
        { questionId: qs[2].id, selectedIndex: (qs[2].correctIndex + 1) % 4 }
      ]
    });
    assert.equal(eval2.score, 2);
    assert.ok(eval2.percentage >= 66.6 && eval2.percentage <= 66.7);

    // Test 1/3
    const eval1 = await aiService.evaluateAssessment({
      topicTitle: "HTML5",
      questions: qs,
      userAnswers: [
        { questionId: qs[0].id, selectedIndex: qs[0].correctIndex },
        { questionId: qs[1].id, selectedIndex: (qs[1].correctIndex + 1) % 4 },
        { questionId: qs[2].id, selectedIndex: (qs[2].correctIndex + 1) % 4 }
      ]
    });
    assert.equal(eval1.score, 1);
    assert.ok(eval1.percentage >= 33.3 && eval1.percentage <= 33.4);

    // Test 0/3
    const eval0 = await aiService.evaluateAssessment({
      topicTitle: "HTML5",
      questions: qs,
      userAnswers: qs.map((q) => ({ questionId: q.id, selectedIndex: (q.correctIndex + 1) % 4 }))
    });
    assert.equal(eval0.score, 0);
    assert.equal(eval0.percentage, 0);
  });

  // ----------------------------------------------------
  // 3. DRAFT ANSWERS AUTOSAVING & RESTORATION
  // ----------------------------------------------------
  it("Saves draft answers on selection and restores them on return", async () => {
    const assessmentId = "asm_draft_test_123";
    const draftAnswers = [
      { questionId: "q_1", selectedOption: 0 },
      { questionId: "q_2", selectedOption: 2 }
    ];

    await databaseService.saveDraftAnswers({
      assessmentId,
      uid: testUid,
      topicId: "tech-fe-1",
      answers: draftAnswers
    });

    const restored = await databaseService.getDraftAnswers(assessmentId, testUid);
    assert.equal(restored.length, 2, "Draft answers must be restored from database");
    assert.equal(restored[0].selectedOption, 0);
    assert.equal(restored[1].selectedOption, 2);

    // Clear after submit
    await databaseService.clearDraftAnswers(assessmentId, testUid);
    const cleared = await databaseService.getDraftAnswers(assessmentId, testUid);
    assert.equal(cleared.length, 0, "Draft answers must be cleared after submit");
  });

  // ----------------------------------------------------
  // 4. ALTERNATING LANE ADAPTATION (ODD/EVEN) WITH DISTANCE DECAY
  // ----------------------------------------------------
  it("Topic 1 influences future odd topics (3, 5, 7...) with distance decay", () => {
    const laneAdaptations = calculateAlternatingLaneAdaptations({
      sourceIndex: 0, // Topic 1 (odd)
      sourceTopicId: frontendTopics[0].id,
      allTopics: frontendTopics,
      isWeak: true,
      weakConcepts: ["CSS Selectors"],
      skillProfile: {}
    });

    assert.ok(laneAdaptations.length > 0, "Must generate lane adaptations");

    // Target Topic 3 (index 2) -> distance +2 -> decay ~1.0
    const targetTopic3 = laneAdaptations.find((a) => a.targetTopicId === frontendTopics[2].id);
    assert.ok(targetTopic3, "Topic 1 must influence Topic 3 (odd lane)");
    assert.ok(targetTopic3.effectStrength >= 0.8, "Topic 3 at distance 2 must have strong effect");

    // Target Topic 5 (index 4) -> distance +4 -> decay ~0.5
    if (frontendTopics.length >= 5) {
      const targetTopic5 = laneAdaptations.find((a) => a.targetTopicId === frontendTopics[4].id);
      assert.ok(targetTopic5, "Topic 1 must influence Topic 5 (odd lane)");
      assert.ok(targetTopic5.effectStrength < targetTopic3.effectStrength, "Distance decay must reduce effect with distance");
    }

    // Even lane topics (e.g. Topic 2, index 1) must NOT be in odd-lane adaptations unless prerequisite override
    const targetTopic2 = laneAdaptations.find((a) => a.targetTopicId === frontendTopics[1].id && a.adaptationType === "odd_even_lane");
    assert.equal(targetTopic2, undefined, "Topic 2 (even) should not receive odd-lane adaptation from Topic 1");
  });

  it("Topic 2 influences future even topics (4, 6, 8...) with distance decay", () => {
    const laneAdaptations = calculateAlternatingLaneAdaptations({
      sourceIndex: 1, // Topic 2 (even)
      sourceTopicId: frontendTopics[1].id,
      allTopics: frontendTopics,
      isWeak: false, // Strong performance
      weakConcepts: [],
      skillProfile: {}
    });

    // Target Topic 4 (index 3) -> distance +2 -> even lane
    if (frontendTopics.length >= 4) {
      const targetTopic4 = laneAdaptations.find((a) => a.targetTopicId === frontendTopics[3].id);
      assert.ok(targetTopic4, "Topic 2 must influence Topic 4 (even lane)");
      assert.equal(targetTopic4.adaptationType, "odd_even_lane");
    }
  });

  // ----------------------------------------------------
  // 5. PREREQUISITES OVERRIDE ALTERNATING LANES
  // ----------------------------------------------------
  it("Prerequisites strictly override alternating lane rules", () => {
    // Construct scenario where Target Topic is on a different lane but depends on source topic concepts
    const mockTopics = [
      { id: "top-1", title: "Topic 1", concepts: ["Core A"] },
      { id: "top-2", title: "Topic 2", concepts: ["Core B"], prerequisites: ["top-1"] }, // Even lane, depends on top-1
      { id: "top-3", title: "Topic 3", concepts: ["Core C"] },
      { id: "top-4", title: "Topic 4", concepts: ["Core D"] }
    ];

    const adaptations = calculateAlternatingLaneAdaptations({
      sourceIndex: 0, // Topic 1 (odd)
      sourceTopicId: "top-1",
      allTopics: mockTopics,
      isWeak: true,
      weakConcepts: ["Core A"],
      skillProfile: {}
    });

    const prereqOverride = adaptations.find(
      (a) => a.targetTopicId === "top-2" && a.adaptationType === "prerequisite_override"
    );

    assert.ok(prereqOverride, "Topic 2 must receive prerequisite override adaptation even though it is in the even lane");
    assert.equal(prereqOverride.effectStrength, 1.0, "Prerequisite override must have maximum strength 1.0");
  });

  // ----------------------------------------------------
  // 6. CUMULATIVE ASSESSMENT AFTER EVERY 4 TOPICS
  // ----------------------------------------------------
  it("Cumulative assessment contains 5-6 questions covering preceding 4 topics", async () => {
    const coveredIds = ["tech-fe-1", "tech-fe-2", "tech-fe-3", "tech-fe-4"];
    const result = await aiService.generateCumulativeQuestions(coveredIds, { userMastery: 50 });

    assert.ok(result, "Cumulative questions must be returned");
    assert.ok(result.questions.length >= 5 && result.questions.length <= 6, "Cumulative test must have 5 or 6 questions");
    assert.equal(result.assessmentType, "cumulative");

    // Evaluate cumulative assessment deterministically
    const evalRes = await aiService.evaluateAssessment({
      topicTitle: "Cumulative Milestone",
      questions: result.questions,
      userAnswers: result.questions.map((q, idx) => ({
        questionId: q.id,
        selectedIndex: idx === 0 ? (q.correctIndex + 1) % 4 : q.correctIndex
      })),
      assessmentType: "cumulative",
      coveredTopics: coveredIds
    });

    assert.equal(evalRes.score, result.questions.length - 1);
    assert.equal(evalRes.assessmentType, "cumulative");
  });

  it("Deterministic scheduler injects cumulative assessment checkpoint every 4 topics", () => {
    const schedule = generateSchedule({
      topics: frontendTopics,
      skillProfile: {},
      deadline: "2026-12-31",
      dailyMinutes: 60,
      completedMap: {}
    });

    const cumulativeItem = schedule.items.find((i) => i.type === "cumulative_assessment");
    assert.ok(cumulativeItem, "Scheduler must include cumulative assessment milestone after 4 topics");
    assert.ok(cumulativeItem.title.toLowerCase().includes("cumulative"));
  });

  // ----------------------------------------------------
  // 7. RACE CONDITION & STALE GENERATION PROTECTION
  // ----------------------------------------------------
  it("Stale background generation does not overwrite newer adapted lessons", async () => {
    const lessonId = "les_race_condition_test";

    // 1. Initial lesson generated with adaptationVersion = 2
    await databaseService.saveLesson({
      lessonId,
      uid: testUid,
      topicId: "tech-fe-2",
      content: { title: "Adapted Lesson with Review", sections: [{ heading: "Prerequisite Review" }] },
      status: "PREPARED",
      adaptationVersion: 2
    });

    // 2. Stale background task finishes late with adaptationVersion = 1
    const staleResult = await databaseService.saveLesson({
      lessonId,
      uid: testUid,
      topicId: "tech-fe-2",
      content: { title: "Stale Generic Lesson", sections: [{ heading: "Standard" }] },
      status: "PREPARED",
      adaptationVersion: 1
    });

    const currentLesson = await databaseService.getLesson(lessonId);
    assert.equal(currentLesson.content.title, "Adapted Lesson with Review", "Newer adapted lesson must NOT be overwritten by stale generation");
  });

  // ----------------------------------------------------
  // 8. FIREBASE AUTH UID AS THE PRIMARY SOURCE OF TRUTH
  // ----------------------------------------------------
  it("User learning journey is strictly keyed by Firebase Auth UID", async () => {
    const userA = { uid: "firebase_uid_aaa_111", email: "user.a@test.com", displayName: "User A" };
    const userB = { uid: "firebase_uid_bbb_222", email: "user.b@test.com", displayName: "User B" };

    await databaseService.saveUser(userA);
    await databaseService.saveUser(userB);

    // Save journey for User A
    await databaseService.saveJourneyState({
      uid: userA.uid,
      status: "LEARNING",
      currentTopicId: "tech-fe-3"
    });

    // Save journey for User B
    await databaseService.saveJourneyState({
      uid: userB.uid,
      status: "ASSESSMENT",
      currentTopicId: "tech-be-1"
    });

    const journeyA = await databaseService.getJourneyState(userA.uid);
    const journeyB = await databaseService.getJourneyState(userB.uid);

    assert.equal(journeyA.currentTopicId, "tech-fe-3");
    assert.equal(journeyB.currentTopicId, "tech-be-1");
    assert.notEqual(journeyA.currentTopicId, journeyB.currentTopicId, "Users must have strictly isolated journeys keyed by UID");
  });
});
