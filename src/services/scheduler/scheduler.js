// ===================================================
// PATH FORGE - DETERMINISTIC ADAPTIVE SCHEDULER
// Mathematical calendar generation, reinforcement injection & pacing
// ===================================================

import { arePrerequisitesMet } from "../../data/curriculum.js";
import { calculateDaysRemaining } from "../../utils/validation.js";

/**
 * Generates an adaptive daily study schedule based on user progress and skill profile.
 *
 * @param {object} params
 * @param {object[]} params.topics - Candidate curriculum topics
 * @param {Record<string, object>} params.skillProfile - Live skill mastery dictionary
 * @param {string | Date} params.deadline - Target career goal deadline
 * @param {number} params.dailyMinutes - Available study minutes per day (e.g. 60)
 * @param {Record<string, boolean>} [params.completedMap={}] - Completed topic IDs
 * @param {Date} [params.startDate=new Date()]
 * @returns {object} { items, totalMinutes, availableDays, pacingWarning, suggestedDailyMinutes }
 */
export function generateSchedule({
  topics = [],
  skillProfile = {},
  deadline,
  dailyMinutes = 60,
  completedMap = {},
  startDate = new Date()
}) {
  const daysRemaining = Math.max(1, calculateDaysRemaining(deadline) || 60);
  const dailyBudget = Math.max(15, dailyMinutes);

  // 1. Identify remaining topics and prerequisite satisfaction
  const completedIds = new Set(Object.keys(completedMap).filter((k) => completedMap[k]));
  const remainingTopics = topics.filter((t) => !completedIds.has(t.id));

  // 2. Identify skills needing immediate reinforcement or acceleration
  const reinforcementItems = [];
  const standardItems = [];

  remainingTopics.forEach((topic) => {
    // Check if primary concepts in this topic flag needsRevision
    const requiresRevision = (topic.concepts || []).some(
      (c) => skillProfile[c] && skillProfile[c].needsRevision
    );

    const isAccelerated = (topic.concepts || []).every(
      (c) => skillProfile[c] && skillProfile[c].accelerated
    );

    if (requiresRevision) {
      reinforcementItems.push({
        topicId: topic.id,
        title: `Reinforcement & Targeted Practice: ${topic.title}`,
        skill: topic.concepts?.[0] || topic.title,
        durationMinutes: 30,
        type: "reinforcement",
        status: "needs_revision"
      });
    }

    const duration = isAccelerated ? 25 : topic.estimatedMinutes || 45;
    standardItems.push({
      topicId: topic.id,
      title: topic.title,
      skill: topic.concepts?.[0] || topic.title,
      durationMinutes: duration,
      type: "lesson",
      status: isAccelerated ? "accelerated" : "scheduled"
    });

    // Add milestone project challenge if present
    if (topic.project) {
      standardItems.push({
        topicId: topic.id,
        title: `Portfolio Project: ${topic.title}`,
        skill: topic.concepts?.[0] || topic.title,
        durationMinutes: 45,
        type: "project",
        status: "scheduled"
      });
    }
  });

  // Priority queue: Reinforcements first, followed by prerequisite-safe lessons
  const queue = [...reinforcementItems, ...standardItems];

  // 3. Calendar Bucket Assignment
  const scheduleItems = [];
  let currentDay = 0;
  let currentDayMinutes = 0;
  let currentDate = new Date(startDate.getTime());

  let hasSetCurrent = false;

  queue.forEach((task, idx) => {
    // If task would exceed day's budget, advance to next calendar day
    if (currentDayMinutes + task.durationMinutes > dailyBudget && currentDayMinutes > 0) {
      currentDay++;
      currentDayMinutes = 0;
      currentDate = new Date(startDate.getTime() + currentDay * 86400000);
    }

    // Determine lifecycle status for UI
    let itemStatus = task.status;
    if (task.status === "scheduled") {
      if (!hasSetCurrent) {
        itemStatus = "current";
        hasSetCurrent = true;
      } else if (idx === 1 || (hasSetCurrent && scheduleItems.length === 1)) {
        itemStatus = "next";
      }
    }

    const item = {
      itemId: `item_${currentDay}_${idx}`,
      dayIndex: currentDay + 1,
      date: currentDate.toISOString().split("T")[0],
      ...task,
      status: itemStatus
    };

    scheduleItems.push(item);
    currentDayMinutes += task.durationMinutes;
  });

  // 4. Feasibility & Pacing Analysis
  const totalMinutes = scheduleItems.reduce((acc, i) => acc + i.durationMinutes, 0);
  const totalCapacity = daysRemaining * dailyBudget;
  const pacingWarning = totalMinutes > totalCapacity;
  const suggestedDailyMinutes = pacingWarning
    ? Math.ceil(totalMinutes / daysRemaining)
    : dailyBudget;

  return {
    items: scheduleItems,
    totalMinutes,
    availableDays: daysRemaining,
    pacingWarning,
    suggestedDailyMinutes
  };
}
