// ===================================================
// VERCEL SERVERLESS ENDPOINT: /api/generateQuestions
// Generates exactly 3 MCQs per topic (or 5-6 for cumulative) with anti-repeat protection
// ===================================================

import { buildQuestionPrompt } from "../src/services/ai/prompts/questionPrompt.js";

function resolveModel(modelEnv, defaultModel = "gemini-3.6-flash") {
  if (!modelEnv) return defaultModel;
  return modelEnv.startsWith("gemini-") ? modelEnv : `gemini-${modelEnv}`;
}

function cleanAndParseJSON(raw) {
  if (!raw) return null;
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned);
}

function generateAssessmentId(prefix = "asm") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    topicTitle,
    concepts = [],
    userMastery = 30,
    previousQuestionTexts = [],
    targetRole = "Software Engineer",
    questionCount = 3,
    assessmentType = "topic",
    coveredTopics = []
  } = req.body || {};

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(503).json({
      error: "GEMINI_API_KEY is not configured in environment."
    });
  }

  if (!topicTitle && (!coveredTopics || coveredTopics.length === 0)) {
    return res.status(400).json({ error: "topicTitle or coveredTopics is required." });
  }

  const model = resolveModel(process.env.AI_MODEL, "gemini-3.6-flash");
  const expectedCount = assessmentType === "cumulative" ? Math.max(5, Math.min(6, questionCount || 5)) : 3;

  const prompt = buildQuestionPrompt({
    topicTitle: topicTitle || "Cumulative Checkpoint",
    concepts,
    userMastery: typeof userMastery === "number" ? userMastery : 30,
    previousQuestionTexts,
    targetRole,
    questionCount: expectedCount,
    assessmentType,
    coveredTopics
  });

  const makeGeminiCall = async (textPrompt) => {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: textPrompt }] }],
          generationConfig: { temperature: 0.35, responseMimeType: "application/json" }
        })
      }
    );
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error?.message || `Gemini API Error: ${resp.status}`);
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  };

  try {
    let rawText = await makeGeminiCall(prompt);
    let parsed = cleanAndParseJSON(rawText);

    // Validate question count
    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length < expectedCount) {
      const retryPrompt = `${prompt}\n\nIMPORTANT: Previous attempt did not contain ${expectedCount} questions. You MUST generate EXACTLY ${expectedCount} questions.`;
      rawText = await makeGeminiCall(retryPrompt);
      parsed = cleanAndParseJSON(rawText);
    }

    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return res.status(500).json({ error: `Failed to generate ${expectedCount}-question assessment.` });
    }

    // Ensure exactly expectedCount questions and stable IDs
    const questions = parsed.questions.slice(0, expectedCount).map((q, idx) => ({
      id: q.id || `q_${assessmentType}_${Date.now()}_${idx + 1}`,
      skill: q.skill || concepts[idx % (concepts.length || 1)] || topicTitle,
      concept: q.concept || topicTitle,
      difficulty: q.difficulty || (idx === 0 ? "easy" : idx === 1 ? "medium" : "hard"),
      question: q.question,
      options: Array.isArray(q.options) ? q.options.slice(0, 4) : ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
      explanation: q.explanation || "Correct option selected."
    }));

    const assessmentId = generateAssessmentId(assessmentType === "cumulative" ? "cum" : "asm");

    return res.status(200).json({
      assessmentId,
      assessmentType,
      topic: topicTitle,
      coveredTopics: assessmentType === "cumulative" ? coveredTopics : [topicTitle],
      questionCount: questions.length,
      questions
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to generate questions" });
  }
}
