// ===================================================
// PATH FORGE - LESSON PROMPT BUILDER
// Builds structured prompts tailored to career, role, company & mastery
// ===================================================

/**
 * Builds the prompt for generating adaptive topic lesson content.
 *
 * @param {object} params
 * @param {string} params.topicTitle
 * @param {string} [params.topicDescription=""]
 * @param {string[]} [params.prerequisites=[]]
 * @param {string} [params.targetRole="Software Engineer"]
 * @param {string} [params.targetCompany=""]
 * @param {number} [params.userMastery=30]
 * @param {object} [params.previousPerformance=null]
 * @param {number} [params.dailyMinutes=60]
 * @param {string} [params.difficulty="medium"]
 * @param {string} [params.jobRequirements=""]
 * @param {object} [params.adaptationContext=null]
 * @returns {string}
 */
export function buildLessonPrompt({
  topicTitle,
  topicDescription = "",
  prerequisites = [],
  targetRole = "Software Engineer",
  targetCompany = "",
  userMastery = 30,
  previousPerformance = null,
  dailyMinutes = 60,
  difficulty = "medium",
  jobRequirements = "",
  adaptationContext = null
}) {
  let depthInstructions = "";
  if (userMastery < 45) {
    depthInstructions = `
- Mastery is LOW (${userMastery}%):
  * Explain fundamentals thoroughly from first principles.
  * Use clear, simple, accessible language.
  * Provide intuitive, step-by-step basic examples before introducing edge cases.
  * Introduce technical terminology gradually with clear context.`;
  } else if (userMastery < 75) {
    depthInstructions = `
- Mastery is MEDIUM (${userMastery}%):
  * Move quickly past basic definitions and explain deeper structural concepts.
  * Provide practical, production-level examples.
  * Introduce edge cases, common trade-offs, and design patterns.`;
  } else {
    depthInstructions = `
- Mastery is HIGH (${userMastery}%):
  * Minimize basic explanations; assume strong foundational knowledge.
  * Focus on interview-level, architectural-scale, and production performance considerations.
  * Include harder, non-trivial examples and subtle edge cases.
  * Emphasize common traps, anti-patterns, and real-world system application.`;
  }

  let adaptationInstructions = "";
  if (adaptationContext || previousPerformance) {
    const weakConcepts = adaptationContext?.weakConcepts || previousPerformance?.weakConcepts || [];
    const prevScore = previousPerformance?.score !== undefined ? `${previousPerformance.score}/5` : null;
    if (weakConcepts.length > 0) {
      adaptationInstructions = `
CRITICAL ADAPTATION DIRECTIVE:
The learner scored ${prevScore || "low"} on previous topic evaluations and demonstrated weakness in: ${weakConcepts.join(", ")}.
In this lesson:
- Include a brief prerequisite review addressing these weak concepts.
- Show how the current topic (${topicTitle}) builds upon or avoids traps related to: ${weakConcepts.join(", ")}.
- Slow down the introduction of dependent concepts to solidify understanding.`;
    } else if (previousPerformance?.score === 5) {
      adaptationInstructions = `
ACCELERATION DIRECTIVE:
The learner scored 5/5 on previous evaluations with strong mastery.
- Move faster through basic concepts.
- Provide deeper, interview-grade code examples and advanced patterns.`;
    }
  }

  return `You are the Path Forge Adaptive AI Teacher.
Generate an in-depth, structured learning lesson for the following topic:

TOPIC CONTEXT:
- Topic: ${topicTitle}
- Topic Description: ${topicDescription || "Core industry skill"}
- Prerequisites: ${prerequisites.length ? prerequisites.join(", ") : "None"}
- Target Role: ${targetRole}
- Target Company: ${targetCompany || "Industry Standard Tier"}
- Learner Current Mastery: ${userMastery}%
- Difficulty Tier: ${difficulty}
- Available Study Time: ${dailyMinutes} minutes
${jobRequirements ? `- Relevant Job Requirements: ${jobRequirements}` : ""}

TEACHING ADAPTATION:
${depthInstructions}
${adaptationInstructions}

OUTPUT STRICT RAW JSON ONLY (no markdown code blocks, no backticks, no introductory or trailing text).
The JSON MUST adhere exactly to this schema:
{
  "topic": "${topicTitle}",
  "title": "Clear, engaging title (e.g., Understanding ${topicTitle})",
  "estimatedMinutes": ${Math.min(dailyMinutes, 45)},
  "objective": "Clear single-sentence learning objective aligned with ${targetRole}",
  "sections": [
    {
      "heading": "Core concept heading",
      "content": "Detailed explanatory text explaining the concept clearly",
      "examples": ["Concrete illustrative scenario or mini-example"]
    },
    {
      "heading": "Practical mechanics / How it works",
      "content": "In-depth explanation of internal mechanics and real-world usage",
      "examples": ["Practical scenario or architectural trade-off"]
    }
  ],
  "keyPoints": [
    "Crucial takeaway 1",
    "Crucial takeaway 2",
    "Crucial takeaway 3"
  ],
  "commonMistakes": [
    "Common misconception or anti-pattern 1",
    "Common misconception or anti-pattern 2"
  ],
  "practicalExample": {
    "description": "Real-world production scenario where this concept is implemented",
    "code": "// Clean, illustrative code snippet demonstrating this topic\\nfunction example() { ... }",
    "language": "javascript"
  },
  "interviewPoints": [
    "Technical interview question / discussion point 1",
    "Technical interview question / discussion point 2"
  ]
}`;
}
