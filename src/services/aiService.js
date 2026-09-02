// ===================================================
// PATH FORGE - AI SERVICE
// Client-side API abstraction for the AI Career Advisor
// ===================================================

const API_ENDPOINT = "/api/generate";

/**
 * Send a career advisory prompt to the serverless AI endpoint.
 *
 * @param {string} userPrompt - The user's career question or context.
 * @returns {Promise<string>} - HTML formatted advice string from Gemini API.
 */
export async function askCareerAdvisor(userPrompt) {
  const trimmed = (userPrompt || "").trim();
  if (!trimmed) {
    throw new Error("Prompt cannot be empty.");
  }

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ userPrompt: trimmed })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Server returned status ${response.status}`);
  }

  if (!data.result) {
    throw new Error("No response was returned from the advisor.");
  }

  return data.result;
}
