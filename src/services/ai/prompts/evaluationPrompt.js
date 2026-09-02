// ===================================================
// PATH FORGE - EVALUATION PROMPT BUILDER
// Diagnostic prompt builder for single answer misconception checks
// ===================================================

/**
 * Builds the prompt for diagnosing an individual question answer.
 *
 * @param {object} params
 * @param {string} params.topicTitle
 * @param {string} params.question
 * @param {string} params.userAnswer
 * @param {string} [params.correctAnswer=""]
 * @returns {string}
 */
export function buildEvaluationPrompt({ topicTitle, question, userAnswer, correctAnswer = "" }) {
  return `You are the Path Forge Adaptive Career Evaluator.
Evaluate the candidate's understanding:
- Topic: ${topicTitle || "Technical Topic"}
- Question: ${question || ""}
- Candidate Answer: ${userAnswer || ""}
${correctAnswer ? `- Correct Answer: ${correctAnswer}` : ""}

OUTPUT STRICT RAW JSON ONLY matching this schema:
{
  "isCorrect": boolean,
  "explanation": "Clear explanation acknowledging why the answer was correct or breaking down the underlying misconception.",
  "recommendedAction": "reinforce" | "advance" | "review_docs"
}`;
}
