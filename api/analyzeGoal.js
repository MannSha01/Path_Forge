// ===================================================
// VERCEL SERVERLESS ENDPOINT: /api/analyzeGoal
// Analyzes user goal, resume & job requirements via Gemini API
// ===================================================

function resolveModel(modelEnv, defaultModel = "gemini-1.5-flash") {
  if (!modelEnv) return defaultModel;
  return modelEnv.startsWith("gemini-") ? modelEnv : `gemini-${modelEnv}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { targetPosition, targetCompany, jobDescription, resumeText, deadline, dailyMinutes, adminTopics = [] } = req.body || {};
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(503).json({
      error: "GEMINI_API_KEY is not configured in .env.local / Environment Variables."
    });
  }

  if (!targetPosition) {
    return res.status(400).json({ error: "targetPosition is required." });
  }

  const model = resolveModel(process.env.AI_MODEL, "gemini-1.5-flash");

  try {
    const adminTopicsFormatted = (adminTopics || []).map((t) => ({
      id: t.id || t.topicId,
      title: t.title,
      summary: t.summary || t.description || "",
      category: t.category || "General",
      keywords: t.keywords || []
    }));

    const prompt = `You are the Path Forge AI Career Gap Analyst & Admin Curriculum Evaluator.
Analyze this career goal and resume:
- Target Position: ${targetPosition}
- Target Company: ${targetCompany || "Not specified"}
- Job Description: ${jobDescription || "Standard industry job requirements for this role"}
- Candidate Resume: ${resumeText || "Candidate is starting from foundations"}
- Preparation Timeline: Deadline in ${deadline || "60 days"}, studying ${dailyMinutes || 60} mins/day.
- Published Admin Portal Topics & Notes Modules: ${JSON.stringify(adminTopicsFormatted)}

Analyze if any of the Published Admin Portal Topics are important/relevant for the candidate's target role (${targetPosition}).

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
  "estimatedReadiness": 45,
  "recommendedProjects": ["2-3 portfolio project titles"],
  "interviewTopics": ["3 key technical interview areas"],
  "importantAdminTopicIds": ["array of IDs from adminTopics that are important for this target role"],
  "adminTopicEvaluations": [
    {
      "topicId": "string ID",
      "title": "Topic Title",
      "isImportant": true,
      "relevanceReason": "Why this admin topic/module is important for target role"
    }
  ]
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
    if (!rawText) {
      return res.status(500).json({ error: "Empty response from AI" });
    }

    const analysis = JSON.parse(rawText);
    return res.status(200).json({ analysis });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to analyze goal" });
  }
}
