// ===================================================
// VERCEL SERVERLESS ENDPOINT: /api/generateLesson
// Generates structured concept lessons & interactive questions
// ===================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { topicTitle, concepts, userMastery } = req.body || {};
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(503).json({
      error: "GEMINI_API_KEY is not configured in .env.local / Environment Variables."
    });
  }

  if (!topicTitle) {
    return res.status(400).json({ error: "topicTitle is required." });
  }

  try {
    const prompt = `You are the Path Forge Adaptive AI Teacher.
Generate a structured, interactive lesson for:
- Topic: ${topicTitle}
- Core Concepts: ${(concepts || []).join(", ") || topicTitle}
- User Current Mastery: ${userMastery || 30}%

OUTPUT STRICT RAW JSON ONLY (no markdown fences, no extra text) matching this schema:
{
  "title": "${topicTitle}",
  "objective": "Clear single-sentence learning goal",
  "explanation": "In-depth, clear technical explanation with practical rationale",
  "examples": ["2 concrete code or practical walkthrough examples"],
  "keyPoints": ["3 essential takeaways"],
  "commonMistakes": ["2 common pitfalls or bugs engineers introduce"],
  "questions": [
    {
      "id": "q1",
      "skill": "${concepts?.[0] || topicTitle}",
      "topic": "${topicTitle}",
      "difficulty": "${userMastery >= 60 ? "medium" : "easy"}",
      "question": "A scenario-based multiple choice question testing this concept",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why Option A is correct and why other options represent anti-patterns",
      "conceptTested": "The exact principle tested"
    }
  ]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Gemini API Error" });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(500).json({ error: "Empty lesson response from AI" });
    }

    const lesson = JSON.parse(rawText);
    return res.status(200).json({ lesson });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to generate lesson" });
  }
}
