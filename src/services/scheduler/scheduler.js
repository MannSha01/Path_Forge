// ===================================================
// PATH FORGE - DETERMINISTIC ADAPTIVE SCHEDULER
// Alternating lane adaptation, distance decay, prerequisite overrides & cumulative checkpoints
// ===================================================

import { arePrerequisitesMet } from "../../data/curriculum.js";
import { calculateDaysRemaining } from "../../utils/validation.js";

/**
 * Computes alternating lane targets with distance decay and prerequisite overrides.
 *
 * @param {object} params
 * @param {number} params.sourceIndex - 0-indexed topic number in sequence
 * @param {string} params.sourceTopicId
 * @param {object[]} params.allTopics - Sequence of all topics in pathway
 * @param {boolean} params.isWeak
 * @param {string[]} [params.weakConcepts=[]]
 * @param {Record<string, object>} [params.skillProfile={}]
 * @returns {Array<{ targetTopicId: string, effectStrength: number, adaptationType: string, reason: string }>}
 */
export function calculateAlternatingLaneAdaptations({
  sourceIndex,
  sourceTopicId,
  allTopics = [],
  isWeak = false,
  weakConcepts = [],
  skillProfile = {}
}) {
  const adaptations = [];
  const sourceTopicNumber = sourceIndex + 1; // 1-based (Topic 1, 2, 3...)
  const isOddLane = sourceTopicNumber % 2 !== 0;

  allTopics.forEach((targetTopic, targetIdx) => {
    if (targetIdx <= sourceIndex) return; // Only future topics
    const targetTopicNumber = targetIdx + 1;
    const distance = targetTopicNumber - sourceTopicNumber;

    // 1. Direct & transitive prerequisite override (Prerequisites > Alternating Lanes)
    const isDirectPrereq = (targetTopic.prerequisites || []).includes(sourceTopicId);
    const sharesWeakConcepts = (targetTopic.concepts || []).some((c) => weakConcepts.includes(c));

    if (isWeak && (isDirectPrereq || sharesWeakConcepts)) {
      adaptations.push({
        targetTopicId: targetTopic.id,
        effectStrength: 1.0, // Maximum strength for prerequisite violations
        adaptationType: "prerequisite_override",
        reason: `Prerequisite Override: Topic ${targetTopicNumber} depends on concepts missed in Topic ${sourceTopicNumber} (${weakConcepts.join(", ")})`
      });
      return;
    }

    // 2. Alternating Lane Matching:
    // Topic 1 (odd) -> future odd: 3, 5, 7, 9...
    // Topic 2 (even) -> future even: 4, 6, 8, 10...
    const isTargetOdd = targetTopicNumber % 2 !== 0;
    const laneMatches = isOddLane === isTargetOdd;

    if (laneMatches && distance >= 2) {
      // Distance decay formula: decay = max(0.1, 1 / (distance / 2))
      const decay = Math.max(0.1, Number((1 / (distance / 2)).toFixed(2)));
      adaptations.push({
        targetTopicId: targetTopic.id,
        effectStrength: decay,
        adaptationType: "odd_even_lane",
        reason: isWeak
          ? `Reinforcement propagated along ${isOddLane ? "odd" : "even"} lane with distance decay (${Math.round(decay * 100)}% strength at distance +${distance})`
          : `Acceleration propagated along ${isOddLane ? "odd" : "even"} lane with distance decay (${Math.round(decay * 100)}% strength at distance +${distance})`
      });
    }
  });

  return adaptations;
}

/**
 * Generates an adaptive daily study schedule based on user progress, skill profile & adaptations.
 *
 * @param {object} params
 * @param {object[]} params.topics - Candidate curriculum topics
 * @param {Record<string, object>} params.skillProfile - Live skill mastery dictionary
 * @param {string | Date} params.deadline - Target career goal deadline
 * @param {number} params.dailyMinutes - Available study minutes per day (e.g. 60)
 * @param {Record<string, boolean>} [params.completedMap={}] - Completed topic IDs
 * @param {Array<object>} [params.adaptations=[]] - Active topic adaptations
 * @param {Date} [params.startDate=new Date()]
 * @returns {object} { items, totalMinutes, availableDays, pacingWarning, suggestedDailyMinutes }
 */
