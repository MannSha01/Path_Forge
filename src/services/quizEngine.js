// ===================================================
// PATH FORGE - QUIZ ENGINE SERVICE
// Pure business logic for quiz scoring & role matching
// ===================================================

/**
 * Calculates career recommendations based on user quiz answers.
 *
 * @param {Array<{ text: string, category: string, roleId: string }>} quizAnswers
 * @param {Record<string, { categoryName: string, roles: Array<any> }>} pathwaysData
 * @returns {{
 *   bestCategory: string,
 *   matchedRole: any,
 *   topMatches: Array<any>
 * }}
 */
export function calculateQuizResults(quizAnswers = [], pathwaysData = {}) {
  const roleScores = {};
  const categoryCounts = { tech: 0, "non-tech": 0 };

  quizAnswers.forEach((ans) => {
    if (!ans) return;
    if (ans.roleId) {
      roleScores[ans.roleId] = (roleScores[ans.roleId] || 0) + 1;
    }
    if (ans.category && categoryCounts[ans.category] !== undefined) {
      categoryCounts[ans.category]++;
    }
  });

  const bestCategory = categoryCounts["non-tech"] > categoryCounts.tech ? "non-tech" : "tech";

  // Collect all available roles across all categories
  const allRoles = [];
  Object.keys(pathwaysData).forEach((catKey) => {
    const cat = pathwaysData[catKey];
    if (cat && Array.isArray(cat.roles)) {
      cat.roles.forEach((r) => {
        allRoles.push({ ...r, category: catKey });
      });
    }
  });

  // Sort roles descending by score
  allRoles.sort((a, b) => {
    const scoreA = roleScores[a.id] || 0;
    const scoreB = roleScores[b.id] || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    // Prefer matching role from bestCategory in case of tie
    if (a.category === bestCategory && b.category !== bestCategory) return -1;
    if (b.category === bestCategory && a.category !== bestCategory) return 1;
    return 0;
  });

  const matchedRole = allRoles[0] || (pathwaysData.tech?.roles?.[0] ?? null);
  const topMatches = allRoles.slice(0, 2);

  return {
    bestCategory: matchedRole?.category || bestCategory,
    matchedRole,
    topMatches
  };
}
