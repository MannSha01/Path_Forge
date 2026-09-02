// ===================================================
// PATH FORGE - VALIDATION & SANITIZATION UTILITIES
// Safe input checkers, AI JSON parsers & math boundaries
// ===================================================

/**
 * Clamp a number between min and max bounds.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min = 0, max = 100) {
  if (typeof val !== "number" || isNaN(val)) return min;
  return Math.min(Math.max(val, min), max);
}

/**
 * Safely parse JSON from AI string responses, stripping markdown fences if present.
 * @param {string} rawString
 * @param {any} [fallback={}]
 * @returns {any}
 */
export function safeParseAIJson(rawString, fallback = {}) {
  if (!rawString || typeof rawString !== "string") return fallback;

  let cleaned = rawString.trim();

  // Remove ```json ... ``` code blocks
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt regex extraction of first JSON object or array
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (nestedErr) {
        console.warn("Failed to parse extracted JSON block:", nestedErr);
      }
    }
    console.warn("JSON parsing failed, returning fallback:", err);
    return fallback;
  }
}

/**
 * Validates a Goal submission payload.
 * @param {object} goal
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateGoalInput(goal) {
  const errors = [];
  if (!goal) return { valid: false, errors: ["Missing goal data"] };

  if (!goal.targetPosition || !goal.targetPosition.trim()) {
    errors.push("Target position is required.");
  }

  if (!goal.deadline) {
    errors.push("Deadline is required.");
  } else {
    const deadlineDate = new Date(goal.deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
      errors.push("Deadline must be a valid future date.");
    }
  }

  if (!goal.dailyMinutes || goal.dailyMinutes < 15) {
    errors.push("Daily study time must be at least 15 minutes.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Computes integer days remaining from now until a deadline.
 * @param {string | Date} deadline
 * @returns {number}
 */
export function calculateDaysRemaining(deadline) {
  if (!deadline) return 0;
  const target = new Date(deadline).getTime();
  const now = Date.now();
  const diff = target - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
