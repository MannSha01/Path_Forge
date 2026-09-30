// ===================================================
// VERCEL SERVERLESS ENDPOINT: /api/rewriteResumeBullet
// Reuses GEMINI_API_KEY to polish bullets with Google's XYZ formula
// ===================================================

function resolveModel(modelEnv, defaultModel = "gemini-1.5-flash") {
  if (!modelEnv) return defaultModel;
  return modelEnv.startsWith("gemini-") ? modelEnv : `gemini-${modelEnv}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { bulletPoint, targetRole, targetCompany, jobDescription } = req.body || {};

  if (!bulletPoint || !bulletPoint.trim()) {
    return res.status(400).json({ error: "bulletPoint is required." });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(503).json({
      error: "GEMINI_API_KEY is not configured in environment variables."
    });
  }

  const model = resolveModel(process.env.AI_FAST_MODEL || process.env.AI_MODEL, "gemini-1.5-flash");

  try {
    const prompt = `You are the Path Forge ATS Resume Optimizer.
Rewrite the candidate's raw bullet point into an ATS-optimized achievement.

CONTEXT:
- Target Role: ${targetRole || "Software Engineer / Professional"}
- Target Company: ${targetCompany || "Industry Standard"}
- Job Requirements: ${jobDescription || "Standard role competencies"}
- Raw Candidate Bullet: "${bulletPoint}"

REWRITING CRITERIA:
1. Format using Google's XYZ formula: "Accomplished [X], as measured by [Y], by doing [Z]".
2. Begin with a powerful past-tense action verb (e.g., Engineered, Spearheaded, Accelerated, Optimized).
3. Inject realistic quantifiable metrics (percentages, latency cuts, throughput, scale).
4. Integrate high-relevance ATS keywords from the target role.
5. Provide a realistic ATS score (0-100) for both original and rewritten bullets.

OUTPUT STRICT RAW JSON ONLY matching this schema:
{
  "original": "${bulletPoint.replace(/"/g, '\\"')}",
  "optimized": "High-impact XYZ rewritten bullet point",
  "keywordsAdded": ["Keyword1", "Keyword2", "Keyword3"],
  "scoreBefore": 42,
  "scoreAfter": 94,
  "critique": "Brief 1-sentence explanation of what was improved."
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.25,
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Gemini API Error"
      });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const rewrite = JSON.parse(rawText || "{}");
    return res.status(200).json({ rewrite });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to rewrite resume bullet"
    });
  }
}
