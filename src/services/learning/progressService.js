// ===================================================
// PATH FORGE - PROGRESS SERVICE
// Study sessions, today's time tracker & milestone completion
// ===================================================

import { databaseService } from "../database/databaseService.js";

export const progressService = {
  /**
   * Log minutes spent in active learning or practice.
   * @param {string} userId
   * @param {number} minutes
   * @param {string} [lessonId=""]
   */
  async recordTimeSpent(userId, minutes, lessonId = "") {
    if (!userId || !minutes) return;
    await databaseService.logLearningSession({
      userId,
      minutesSpent: minutes,
      lessonId,
      date: new Date().toISOString()
    });
  },

  /**
   * Returns total minutes spent by the user today.
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async getTodayMinutes(userId) {
    if (!userId) return 0;
    return databaseService.getTodayMinutesSpent(userId);
  }
};
