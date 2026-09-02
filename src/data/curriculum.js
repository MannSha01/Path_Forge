// ===================================================
// PATH FORGE - CURRICULUM DEPENDENCY GRAPH
// Structured topic prerequisites, skills & duration weights
// ===================================================

import { PATHWAYS_DATA } from "./pathways.js";

/**
 * Normalizes all role steps from PATHWAYS_DATA into a queryable topic graph.
 */
function buildCurriculumGraph() {
  const topics = {};
  const roleTopicMap = {};

  Object.entries(PATHWAYS_DATA).forEach(([catKey, catObj]) => {
    catObj.roles.forEach((role) => {
      const topicIds = [];
      role.steps.forEach((step, idx) => {
        const prereqs = idx > 0 ? [role.steps[idx - 1].id] : [];
        const topic = {
          id: step.id,
          roleId: role.id,
          category: catKey,
          title: step.title,
          summary: step.summary,
          durationWeeks: step.duration,
          estimatedMinutes: 45, // default lesson duration in minutes
          concepts: step.concepts || [],
          prerequisites: prereqs,
          syllabus: step.syllabus || [],
          resources: step.resources || [],
          project: step.project || "",
          difficulty: idx === 0 ? "easy" : idx < 3 ? "medium" : "hard"
        };
        topics[step.id] = topic;
        topicIds.push(step.id);
      });
      roleTopicMap[role.id] = topicIds;
    });
  });

  return { topics, roleTopicMap };
}

export const { topics: CURRICULUM_TOPICS, roleTopicMap: ROLE_TOPICS } = buildCurriculumGraph();

/**
 * Returns all topics required for a given role ID.
 * @param {string} roleId
 * @returns {Array<object>}
 */
export function getTopicsForRole(roleId) {
  const ids = ROLE_TOPICS[roleId] || [];
  return ids.map((id) => CURRICULUM_TOPICS[id]).filter(Boolean);
}

/**
 * Returns a specific topic by its ID.
 * @param {string} topicId
 * @returns {object | null}
 */
export function getTopicById(topicId) {
  return CURRICULUM_TOPICS[topicId] || null;
}

/**
 * Checks whether all prerequisites for a given topic have been satisfied.
 * @param {string} topicId
 * @param {Set<string> | Record<string, boolean>} completedIds
 * @returns {boolean}
 */
export function arePrerequisitesMet(topicId, completedIds) {
  const topic = CURRICULUM_TOPICS[topicId];
  if (!topic || !topic.prerequisites || topic.prerequisites.length === 0) return true;

  const isCompleted = (id) =>
    completedIds instanceof Set ? completedIds.has(id) : Boolean(completedIds[id]);

  return topic.prerequisites.every(isCompleted);
}
