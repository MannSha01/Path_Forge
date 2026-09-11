// ===================================================
// VERCEL SERVERLESS ENDPOINT: /api/evaluateAnswer
// Evaluates user answers and diagnoses misconceptions
// ===================================================

function resolveModel(modelEnv, defaultModel = "gemini-1.5-flash") {
  if (!modelEnv) return defaultModel;
  return modelEnv.startsWith("gemini-") ? modelEnv : `gemini-${modelEnv}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, userAnswer, topic } = req.body || {};
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(503).json({
      error: "GEMINI_API_KEY is not configured in .env.local / Environment Variables."
    });
  }

  const model = resolveModel(process.env.AI_FAST_MODEL || process.env.AI_MODEL, "gemini-1.5-flash");

  try {
    const prompt = `You are the Path Forge Adaptive Career Evaluator.
Evaluate the candidate's understanding:
- Topic: ${topic || "Technical Topic"}
- Question: ${question || ""}
- Candidate Answer: ${userAnswer || ""}

OUTPUT STRICT RAW JSON ONLY matching this schema:
{
  "isCorrect": boolean,
  "explanation": "Clear explanation acknowledging why the answer was correct or breaking down the underlying misconception.",
  "recommendedAction": "reinforce" | "advance" | "review_docs"
}`;

    const response = await fetch(
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

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Gemini API Error" });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const evaluation = JSON.parse(rawText || "{}");
    return res.status(200).json({ evaluation });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to evaluate answer" });
  }
}
