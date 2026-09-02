// ===================================================
// VERCEL SERVERLESS ENDPOINT: /api/generateLesson
// Generates structured topic lesson content adhering strictly to Schema V2
// ===================================================

import { buildLessonPrompt } from "../src/services/ai/prompts/lessonPrompt.js";

function resolveModel(modelEnv, defaultModel = "gemini-3.6-flash") {
  if (!modelEnv) return defaultModel;
  return modelEnv.startsWith("gemini-") ? modelEnv : `gemini-${modelEnv}`;
}

/**
 * Validates that the lesson conforms to the required structure.
 * @param {any} data
 * @returns {boolean}
 */
function isValidLesson(data) {
  return (
    data &&
    typeof data === "object" &&
    typeof data.title === "string" &&
    typeof data.objective === "string" &&
    Array.isArray(data.sections) &&
    data.sections.length > 0 &&
    Array.isArray(data.keyPoints) &&
    Array.isArray(data.commonMistakes) &&
    data.practicalExample &&
    typeof data.practicalExample.description === "string"
  );
}

/**
 * Strips markdown fences or extra wrapper text to parse clean JSON.
 * @param {string} raw
 * @returns {any}
 */
function cleanAndParseJSON(raw) {
  if (!raw) return null;
  let cleaned = raw.trim();
  // Remove markdown code blocks ```json ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    topicTitle,
    topicDescription,
    prerequisites,
    targetRole,
    targetCompany,
    userMastery,
    previousPerformance,
    dailyMinutes,
    difficulty,
    jobRequirements,
    adaptationContext
  } = req.body || {};

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(503).json({
      error: "GEMINI_API_KEY is not configured in environment."
    });
  }

  if (!topicTitle) {
    return res.status(400).json({ error: "topicTitle is required." });
  }

  const model = resolveModel(process.env.AI_MODEL, "gemini-3.6-flash");

  const prompt = buildLessonPrompt({
    topicTitle,
    topicDescription,
    prerequisites,
    targetRole,
    targetCompany,
    userMastery: typeof userMastery === "number" ? userMastery : 30,
    previousPerformance,
    dailyMinutes: dailyMinutes || 45,
    difficulty: difficulty || "medium",
    jobRequirements,
    adaptationContext
  });

  const makeGeminiCall = async (textPrompt) => {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: textPrompt }] }],
          generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
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
    let lesson = null;

    try {
      lesson = cleanAndParseJSON(rawText);
    } catch {
      // Step 1 Repair: Retry parsing with repair prompt
      const repairPrompt = `The previous JSON response was malformed. Fix syntax and return STRICT RAW JSON ONLY matching this schema:
{
  "topic": "${topicTitle}",
  "title": "Title",
  "estimatedMinutes": 30,
  "objective": "Objective",
  "sections": [{"heading": "H1", "content": "Text", "examples": ["Ex"]}],
  "keyPoints": ["P1"],
  "commonMistakes": ["M1"],
  "practicalExample": {"description": "D", "code": "C", "language": "javascript"},
  "interviewPoints": ["I1"]
}
Raw text to repair:
${rawText}`;
      rawText = await makeGeminiCall(repairPrompt);
      lesson = cleanAndParseJSON(rawText);
    }

    if (!isValidLesson(lesson)) {
      // Step 2 Repair attempt if fields missing
      const fixPrompt = `Normalize this lesson into valid JSON matching exactly the required schema with all fields populated:
${JSON.stringify(lesson || {})}`;
      rawText = await makeGeminiCall(fixPrompt);
      lesson = cleanAndParseJSON(rawText);
    }

    if (!isValidLesson(lesson)) {
      return res.status(500).json({ error: "Generated lesson failed schema validation after repair attempt." });
    }

    return res.status(200).json({ lesson });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to generate adaptive lesson" });
  }
}
