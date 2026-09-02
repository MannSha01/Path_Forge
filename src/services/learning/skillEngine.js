// ===================================================
// PATH FORGE - SKILL ENGINE
// Bounded mastery (0-100), confidence & difficulty-weighted updates
// ===================================================

import { clamp } from "../../utils/validation.js";

/**
 * Creates a default skill entry.
 * @param {string} skillName
 * @param {string} [category="general"]
 * @param {number} [initialMastery=20]
 * @returns {object}
 */
export function createSkillEntry(skillName, category = "general", initialMastery = 20) {
  return {
    skill: skillName,
    category,
    mastery: clamp(initialMastery, 0, 100),
    confidence: clamp(initialMastery - 5, 0, 100),
    difficulty: "easy",
    correctAnswers: 0,
    wrongAnswers: 0,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    needsRevision: false,
    accelerated: false,
    lastTested: null,
    lastPracticed: null
  };
}

/**
 * Initializes a full skill profile for a set of skill names.
 * @param {string[]} skillNames
 * @param {Record<string, number>} [initialScores={}]
 * @returns {Record<string, object>}
 */
export function initSkillProfile(skillNames = [], initialScores = {}) {
  const profile = {};
  skillNames.forEach((name) => {
    const baseScore = initialScores[name] !== undefined ? initialScores[name] : 25;
    profile[name] = createSkillEntry(name, "core", baseScore);
  });
  return profile;
}

/**
 * Updates a skill entry based on an answer evaluation.
 *
 * @param {Record<string, object>} skillProfile
 * @param {object} params
 * @param {string} params.skillName
 * @param {"easy" | "medium" | "hard" | "interview"} params.difficulty
 * @param {boolean} params.isCorrect
 * @returns {{ updatedProfile: Record<string, object>, delta: number, status: string }}
 */
export function updateSkillOnAnswer(skillProfile = {}, { skillName, difficulty = "medium", isCorrect }) {
  const profile = { ...skillProfile };
  const current = profile[skillName] || createSkillEntry(skillName);

  let masteryDelta = 0;
  let confidenceDelta = 0;

  if (isCorrect) {
    current.correctAnswers++;
    current.consecutiveCorrect++;
    current.consecutiveWrong = 0;

    // Weight by question difficulty
    switch (difficulty) {
      case "easy":
        masteryDelta = 4;
        confidenceDelta = 5;
        break;
      case "medium":
        masteryDelta = 8;
        confidenceDelta = 8;
        break;
      case "hard":
      case "interview":
        masteryDelta = 12;
        confidenceDelta = 12;
        break;
      default:
        masteryDelta = 6;
        confidenceDelta = 6;
    }

    // Consecutive streak bonus
    if (current.consecutiveCorrect >= 3) {
      masteryDelta += 3;
      current.accelerated = true;
      current.needsRevision = false;
    }
  } else {
    current.wrongAnswers++;
    current.consecutiveWrong++;
    current.consecutiveCorrect = 0;

    // Easy mistakes are more penalizing than hard questions
    switch (difficulty) {
      case "easy":
        masteryDelta = -10;
        confidenceDelta = -12;
        break;
      case "medium":
        masteryDelta = -7;
        confidenceDelta = -8;
        break;
      case "hard":
      case "interview":
        masteryDelta = -3;
        confidenceDelta = -4;
        break;
      default:
        masteryDelta = -6;
        confidenceDelta = -6;
    }

    // Repeated mistakes trigger revision flag
    if (current.consecutiveWrong >= 2) {
      masteryDelta -= 4;
      current.needsRevision = true;
      current.accelerated = false;
    }
  }

  // Update mastery & confidence bounded between 0 and 100
  current.mastery = clamp(current.mastery + masteryDelta, 0, 100);
  current.confidence = clamp(current.confidence + confidenceDelta, 0, 100);
  current.lastTested = new Date().toISOString();

  // Adapt current recommended question difficulty based on mastery
  if (current.mastery >= 80) {
    current.difficulty = "hard";
  } else if (current.mastery >= 50) {
    current.difficulty = "medium";
  } else {
    current.difficulty = "easy";
  }

  profile[skillName] = current;

  return {
    updatedProfile: profile,
    delta: masteryDelta,
    status: current.needsRevision ? "needs_revision" : current.accelerated ? "accelerated" : "normal"
  };
}

/**
 * Computes the aggregate Job Readiness Percentage (0-100%).
 * @param {Record<string, object>} skillProfile
 * @param {string[]} requiredSkills
 * @returns {number}
 */
export function calculateOverallReadiness(skillProfile = {}, requiredSkills = []) {
  if (!requiredSkills || requiredSkills.length === 0) {
    const values = Object.values(skillProfile);
    if (values.length === 0) return 0;
    const total = values.reduce((sum, s) => sum + (s.mastery || 0), 0);
    return Math.round(total / values.length);
  }

  let totalMastery = 0;
  requiredSkills.forEach((skill) => {
    const entry = skillProfile[skill];
    totalMastery += entry ? entry.mastery : 0;
  });

  return clamp(Math.round(totalMastery / requiredSkills.length), 0, 100);
}
