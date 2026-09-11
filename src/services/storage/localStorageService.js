// ===================================================
// PATH FORGE - LOCAL STORAGE SERVICE
// Client cache, offline drafts & in-memory fallback for SSR / testing
// ===================================================

const PREFIX = "pathforge_";
const memoryStore = new Map();

export const LocalStorageService = {
  get(key, fallback = null) {
    if (typeof localStorage === "undefined") {
      return memoryStore.has(PREFIX + key) ? memoryStore.get(PREFIX + key) : fallback;
    }
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.warn(`LocalStorage read failed for ${key}:`, err);
      return fallback;
    }
  },

  set(key, value) {
    if (typeof localStorage === "undefined") {
      memoryStore.set(PREFIX + key, value);
      return;
    }
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (err) {
      console.warn(`LocalStorage write failed for ${key}:`, err);
    }
  },

  remove(key) {
    if (typeof localStorage === "undefined") {
      memoryStore.delete(PREFIX + key);
      return;
    }
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (err) {
      console.warn(`LocalStorage remove failed for ${key}:`, err);
    }
  },

  clear() {
    memoryStore.clear();
    if (typeof localStorage === "undefined") return;
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    } catch (err) {
      console.warn("LocalStorage clear failed:", err);
    }
  },

  /**
   * Get account-specific completed topics map.
   * @param {string} userId
   * @returns {Record<string, boolean>}
   */
  getUserCompletedTopics(userId) {
    if (!userId) return {};
    return this.get(`user_completed_${userId}`, {});
  },

  /**
   * Persist account-specific completed topics map.
   * @param {string} userId
   * @param {Record<string, boolean>} completedMap
   */
  setUserCompletedTopics(userId, completedMap) {
    if (!userId) return;
    this.set(`user_completed_${userId}`, completedMap || {});
  },

  /**
   * Clears the UI display hint cache (auth_session).
   *
   * IMPORTANT: This key is NOT used for authentication decisions.
   * Firebase Auth (onAuthStateChanged) is the sole source of truth for
   * whether a user is authenticated. This cache only holds display data
   * (name, email, photoURL) for UI hints while Firebase resolves.
   *
   * Never restore auth_session as a substitute for Firebase authentication.
   */
  clearUserSession() {
    this.remove("auth_session");
  },

  /**
   * Sets legacy progress (used for migration testing and legacy adapters).
   * @param {Record<string, boolean>} completedMap
   */
  setLegacyProgress(completedMap) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("pathforge_completed", JSON.stringify(completedMap));
    } else {
      memoryStore.set("pathforge_completed", completedMap);
    }
  },

  /**
   * Migrates legacy unauthenticated progress to the authenticated user store.
   * Safely clears legacy store so it cannot leak to other accounts.
   * @param {string} userId
   * @returns {Record<string, boolean> | null}
   */
  migrateLegacyProgress(userId) {
    if (!userId) return null;
    try {
      // If user already has account-specific progress, do not overwrite
      const existing = this.getUserCompletedTopics(userId);
      if (existing && Object.keys(existing).length > 0) {
        return existing;
      }

      let legacyCompleted = null;
      if (typeof localStorage !== "undefined") {
        const legacyRaw = localStorage.getItem("pathforge_completed");
        if (legacyRaw) {
          legacyCompleted = JSON.parse(legacyRaw);
        }
      } else {
        legacyCompleted = memoryStore.get("pathforge_completed") || memoryStore.get(PREFIX + "completed") || null;
      }
      if (!legacyCompleted) return null;

      if (typeof legacyCompleted === "object" && Object.keys(legacyCompleted).length > 0) {
        this.setUserCompletedTopics(userId, legacyCompleted);
        // Remove legacy unauthenticated key to prevent leakage into subsequent accounts
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem("pathforge_completed");
        } else {
          memoryStore.delete("pathforge_completed");
          memoryStore.delete(PREFIX + "completed");
        }
        return legacyCompleted;
      }
    } catch (err) {
      console.warn("Migration failed:", err);
    }
    return null;
  }
};
