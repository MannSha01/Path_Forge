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
   * Migrates legacy unauthenticated progress (from early versions) to the authenticated user store.
   * @param {string} userId
   * @returns {Record<string, boolean> | null}
   */
  migrateLegacyProgress(userId) {
    try {
      let legacyRaw = null;
      if (typeof localStorage !== "undefined") {
        legacyRaw = localStorage.getItem("pathforge_completed");
      }
      if (!legacyRaw) return null;

      const legacyCompleted = JSON.parse(legacyRaw);
      if (legacyCompleted && Object.keys(legacyCompleted).length > 0) {
        this.set(`user_completed_${userId}`, legacyCompleted);
        return legacyCompleted;
      }
    } catch (err) {
      console.warn("Migration failed:", err);
    }
    return null;
  }
};
