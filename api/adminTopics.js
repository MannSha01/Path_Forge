import { verifyAdminToken } from "./adminAuth.js";

function resolveModel(modelEnv, defaultModel = "gemini-1.5-flash") {
  if (!modelEnv) return defaultModel;
  return modelEnv.startsWith("gemini-") ? modelEnv : `gemini-${modelEnv}`;
}

/**
 * Helper to extract and verify admin authorization from request.
 */
function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : (req.body?.adminToken || authHeader);
  return verifyAdminToken(token);
}

/**
 * Analyzes admin notes topic and content with Gemini AI.
 */
async function analyzeTopicAndNotes(title, content) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const safeTitle = title || "Untitled Topic";
  const safeContent = content || "General technical concepts and notes.";

  if (!API_KEY) {
    return {
      topicTitle: safeTitle,
      keywords: safeTitle.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
      category: "Core Engineering",
      importanceProfile: `Essential study material for ${safeTitle}.`,
      targetRoles: ["Software Engineer", "Frontend Developer", "Full Stack Developer"],
      summary: safeContent.slice(0, 150)
    };
  }

  const model = resolveModel(process.env.AI_FAST_MODEL || process.env.AI_MODEL, "gemini-1.5-flash");

  try {
    const prompt = `You are the Path Forge AI Curriculum & Goal Alignment Synthesizer.
Analyze this admin note topic title and notes content:
- Topic Title: ${safeTitle}
- Notes Content: ${safeContent}

OUTPUT STRICT RAW JSON ONLY matching this schema:
{
  "topicTitle": "${safeTitle}",
  "keywords": ["list of 4-7 specific technical keywords/skills"],
  "category": "Domain Category e.g. Frontend | Backend | System Design | AI/ML | Core Engineering",
  "importanceProfile": "Why this topic is important for career goals and what roles must master it",
  "targetRoles": ["matching target job titles e.g. Frontend Engineer, Full Stack Developer, Systems Architect"],
  "summary": "High yield summary of this note's teaching content"
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
      throw new Error(data.error?.message || "Gemini API Error");
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawText || "{}");
  } catch (err) {
    console.warn("Gemini topic analysis error, using fallback:", err.message);
    return {
      topicTitle: safeTitle,
      keywords: safeTitle.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
      category: "Core Engineering",
      importanceProfile: `Essential study material for ${safeTitle}.`,
      targetRoles: ["Software Engineer", "Frontend Developer", "Full Stack Developer"],
      summary: safeContent.slice(0, 150)
    };
  }
}

export default async function handler(req, res) {
  // Public read for published curriculum if requested
  if (req.method === "GET") {
    const isPublic = req.query.publishedOnly === "true";
    if (!isPublic) {
      const auth = requireAdmin(req);
      if (!auth.valid) {
        return res.status(403).json({ error: auth.error || "Admin privileges required" });
      }
    }
    // Return status OK for ping/health
    return res.status(200).json({ status: "ok", mode: isPublic ? "public" : "admin" });
  }

  // All mutations require valid admin token
  if (req.method === "POST" || req.method === "PUT" || req.method === "DELETE") {
    const auth = requireAdmin(req);
    if (!auth.valid) {
      return res.status(403).json({ error: auth.error || "Access Denied: Admin authorization required" });
    }

    const { action = "save", entity = "topic", data = {}, title, content } = req.body || {};

    if (action === "analyze" || action === "analyzeNotes") {
      const topicTitle = title || data.title || data.topicTitle;
      const notesContent = content || data.content || data.notes || (data.draftBlocks || []).map((b) => b.data?.content || b.data?.text || "").join("\n");
      const analysis = await analyzeTopicAndNotes(topicTitle, notesContent);
      return res.status(200).json({ success: true, analysis });
    }

    let topicAnalysis = null;
    if (data.title || data.topicTitle) {
      const topicTitle = data.title || data.topicTitle;
      const notesContent = data.content || (data.draftBlocks || []).map((b) => b.data?.content || b.data?.text || "").join("\n");
      topicAnalysis = await analyzeTopicAndNotes(topicTitle, notesContent);
    }

    return res.status(200).json({
      success: true,
      action,
      entity,
      adminEmail: auth.email,
      analysis: topicAnalysis,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
