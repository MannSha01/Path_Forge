// ===================================================
// VERCEL SERVERLESS ENDPOINT: /api/generateNotes
// Compiles structured lesson notes, definitions & interview prep
// ===================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { lessonContent } = req.body || {};
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(503).json({
      error: "GEMINI_API_KEY is not configured in .env.local / Environment Variables."
    });
  }

  try {
    const prompt = `You are the Path Forge AI Study Notes Synthesizer.
Summarize this lesson into permanent study notes:
- Title: ${lessonContent?.title || "Technical Lesson"}
- Summary / Objective: ${lessonContent?.objective || ""}
- Explanation: ${lessonContent?.explanation || ""}
- Key Points: ${(lessonContent?.keyPoints || []).join(", ")}

OUTPUT STRICT RAW JSON ONLY matching this schema:
{
  "title": "${lessonContent?.title || "Lesson Notes"}",
  "summary": "Concise high-yield summary",
  "keyConcepts": ["list of 3-5 core principles"],
  "definitions": [{"term": "Term Name", "definition": "Clear concise definition"}],
  "examples": ["Key illustrative example or code snippet"],
  "commonMistakes": ["Critical mistakes to avoid"],
  "interviewPoints": ["2-3 specific technical interview questions and how to answer them"]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
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
    const notes = JSON.parse(rawText || "{}");
    return res.status(200).json({ notes });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to generate notes" });
  }
}
