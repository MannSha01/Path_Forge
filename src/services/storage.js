// ===================================================
// PATH FORGE - STORAGE SERVICE
// Centralized browser localStorage persistence layer
// ===================================================

const KEYS = {
  COMPLETED: "pathforge_completed",
  CATEGORY: "pathforge_selected_category",
  ROLE_ID: "pathforge_selected_role_id",
  QUIZ_RESULT: "pathforge_quiz_result"
};

/**
 * Retrieve the map of completed step IDs.
 * @param {string} [userId]
 * @returns {Record<string, boolean>}
 */
export function getProgress(userId = null) {
  try {
    const key = userId ? `pathforge_user_completed_${userId}` : KEYS.COMPLETED;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn("Error reading progress from localStorage:", err);
    return {};
  }
}

/**
 * Persist the map of completed step IDs.
 * @param {Record<string, boolean>} completedMap
 * @param {string} [userId]
 */
export function saveProgress(completedMap, userId = null) {
  try {
    const key = userId ? `pathforge_user_completed_${userId}` : KEYS.COMPLETED;
    localStorage.setItem(key, JSON.stringify(completedMap || {}));
  } catch (err) {
    console.warn("Error saving progress to localStorage:", err);
  }
}

/**
 * Reset completed steps.
 * @param {string} [userId]
 */
export function resetProgress(userId = null) {
  try {
    const key = userId ? `pathforge_user_completed_${userId}` : KEYS.COMPLETED;
    localStorage.removeItem(key);
  } catch (err) {
    console.warn("Error resetting progress in localStorage:", err);
  }
}

/**
 * Get the currently selected category ('tech' or 'non-tech').
 * @returns {string | null}
 */
export function getSelectedCategory() {
  try {
    return localStorage.getItem(KEYS.CATEGORY);
  } catch (err) {
    return null;
  }
}

/**
 * Save the selected category.
 * @param {string | null} categoryKey
 */
export function saveSelectedCategory(categoryKey) {
  try {
    if (categoryKey) {
      localStorage.setItem(KEYS.CATEGORY, categoryKey);
    } else {
      localStorage.removeItem(KEYS.CATEGORY);
    }
  } catch (err) {
    console.warn("Error saving category to localStorage:", err);
  }
}

/**
 * Get the currently selected role ID.
 * @returns {string | null}
 */
export function getSelectedRoleId() {
  try {
    return localStorage.getItem(KEYS.ROLE_ID);
  } catch (err) {
    return null;
  }
}

/**
 * Save the selected role ID.
 * @param {string | null} roleId
 */
export function saveSelectedRoleId(roleId) {
  try {
    if (roleId) {
      localStorage.setItem(KEYS.ROLE_ID, roleId);
    } else {
      localStorage.removeItem(KEYS.ROLE_ID);
    }
  } catch (err) {
    console.warn("Error saving role ID to localStorage:", err);
  }
}

/**
 * Get saved quiz result recommendation.
 * @returns {any | null}
 */
export function getQuizResult() {
  try {
    const raw = localStorage.getItem(KEYS.QUIZ_RESULT);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

/**
 * Persist quiz result recommendation.
 * @param {any} result
 */
export function saveQuizResult(result) {
  try {
    if (result) {
      localStorage.setItem(KEYS.QUIZ_RESULT, JSON.stringify(result));
    } else {
      localStorage.removeItem(KEYS.QUIZ_RESULT);
    }
  } catch (err) {
    console.warn("Error saving quiz result to localStorage:", err);
  }
}