export function generateSchedule({
  topics = [],
  skillProfile = {},
  deadline,
  dailyMinutes = 60,
  completedMap = {},
  adaptations = [],
  startDate = new Date()
}) {
  const daysRemaining = Math.max(1, calculateDaysRemaining(deadline) || 60);
  const dailyBudget = Math.max(15, dailyMinutes);

  // 1. Identify remaining topics and prerequisite satisfaction
  const completedIds = new Set(Object.keys(completedMap).filter((k) => completedMap[k]));
  const completedCount = completedIds.size;
  const remainingTopics = topics.filter((t) => !completedIds.has(t.id));

  // Map adaptations by affected topic
  const adaptationMap = {};
  (adaptations || []).forEach((adp) => {
    const target = adp.targetTopicId || adp.affectedTopicId;
    if (target) {
      // If multiple adaptations exist for target, prerequisite_override takes precedence
      if (!adaptationMap[target] || adp.adaptationType === "prerequisite_override") {
        adaptationMap[target] = adp;
      }
    }
  });

  // 2. Identify skills needing immediate reinforcement or acceleration
  const reinforcementItems = [];
  const standardItems = [];

  remainingTopics.forEach((topic, idx) => {
    // Check if primary concepts in this topic flag needsRevision
    const requiresRevision =
      (topic.concepts || []).some((c) => skillProfile[c] && skillProfile[c].needsRevision) ||
      Boolean(skillProfile[topic.title]?.needsRevision) ||
      Boolean(skillProfile[topic.id]?.needsRevision);

    const isAccelerated =
      ((topic.concepts || []).length > 0 && (topic.concepts || []).every((c) => skillProfile[c] && skillProfile[c].accelerated)) ||
      Boolean(skillProfile[topic.title]?.accelerated) ||
      Boolean(skillProfile[topic.id]?.accelerated);

    const topicAdaptation = adaptationMap[topic.id];

    if (requiresRevision || topicAdaptation?.adaptationType === "prerequisite_override") {
      reinforcementItems.push({
        topicId: topic.id,
        title: `Reinforcement & Targeted Practice: ${topic.title}`,
        skill: topic.concepts?.[0] || topic.title,
        durationMinutes: 30,
        type: "reinforcement",
        status: "needs_revision",
        adapted: true,
        adaptationReason: topicAdaptation?.reason || "Reinforcement targeted to recently missed concepts."
      });
    }

    const duration = isAccelerated ? 25 : topic.estimatedMinutes || 45;
    let initialStatus = "scheduled";
    if (topicAdaptation) {
      initialStatus = "adapted";
    } else if (isAccelerated) {
      initialStatus = "accelerated";
    }

    standardItems.push({
      topicId: topic.id,
      title: topic.title,
      skill: topic.concepts?.[0] || topic.title,
      durationMinutes: duration,
      type: "lesson",
      status: initialStatus,
      adapted: Boolean(topicAdaptation),
      adaptationReason: topicAdaptation?.reason || (isAccelerated ? "Pacing accelerated due to strong mastery streak" : null)
    });

    // Checkpoint: Cumulative assessment after every 4 topics
    const totalCompletedPlusRemaining = completedCount + idx + 1;
    if (totalCompletedPlusRemaining % 4 === 0 && (idx + 1) <= remainingTopics.length) {
      const precedingTopics = topics.slice(Math.max(0, totalCompletedPlusRemaining - 4), totalCompletedPlusRemaining);
      standardItems.push({
        topicId: `cumulative_${totalCompletedPlusRemaining}`,
        title: `Cumulative Milestone Assessment (${precedingTopics.map((p) => p.title).join(", ")})`,
        skill: "Cumulative Synthesis",
        durationMinutes: 30,
        type: "cumulative_assessment",
        status: "scheduled",
        adapted: false,
        coveredTopicIds: precedingTopics.map((p) => p.id)
      });
    }

    // Add milestone project challenge if present
    if (topic.project) {
      standardItems.push({
        topicId: topic.id,
        title: `Portfolio Project: ${topic.title}`,
        skill: topic.concepts?.[0] || topic.title,
        durationMinutes: 45,
        type: "project",
        status: "scheduled",
        adapted: false
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
    if (currentDayMinutes + task.durationMinutes > dailyBudget && currentDayMinutes > 0) {
      currentDay++;
      currentDayMinutes = 0;
      currentDate = new Date(startDate.getTime() + currentDay * 86400000);
    }

    let itemStatus = task.status;
    if (task.status === "scheduled" || task.status === "adapted") {
      if (!hasSetCurrent) {
        itemStatus = "current";
        hasSetCurrent = true;
      } else if (idx === 1 || (hasSetCurrent && scheduleItems.length === 1)) {
        itemStatus = task.status === "adapted" ? "adapted" : "next";
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
