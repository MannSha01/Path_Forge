// ===================================================
// PATH FORGE - GEMINI AI PROVIDER
// Direct endpoint caller & request formatter for Gemini APIs
// ===================================================

export class GeminiProvider {
  constructor(config = {}) {
    this.providerName = "gemini";
    this.model = config.model || "gemini-1.5-flash";
    this.fastModel = config.fastModel || "gemini-1.5-flash";
  }

  /**
   * Dispatches an HTTP request to an internal API endpoint.
   * @param {string} endpoint - Relative path (e.g. /api/analyzeGoal)
   * @param {object} payload - JSON body payload
   * @returns {Promise<any>}
   */
  async callEndpoint(endpoint, payload) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const err = new Error(data.error || `Server responded with status ${response.status}`);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  }
}

export const defaultGeminiProvider = new GeminiProvider();
