// ===================================================
// PATH FORGE - ADAPTATION & EVALUATION PROMPT BUILDER
// Analyzes multi-question assessments and formulates future topic adaptation directives
// ===================================================

/**
 * Builds the prompt for qualitative assessment analysis and future lesson adaptation advice.
 *
 * @param {object} params
 * @param {string} params.topicTitle
 * @param {object[]} params.questions
 * @param {Array<{ questionId: string, selectedIndex: number, isCorrect: boolean }>} params.userAnswers
 * @param {string} [params.targetRole="Software Engineer"]
 * @param {string} [params.nextTopicTitle=""]
 * @returns {string}
 */
export function buildAssessmentAnalysisPrompt({
  topicTitle,
  questions = [],
  userAnswers = [],
  targetRole = "Software Engineer",
  nextTopicTitle = ""
}) {
  const answerSummary = questions.map((q, idx) => {
    const ans = userAnswers.find((a) => a.questionId === q.id) || userAnswers[idx];
    const isCorrect = ans ? ans.isCorrect : false;
    const selectedOpt = ans && ans.selectedIndex !== undefined ? q.options[ans.selectedIndex] : "None";
    return `Q${idx + 1} (${q.difficulty}, Concept: "${q.concept || q.skill}"): ${isCorrect ? "CORRECT" : "INCORRECT"} | Chosen: "${selectedOpt}"`;
  }).join("\n");

  return `You are the Path Forge Adaptive Career Learning Engine.
Analyze the candidate's performance on this topic assessment:
- Topic: ${topicTitle}
- Target Role: ${targetRole}
- Next Topic in Sequence: ${nextTopicTitle || "Next Scheduled Topic"}

PERFORMANCE RECORD:
${answerSummary}

TASK:
1. Diagnose underlying misconceptions from the incorrect answers.
2. Identify strong concepts mastered and weak concepts requiring reinforcement.
3. Recommend specific adjustments for the NEXT topic (${nextTopicTitle || "upcoming topic"}).

OUTPUT STRICT RAW JSON ONLY matching this schema:
{
  "summary": "1-2 sentence qualitative summary of understanding (e.g. Strong understanding, Partial understanding)",
  "masteredConcepts": ["Concept 1", "Concept 2"],
  "weakConcepts": ["Weak Concept 1"],
  "misconceptionAnalysis": "Detailed breakdown of the mistakes made and why the candidate chose them",
  "adaptationAdvice": "Actionable instructions on how the next lesson should reinforce weak concepts or accelerate",
  "recommendedNextDifficulty": "easy" | "medium" | "hard" | "interview"
}`;
}
