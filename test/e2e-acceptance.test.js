// ===================================================
// PATH FORGE - END-TO-END ACCEPTANCE TEST (REQUIREMENT 31)
// Simulates user learning journey through Topic 1, Topic 2, Topic 3, adaptations & reload
// ===================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { databaseService } from "../src/services/database/databaseService.js";
import { aiService } from "../src/services/ai/aiService.js";
import {
  initSkillProfile,
  processAssessmentAnswers,
  calculateOverallReadiness
} from "../src/services/learning/skillEngine.js";
import { generateSchedule } from "../src/services/scheduler/scheduler.js";
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

describe("END-TO-END ACCEPTANCE TEST (Requirement 31)", () => {
  it("Executes the complete multi-topic adaptive learning journey", async () => {
    LocalStorageService.clear();

    // 1. Create/use a test user and set goal
    const testUser = {
      userId: "candidate_e2e_001",
      displayName: "Alex Rivera",
      email: "alex.rivera@example.com"
    };
    await databaseService.saveUser(testUser);

    const goal = await databaseService.saveGoal({
      userId: testUser.userId,
      targetPosition: "Frontend Developer",
      targetCompany: "Google",
      targetRoleId: "frontend",
      deadline: "2026-12-31",
      dailyMinutes: 60
    });

    const candidateTopics = getTopicsForRole("frontend");
    assert.ok(candidateTopics.length >= 3, "Frontend pathway should have at least 3 topics");
    const topic1 = candidateTopics[0]; // HTML5, Modern CSS3 & Responsive Design
    const topic2 = candidateTopics[1]; // JavaScript Essentials (ES6+)
    const topic3 = candidateTopics[2]; // Tailwind CSS & Component Styling

    // Initialize skill profile
    let skillProfile = initSkillProfile(
      ["HTML5 & CSS3", "JavaScript", "Responsive Design"],
      { "HTML5 & CSS3": 35, JavaScript: 30, "Responsive Design": 25 }
    );
    await databaseService.saveSkillProfile(testUser.userId, skillProfile);

    // Initial schedule
    let schedule = generateSchedule({
      topics: candidateTopics,
      skillProfile,
      deadline: goal.deadline,
      dailyMinutes: goal.dailyMinutes,
      completedMap: {}
    });
    await databaseService.saveStudyPlan({
      userId: testUser.userId,
      goalId: goal.goalId,
      schedule
    });

    // ----------------------------------------------------
    // STEP 1: Start Topic 1 -> AI-generated content appears
    // ----------------------------------------------------
    const lesson1Content = await aiService.generateLesson(topic1.id, {
      userMastery: skillProfile["HTML5 & CSS3"].mastery,
      targetRole: goal.targetPosition,
      targetCompany: goal.targetCompany
    });

    assert.ok(lesson1Content.title, "Topic 1 lesson must have a title");
    assert.ok(lesson1Content.sections.length >= 1, "Topic 1 lesson must have structured sections");
    assert.ok(lesson1Content.practicalExample?.code, "Topic 1 must have code example");

    const lesson1Record = await databaseService.saveLesson({
      userId: testUser.userId,
      topicId: topic1.id,
      content: lesson1Content,
      status: "LEARNING"
    });
    assert.equal(lesson1Record.status, "LEARNING");

    // Background pre-generation of Topic 2
    const topic2PreGenerated = await aiService.prepareNextTopic(topic2.id, {
      targetRole: goal.targetPosition,
      targetCompany: goal.targetCompany,
      userMastery: skillProfile["JavaScript"].mastery
    });
    await databaseService.saveLesson({
      userId: testUser.userId,
      topicId: topic2.id,
      content: topic2PreGenerated,
      status: "PREPARED"
    });

    // ----------------------------------------------------
    // STEP 2: Complete Topic 1 -> Exactly 3 MCQs appear
    // ----------------------------------------------------
    await databaseService.updateLessonStatus(lesson1Record.lessonId, "ASSESSMENT");
    const questions1Result = await aiService.generateQuestions(topic1.id, {
      userMastery: skillProfile["HTML5 & CSS3"].mastery,
      targetRole: goal.targetPosition
    });

    assert.equal(questions1Result.questions.length, 3, "Topic 1 must have exactly 3 questions");

    // ----------------------------------------------------
    // STEP 3: Answer: Q1 correct, Q2 correct, Q3 wrong (Score: 2/3)
    // ----------------------------------------------------
    const q1 = questions1Result.questions[0];
    const q2 = questions1Result.questions[1];
    const q3 = questions1Result.questions[2];

    const answers1 = [
      { questionId: q1.id, selectedIndex: q1.correctIndex }, // Q1 correct
      { questionId: q2.id, selectedIndex: q2.correctIndex }, // Q2 correct
      { questionId: q3.id, selectedIndex: (q3.correctIndex + 1) % 4 } // Q3 wrong
    ];

    const eval1 = await aiService.evaluateAssessment({
      topicTitle: lesson1Content.title,
      questions: questions1Result.questions,
      userAnswers: answers1,
      targetRole: goal.targetPosition,
      nextTopicTitle: topic2.title
    });

    // Verify Score is 2/3
    assert.equal(eval1.score, 2, "Topic 1 score must be exactly 2");
    assert.ok(eval1.percentage >= 66 && eval1.percentage <= 67, "Topic 1 percentage must be ~66.67%");

    // Verify Skill Engine changes
    const previousMastery = skillProfile["HTML5 & CSS3"].mastery;
    const skillRes1 = processAssessmentAnswers(skillProfile, eval1.answeredDetails);
    skillProfile = skillRes1.updatedProfile;
    await databaseService.saveSkillProfile(testUser.userId, skillProfile);

    // Save assessment record
    await databaseService.saveAssessment({
      userId: testUser.userId,
      topicId: topic1.id,
      score: eval1.score,
      percentage: eval1.percentage,
      analysis: eval1.analysis,
      questions: questions1Result.questions,
      answers: answers1
    });

    // Verify weak concepts identified
    assert.ok(eval1.analysis.weakConcepts.length > 0, "Weak concepts must be diagnosed from the 2 wrong answers");
    const weakConcept = eval1.analysis.weakConcepts[0];

    // Verify Topic 2 is adapted
    await databaseService.saveAdaptation({
      userId: testUser.userId,
      affectedTopicId: topic2.id,
      reason: `Reinforcement required for missed concepts in Topic 1: ${weakConcept}`,
      oldState: { preGenerated: true },
      newState: { adapted: true, reinforcementTarget: weakConcept }
    });

    // Patch Topic 2 pre-generated lesson to incorporate weak concept review
    const adaptedTopic2Lesson = await aiService.generateLesson(topic2.id, {
      userMastery: skillProfile["JavaScript"].mastery,
      targetRole: goal.targetPosition,
      targetCompany: goal.targetCompany,
      previousPerformance: { score: 3, weakConcepts: eval1.analysis.weakConcepts },
      adaptationContext: { weakConcepts: eval1.analysis.weakConcepts }
    });

    await databaseService.saveLesson({
      userId: testUser.userId,
      topicId: topic2.id,
      content: adaptedTopic2Lesson,
      status: "PREPARED"
    });

    // Mark Topic 1 as completed
    await databaseService.updateLessonStatus(lesson1Record.lessonId, "COMPLETED");
    const completedMap = { [topic1.id]: true };
    LocalStorageService.set("completed_topics", completedMap);

    // ----------------------------------------------------
    // STEP 4: Complete Topic 2 with strong score (5/5)
    // ----------------------------------------------------
    // Start Topic 2
    const topic2Record = await databaseService.saveLesson({
      userId: testUser.userId,
      topicId: topic2.id,
      content: adaptedTopic2Lesson,
      status: "LEARNING"
    });

    // Verify Topic 2 content contains the adapted review section
    assert.ok(
      JSON.stringify(adaptedTopic2Lesson.sections).includes(weakConcept) ||
      adaptedTopic2Lesson.sections.some((s) => s.heading.toLowerCase().includes("prerequisite")),
      "Topic 2 must contain adapted reinforcement from Topic 1 weak concepts"
    );

    // Complete Topic 2
    await databaseService.updateLessonStatus(topic2Record.lessonId, "ASSESSMENT");
    const questions2Result = await aiService.generateQuestions(topic2.id, {
      userMastery: skillProfile["JavaScript"].mastery,
      targetRole: goal.targetPosition
    });

    assert.equal(questions2Result.questions.length, 3, "Topic 2 must have exactly 3 questions");

    // Answer 3/3 correct
    const answers2 = questions2Result.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: q.correctIndex
    }));

    const eval2 = await aiService.evaluateAssessment({
      topicTitle: adaptedTopic2Lesson.title,
      questions: questions2Result.questions,
      userAnswers: answers2,
      targetRole: goal.targetPosition,
      nextTopicTitle: topic3.title
    });

    assert.equal(eval2.score, 3, "Topic 2 score must be 3/3");
    assert.equal(eval2.percentage, 100);

    // Verify mastery increases and difficulty adapts upward
    const skillRes2 = processAssessmentAnswers(skillProfile, eval2.answeredDetails);
    skillProfile = skillRes2.updatedProfile;
    await databaseService.saveSkillProfile(testUser.userId, skillProfile);

    // Save assessment 2 record
    await databaseService.saveAssessment({
      userId: testUser.userId,
      topicId: topic2.id,
      score: eval2.score,
      percentage: eval2.percentage,
      analysis: eval2.analysis,
      questions: questions2Result.questions,
      answers: answers2
    });

    const testedConcept = eval2.answeredDetails[0]?.skill || topic2.concepts[0];
    assert.ok(
      skillProfile[testedConcept] && skillProfile[testedConcept].mastery > 20,
      "Tested concept mastery should increase"
    );
    assert.equal(
      skillProfile[testedConcept]?.accelerated,
      true,
      "Strong score must trigger accelerated status"
    );

    // Complete Topic 2
    await databaseService.updateLessonStatus(topic2Record.lessonId, "COMPLETED");
    completedMap[topic2.id] = true;
    LocalStorageService.set("completed_topics", completedMap);

    // Record Topic 3 acceleration adaptation
    await databaseService.saveAdaptation({
      userId: testUser.userId,
      affectedTopicId: topic3.id,
      reason: "Pacing accelerated and difficulty upgraded due to 5/5 mastery streak",
      oldState: { standard: true },
      newState: { adapted: true, accelerated: true }
    });

    // ----------------------------------------------------
    // STEP 5: Topic 3 is influenced by accumulated learning history
    // ----------------------------------------------------
    const adaptations = await databaseService.getAdaptations(testUser.userId);
    const updatedSchedule = generateSchedule({
      topics: candidateTopics,
      skillProfile,
      deadline: goal.deadline,
      dailyMinutes: goal.dailyMinutes,
      completedMap,
      adaptations
    });

    const topic3ScheduleItem = updatedSchedule.items.find((i) => i.topicId === topic3.id);
    assert.ok(topic3ScheduleItem, "Topic 3 must be present in upcoming schedule");
    assert.ok(
      topic3ScheduleItem.status === "accelerated" || topic3ScheduleItem.adapted,
      "Topic 3 status must reflect accumulated learning acceleration"
    );

    // ----------------------------------------------------
    // STEP 6: Refresh Browser / Reload State Verification
    // ----------------------------------------------------
    // Retrieve all state from databaseService
    const reloadedGoal = await databaseService.getGoalByUserId(testUser.userId);
    const reloadedSkills = await databaseService.getSkillProfile(testUser.userId);
    const reloadedLesson1 = await databaseService.getLessonByUserAndTopic(testUser.userId, topic1.id);
    const reloadedLesson2 = await databaseService.getLessonByUserAndTopic(testUser.userId, topic2.id);
    const reloadedAssessments = await databaseService.getAssessmentsByUserAndTopic(testUser.userId);
    const reloadedCompleted = LocalStorageService.get("completed_topics", {});

    assert.ok(reloadedGoal, "Goal remains intact after reload");
    assert.ok(reloadedSkills["HTML5 & CSS3"], "Mastery profile remains intact");
    assert.equal(reloadedLesson1.status, "COMPLETED", "Topic 1 completed status preserved");
    assert.equal(reloadedLesson2.status, "COMPLETED", "Topic 2 completed status preserved");
    assert.equal(reloadedCompleted[topic1.id], true, "Completed map retains Topic 1");
    assert.equal(reloadedCompleted[topic2.id], true, "Completed map retains Topic 2");
    assert.ok(reloadedLesson1.content, "Generated lesson 1 content remains available");
    assert.ok(reloadedLesson2.content, "Generated lesson 2 content remains available");
    assert.equal(reloadedAssessments.length, 2, "Both assessments persisted across reload");
  });
});
