// ===================================================
// VERCEL SERVERLESS ENDPOINT: /api/analyzeGoal
// Analyzes user goal, resume & job requirements via Gemini API
// ===================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { targetPosition, targetCompany, jobDescription, resumeText, deadline, dailyMinutes } = req.body || {};
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(503).json({
      error: "GEMINI_API_KEY is not configured in .env.local / Environment Variables."
    });
  }

  if (!targetPosition) {
    return res.status(400).json({ error: "targetPosition is required." });
  }

  try {
    const prompt = `You are the Path Forge AI Career Gap Analyst.
Analyze this career goal and resume:
- Target Position: ${targetPosition}
- Target Company: ${targetCompany || "Not specified"}
- Job Description: ${jobDescription || "Standard industry job requirements for this role"}
- Candidate Resume: ${resumeText || "Candidate is starting from foundations"}
- Preparation Timeline: Deadline in ${deadline || "60 days"}, studying ${dailyMinutes || 60} mins/day.

OUTPUT STRICT RAW JSON ONLY (no markdown fences, no conversational text) matching this schema:
{
  "targetRole": "${targetPosition}",
  "targetCompany": "${targetCompany || "Industry Standard"}",
  "requiredSkills": ["array of 5-8 essential skills"],
  "currentSkills": ["array of skills candidate already demonstrates from resume"],
  "skillGaps": ["array of missing critical skills"],
  "strengths": ["array of candidate strengths"],
  "weaknesses": ["array of candidate areas needing reinforcement"],
  "prioritySkills": ["top 3 skills to tackle first"],
  "estimatedReadiness": integer between 10 and 90 representing current readiness percentage,
  "recommendedProjects": ["2-3 portfolio project titles"],
  "interviewTopics": ["3 key technical interview areas"]
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
    if (!rawText) {
      return res.status(500).json({ error: "Empty response from AI" });
    }

    const analysis = JSON.parse(rawText);
    return res.status(200).json({ analysis });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to analyze goal" });
  }
}
