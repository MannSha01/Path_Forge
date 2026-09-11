// ===================================================
// VERCEL SERVERLESS ENDPOINT: /api/analyzeAssessment
// Evaluates submitted answers (3-MCQ or Cumulative), calculates deterministic score
// and executes exactly ONE qualitative AI analysis call
// ===================================================

import { buildAssessmentAnalysisPrompt } from "../src/services/ai/prompts/adaptationPrompt.js";

function resolveModel(modelEnv, defaultModel = "gemini-1.5-flash") {
  if (!modelEnv) return defaultModel;
  return modelEnv.startsWith("gemini-") ? modelEnv : `gemini-${modelEnv}`;
}

function cleanAndParseJSON(raw) {
  if (!raw) return null;
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    topicTitle,
    questions = [],
    userAnswers = [],
    targetRole = "Software Engineer",
    nextTopicTitle = "",
    assessmentType = "topic",
    coveredTopics = []
  } = req.body || {};

  if (!questions || questions.length === 0 || !userAnswers || userAnswers.length === 0) {
    return res.status(400).json({ error: "questions and userAnswers are required." });
  }

  // 1. Deterministic scoring in JavaScript
  let correctCount = 0;
  const answeredDetails = questions.map((q, idx) => {
    const userAns = userAnswers.find((a) => a.questionId === q.id) || userAnswers[idx];
    const selectedIndex = userAns?.selectedIndex !== undefined ? userAns.selectedIndex : (userAns?.selectedOption ?? -1);
    const isCorrect = selectedIndex === q.correctIndex;
    if (isCorrect) correctCount++;

    return {
      questionId: q.id,
      concept: q.concept || q.skill || topicTitle,
      skill: q.skill || topicTitle,
      difficulty: q.difficulty || "medium",
      selectedIndex,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation
    };
  });

  const totalQuestions = questions.length;
  // Precise percentage rounded to 2 decimals if fraction, e.g. 66.67%
  const percentage = Math.round((correctCount / totalQuestions) * 10000) / 100;
  const submittedAt = new Date().toISOString();

  // Deterministic concept & retention categorization
  const masteredConcepts = [];
  const weakConcepts = [];
  const difficultyStats = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
    interview: { correct: 0, total: 0 }
  };

  answeredDetails.forEach((a) => {
    const diff = a.difficulty || "medium";
    if (!difficultyStats[diff]) difficultyStats[diff] = { correct: 0, total: 0 };
    difficultyStats[diff].total++;
    if (a.isCorrect) {
      difficultyStats[diff].correct++;
      if (!masteredConcepts.includes(a.concept)) masteredConcepts.push(a.concept);
    } else {
      if (!weakConcepts.includes(a.concept)) weakConcepts.push(a.concept);
    }
  });

  const isCumulative = assessmentType === "cumulative";
  let qualitativeLevel = "Strong understanding";
  if (totalQuestions === 3) {
    if (correctCount === 3) qualitativeLevel = "Strong understanding (100%)";
    else if (correctCount === 2) qualitativeLevel = "Partial understanding (66.67%)";
    else if (correctCount === 1) qualitativeLevel = "Weak understanding — reinforcement required (33.33%)";
    else qualitativeLevel = "Critical knowledge gap — foundations required (0%)";
  } else {
    // Cumulative (5 or 6 questions)
    if (percentage >= 80) qualitativeLevel = "Strong retention across topics";
    else if (percentage >= 60) qualitativeLevel = "Partial retention — targeted review recommended";
    else qualitativeLevel = "Low retention — prerequisite reinforcement required";
  }

  // 2. Exactly ONE AI Qualitative & Misconception Analysis Call
  const API_KEY = process.env.GEMINI_API_KEY;
  let aiAnalysis = {
    summary: `${correctCount}/${totalQuestions} — ${qualitativeLevel}`,
    masteredConcepts,
    weakConcepts,
    retentionConfirmed: isCumulative ? percentage >= 66.67 : undefined,
    misconceptionAnalysis: weakConcepts.length > 0
      ? `Identified conceptual gaps in: ${weakConcepts.join(", ")}. Review fundamental mechanics before proceeding.`
      : "No critical misconceptions identified. Accurate application of core principles.",
    adaptationAdvice: weakConcepts.length > 0
      ? `Future odd/even lane topics and prerequisite chains have been adapted to reinforce: ${weakConcepts.join(", ")}.`
      : "Learner has demonstrated mastery. Advancing pathway at accelerated pacing.",
    recommendedNextDifficulty: percentage >= 80 ? "hard" : percentage >= 50 ? "medium" : "easy"
  };

  if (API_KEY) {
    const model = resolveModel(process.env.AI_FAST_MODEL || process.env.AI_MODEL, "gemini-1.5-flash");
    try {
      const prompt = buildAssessmentAnalysisPrompt({
        topicTitle: isCumulative ? `Cumulative Checkpoint (${coveredTopics.join(", ")})` : topicTitle,
        questions,
        userAnswers: answeredDetails,
        targetRole,
        nextTopicTitle
      });

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
          })
        }
      );

      const data = await resp.json();
      if (resp.ok) {
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = cleanAndParseJSON(rawText);
        if (parsed) {
          aiAnalysis = {
            ...aiAnalysis,
            ...parsed,
            summary: parsed.summary || `${correctCount}/${totalQuestions} — ${qualitativeLevel}`,
            masteredConcepts: parsed.masteredConcepts?.length ? parsed.masteredConcepts : masteredConcepts,
            weakConcepts: parsed.weakConcepts?.length ? parsed.weakConcepts : weakConcepts
          };
        }
      }
    } catch (err) {
      console.warn("AI Assessment Analysis optional call failed, using deterministic evaluation:", err.message);
    }
  }

  return res.status(200).json({
    assessmentType,
    correctCount,
    score: correctCount, // legacy alias
    totalQuestions,
    total: totalQuestions, // legacy alias
    percentage,
    submittedAt,
    answeredDetails,
    difficultyStats,
    analysis: aiAnalysis
  });
}
