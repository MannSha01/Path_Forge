// ===================================================
// PATH FORGE - ASSESSMENT ENGINE
// Initial skill baseline determination & gap analysis
// ===================================================

import { initSkillProfile } from "./skillEngine.js";

/**
 * Derives an initial baseline skill profile from user goal, resume, and role requirements.
 *
 * @param {object} params
 * @param {string[]} params.requiredSkills
 * @param {string} [params.resumeText=""]
 * @param {string} [params.jobDescription=""]
 * @returns {{ skillProfile: Record<string, object>, detectedSkills: string[], missingSkills: string[] }}
 */
export function evaluateInitialSkills({ requiredSkills = [], resumeText = "", jobDescription = "" }) {
  const normalizedResume = (resumeText || "").toLowerCase();
  const detectedSkills = [];
  const missingSkills = [];
  const initialScores = {};

  requiredSkills.forEach((skill) => {
    const term = skill.toLowerCase();
    const foundInResume = normalizedResume.includes(term);

    if (foundInResume) {
      detectedSkills.push(skill);
      initialScores[skill] = 55; // verified familiarity
    } else {
      missingSkills.push(skill);
      initialScores[skill] = 20; // baseline to learn
    }
  });

  const skillProfile = initSkillProfile(requiredSkills, initialScores);

  return {
    skillProfile,
    detectedSkills,
    missingSkills
  };
}
