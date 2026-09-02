// ===================================================
// PATH FORGE - QUESTION PROMPT BUILDER
// Builds structured prompts for 3-MCQ topic assessments & 5-6 question cumulative assessments
// ===================================================

/**
 * Derives the difficulty progression based on user mastery and question count.
 * @param {number} [mastery=30]
 * @param {number} [count=3]
 * @returns {Array<"easy" | "medium" | "hard" | "interview">}
 */
export function getDifficultyDistribution(mastery = 30, count = 3) {
  if (count === 3) {
    if (mastery < 45) {
      return ["easy", "easy", "medium"];
    } else if (mastery >= 75) {
      return ["medium", "hard", "interview"];
    } else {
      return ["easy", "medium", "hard"];
    }
  }

  // Cumulative assessment (5 or 6 questions)
  if (mastery < 45) {
    return ["easy", "easy", "medium", "medium", "medium", "hard"].slice(0, count);
  } else if (mastery >= 75) {
    return ["medium", "medium", "hard", "hard", "interview", "interview"].slice(0, count);
  } else {
    return ["easy", "medium", "medium", "hard", "hard", "interview"].slice(0, count);
  }
}

/**
 * Builds the prompt to generate exactly 3 MCQs (or 5-6 for cumulative assessment).
 *
 * @param {object} params
 * @param {string} params.topicTitle
 * @param {string[]} [params.concepts=[]]
 * @param {number} [params.userMastery=30]
 * @param {string[]} [params.previousQuestionTexts=[]]
 * @param {string} [params.targetRole="Software Engineer"]
 * @param {number} [params.questionCount=3]
 * @param {"topic" | "cumulative"} [params.assessmentType="topic"]
 * @param {string[]} [params.coveredTopics=[]]
 * @returns {string}
 */
export function buildQuestionPrompt({
  topicTitle,
  concepts = [],
  userMastery = 30,
  previousQuestionTexts = [],
  targetRole = "Software Engineer",
  questionCount = 3,
  assessmentType = "topic",
  coveredTopics = []
}) {
  const count = assessmentType === "cumulative" ? Math.max(5, Math.min(6, questionCount)) : 3;
  const difficulties = getDifficultyDistribution(userMastery, count);

  let antiRepeatSection = "";
  if (previousQuestionTexts && previousQuestionTexts.length > 0) {
    const compactHistory = previousQuestionTexts
      .slice(-15)
      .map((q, i) => `(${i + 1}) ${q}`)
      .join("\n");

    antiRepeatSection = `
CRITICAL ANTI-REPEAT INSTRUCTION:
The learner has previously attempted the following questions:
${compactHistory}

DO NOT REPEAT ANY PREVIOUSLY ASKED QUESTION.
Generate conceptually distinct questions testing the target competencies.
Variation must include different real-world scenarios, different code patterns, and different distractors.`;
  }

  if (assessmentType === "cumulative") {
    const topicsList = coveredTopics.length ? coveredTopics.join(", ") : topicTitle;
    return `You are the Path Forge Adaptive Career Evaluator.
Generate a CUMULATIVE RETENTION ASSESSMENT of EXACTLY ${count} questions evaluating retention and cross-topic synthesis across the preceding 4 topics:
- Covered Topics: ${topicsList}
- Target Role: ${targetRole}
- Learner Mastery Level: ${userMastery}%

CUMULATIVE QUESTION SPECIFICATIONS:
- Question 1: Tests retention of Topic 1 (${coveredTopics[0] || "Foundations"}) [Difficulty: ${difficulties[0]}]
- Question 2: Tests retention of Topic 2 (${coveredTopics[1] || "Core Mechanics"}) [Difficulty: ${difficulties[1]}]
- Question 3: Tests retention of Topic 3 (${coveredTopics[2] || "Advanced Application"}) [Difficulty: ${difficulties[2]}]
- Question 4: Tests retention of Topic 4 (${coveredTopics[3] || "Architecture"}) [Difficulty: ${difficulties[3]}]
- Question 5: An integrated scenario requiring synthesis across multiple covered topics [Difficulty: ${difficulties[4]}]
${count === 6 ? `- Question 6: Production edge-case or troubleshooting scenario combining these topics [Difficulty: ${difficulties[5]}]` : ""}

REQUIREMENTS:
- Generate EXACTLY ${count} questions.
- Every question must have exactly 4 plausible options (A, B, C, D) with exactly ONE correct answer.
- Test meaningful understanding, trade-offs, and practical integration rather than trivial recall.
${antiRepeatSection}

OUTPUT STRICT RAW JSON ONLY (no markdown code blocks, no backticks, no comments).
Schema:
{
  "topic": "Cumulative Milestone (${topicsList})",
  "assessmentType": "cumulative",
  "questions": [
    {
      "id": "q_cum_1",
      "skill": "${coveredTopics[0] || topicTitle}",
      "concept": "Specific concept tested from topic",
      "difficulty": "${difficulties[0]}",
      "question": "Scenario-based question statement",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why Option A is correct and why other options are flawed."
    }
    ... (exactly ${count} items total)
  ]
}`;
  }

  // Standard 3-MCQ Topic Assessment
  return `You are the Path Forge Adaptive Career Evaluator.
Generate an assessment of EXACTLY 3 multiple choice questions specifically evaluating the candidate on:
- Topic: ${topicTitle}
- Core Concepts: ${concepts.length ? concepts.join(", ") : topicTitle}
- Target Role: ${targetRole}
- Learner Mastery Level: ${userMastery}%

DIFFICULTY PROGRESSION:
1. Question 1: ${difficulties[0]}
2. Question 2: ${difficulties[1]}
3. Question 3: ${difficulties[2]}

REQUIREMENTS:
- Generate EXACTLY 3 questions.
- Every question MUST test the specific mechanics, nuances, and application of "${topicTitle}".
- Do NOT ask generic career questions. Test actual technical principles and implementation decisions.
- Each question must have exactly 4 plausible options (A, B, C, D) with exactly ONE unambiguously correct answer.
${antiRepeatSection}

OUTPUT STRICT RAW JSON ONLY (no markdown code blocks, no backticks, no comments).
Schema:
{
  "topic": "${topicTitle}",
  "assessmentType": "topic",
  "questions": [
    {
      "id": "q_1",
      "skill": "${concepts[0] || topicTitle}",
      "concept": "Specific sub-concept or principle tested",
      "difficulty": "${difficulties[0]}",
      "question": "Clear scenario or technical question statement",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation of why this answer is correct."
    },
    {
      "id": "q_2",
      "skill": "${concepts[1] || concepts[0] || topicTitle}",
      "concept": "Second principle tested",
      "difficulty": "${difficulties[1]}",
      "question": "Clear scenario or technical question statement",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation of why this answer is correct."
    },
    {
      "id": "q_3",
      "skill": "${concepts[0] || topicTitle}",
      "concept": "Third principle or edge case tested",
      "difficulty": "${difficulties[2]}",
      "question": "Clear scenario or technical question statement",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation of why this answer is correct."
    }
  ]
}`;
}
