// ===================================================
// PATH FORGE - AI SERVICE
// Adaptive routing for goal analysis, lessons, 5-MCQ evaluations & pre-generation
// ===================================================

import { defaultGeminiProvider } from "./providers/geminiProvider.js";
import { getTopicById } from "../../data/curriculum.js";
import { evaluateInitialSkills } from "../learning/assessmentEngine.js";
import { getDifficultyDistribution } from "./prompts/questionPrompt.js";
import { databaseService } from "../database/databaseService.js";

class AIService {
  constructor(provider = defaultGeminiProvider) {
    this.provider = provider;
  }

  /**
   * Analyzes user goal, resume, and job description to identify skill gaps.
   * @param {object} goalData
   * @returns {Promise<object>}
   */
  async analyzeGoal(goalData) {
    try {
      let adminTopics = [];
      try {
        adminTopics = await databaseService.getPublishedCurriculumTopics();
      } catch (e) {
        // Fallback to empty if offline
      }

      const payload = {
        ...goalData,
        adminTopics
      };

      const response = await this.provider.callEndpoint("/api/analyzeGoal", payload);
      if (response && response.analysis) {
        return response.analysis;
      }
    } catch (err) {
      console.warn("AI Goal Analysis endpoint unavailable, applying deterministic fallback:", err.message);
    }

    // High-quality deterministic fallback
    const targetRole = goalData.targetPosition || "Software Engineer";
    const baseSkills = [
      "Core Foundations",
      "System Architecture",
      "Testing & Debugging",
      "API Design",
      "Version Control",
      "Performance Optimization"
    ];

    const evalResult = evaluateInitialSkills({
      requiredSkills: baseSkills,
      resumeText: goalData.resumeText || "",
      jobDescription: goalData.jobDescription || ""
    });

    return {
      targetRole,
      targetCompany: goalData.targetCompany || "Industry Standard",
      requiredSkills: baseSkills,
      currentSkills: evalResult.detectedSkills,
      skillGaps: evalResult.missingSkills,
      strengths: evalResult.detectedSkills.length > 0 ? evalResult.detectedSkills : ["Commitment to learning"],
      weaknesses: evalResult.missingSkills,
      prioritySkills: evalResult.missingSkills.slice(0, 3),
      estimatedReadiness: evalResult.detectedSkills.length * 15 + 20,
      recommendedProjects: [
        `Production-ready ${targetRole} Capstone Portfolio App`,
        `End-to-end Automated Testing Pipeline`
      ],
      interviewTopics: [
        "Core Architectural Tradeoffs",
        "Problem-solving & Edge Cases",
        "Real-world System Resiliency"
      ]
    };
  }

  /**
   * Generates a structured, adaptive topic lesson adhering strictly to Schema V2.
   *
   * @param {string} topicId
   * @param {object} [context={}]
   * @param {number} [context.userMastery=30]
   * @param {string} [context.targetRole="Software Engineer"]
   * @param {string} [context.targetCompany=""]
   * @param {object} [context.previousPerformance=null]
   * @param {object} [context.adaptationContext=null]
   * @param {number} [context.dailyMinutes=45]
   * @param {string} [context.jobRequirements=""]
   * @returns {Promise<object>}
   */
  async generateLesson(topicId, context = {}) {
    const topic = getTopicById(topicId);
    const fallbackTitle = topic ? topic.title : "Core Career Concept";
    const userMastery = typeof context === "number" ? context : (context.userMastery || 30);
    const targetRole = context.targetRole || "Software Engineer";

    const payload = {
      topicId,
      topicTitle: fallbackTitle,
      topicDescription: topic?.summary || "",
      prerequisites: topic?.prerequisites || [],
      concepts: topic?.concepts || [],
      targetRole,
      targetCompany: context.targetCompany || "",
      userMastery,
      previousPerformance: context.previousPerformance || null,
      adaptationContext: context.adaptationContext || null,
      dailyMinutes: context.dailyMinutes || topic?.estimatedMinutes || 45,
      difficulty: topic?.difficulty || (userMastery >= 75 ? "hard" : userMastery >= 45 ? "medium" : "easy"),
      jobRequirements: context.jobRequirements || ""
    };

    // Priority 1: Check for published Admin CMS module notes to teach directly from admin content
    try {
      const adminModules = await databaseService.getAdminModules(topicId);
      const activeMod = adminModules.find((m) => m.status === "published") || adminModules[0];
      if (activeMod && (activeMod.publishedBlocks?.length > 0 || activeMod.draftBlocks?.length > 0)) {
        const blocks = activeMod.publishedBlocks?.length > 0 ? activeMod.publishedBlocks : activeMod.draftBlocks;
        const sections = blocks.map((b) => {
          const heading = b.data?.heading || b.data?.title || (b.type ? b.type.toUpperCase() : "Section");
          const content = b.data?.content || b.data?.text || b.data?.code || (typeof b.data === "string" ? b.data : JSON.stringify(b.data || {}));
          const examples = Array.isArray(b.data?.examples) ? b.data.examples : (b.data?.code ? [b.data.code] : []);
          return { heading, content, examples };
        });

        return {
          topic: fallbackTitle,
          title: activeMod.title || `Mastering ${fallbackTitle}`,
          estimatedMinutes: activeMod.estimatedMinutes || 30,
          objective: activeMod.description || `Study admin notes for ${fallbackTitle}.`,
          sections: sections.length > 0 ? sections : [{ heading: "Overview", content: activeMod.description || "Admin notes content", examples: [] }],
          keyPoints: [activeMod.title, "Admin Portal Notes", "Core Concept"],
          commonMistakes: ["Skipping core notes principles", "Neglecting edge case constraints"],
          practicalExample: {
            description: `Admin Module Practical Notes for ${activeMod.title}`,
            code: blocks.find((b) => b.type === "code")?.data?.code || `// ${activeMod.title} Notes Demonstration\nconsole.log("Teaching from Admin Notes");`,
            language: "javascript"
          },
          interviewPoints: [
            `Explain the architectural concepts outlined in ${activeMod.title}.`,
            `How does ${activeMod.title} apply in production environments?`
          ]
        };
      }
    } catch (cmsErr) {
      console.warn("Could not load published admin module for lesson:", cmsErr.message);
    }

    try {
      const response = await this.provider.callEndpoint("/api/generateLesson", payload);
      if (response && response.lesson) {
        return response.lesson;
      }
    } catch (err) {
      console.warn("AI Lesson Generation endpoint unavailable, using structured fallback:", err.message);
    }

    // High quality deterministic fallback matching Schema V2
    const weakConcepts = context.adaptationContext?.weakConcepts || context.previousPerformance?.weakConcepts || [];
    const hasWeakReview = weakConcepts.length > 0;

    const sections = [
      {
        heading: `Foundations of ${fallbackTitle}`,
        content: topic
          ? `${topic.summary}\n\nIn professional ${targetRole} workflows, mastering ${fallbackTitle} allows engineers to write scalable, robust code while avoiding recurring design anti-patterns.`
          : `Core principles and architecture of ${fallbackTitle}.`,
        examples: [
          `Baseline usage: Standard declarative implementation of ${topic?.concepts?.[0] || fallbackTitle}.`,
          `Edge Case: Handling missing parameters and defensive error boundaries.`
        ]
      },
      {
        heading: `Practical Mechanics & Edge Cases`,
        content: `When deploying ${fallbackTitle} in production, consideration of time complexity, memory allocation, and concurrency becomes paramount. Understanding when to favor this abstraction over alternatives separates senior practitioners from novices.`,
        examples: [
          `Optimized execution: Leveraging cached lookups and minimizing unnecessary re-computations.`
        ]
      }
    ];

    if (hasWeakReview) {
      sections.unshift({
        heading: `Prerequisite Refresher: Addressing ${weakConcepts.join(", ")}`,
        content: `Before diving into ${fallbackTitle}, recall the key mechanisms of ${weakConcepts.join(", ")}. In particular, pay attention to boundary conditions and state propagation, as these directly influence how ${fallbackTitle} behaves in real systems.`,
        examples: [
          `Reinforcement Note: Always verify edge cases for ${weakConcepts[0] || "foundations"} before invoking dependent pipelines.`
        ]
      });
    }

    return {
      topic: fallbackTitle,
      title: `Mastering ${fallbackTitle}`,
      estimatedMinutes: topic?.estimatedMinutes || 30,
      objective: `Understand the internal mechanics and production applications of ${fallbackTitle} for ${targetRole}.`,
      sections,
      keyPoints: topic?.concepts?.length ? topic.concepts : [
        "Consistent separation of concerns",
        "Predictable input/output boundaries",
        "Deterministic error handling"
      ],
      commonMistakes: [
        `Neglecting boundary conditions when processing unexpected payloads.`,
        `Over-engineering solutions before the access patterns justify the complexity.`
      ],
      practicalExample: {
        description: `Production implementation of ${fallbackTitle} within a real-world ${targetRole} service.`,
        code: `// Practical ${fallbackTitle} Demonstration\nfunction execute${fallbackTitle.replace(/[^a-zA-Z0-9]/g, "")}(input) {\n  if (!input) throw new Error("Invalid payload: input required");\n  // Process core logic safely\n  const result = { processed: true, timestamp: Date.now() };\n  return result;\n}`,
        language: "javascript"
      },
      interviewPoints: [
        `How does ${fallbackTitle} scale under high-concurrency or high-memory load?`,
        `Describe a scenario where choosing ${fallbackTitle} creates undesirable architectural tradeoffs.`
      ]
    };
  }

  /**
   * Generates an assessment of exactly 3 MCQs specifically for a topic with anti-repeat protection.
   *
   * @param {string} topicId
   * @param {object} [context={}]
   * @param {string[]} [previousQuestionTexts=[]]
   * @returns {Promise<object>}
   */
  async generateQuestions(topicId, context = {}, previousQuestionTexts = []) {
    const cacheKey = `questions_${topicId}`;
    if (!this._inFlight) this._inFlight = new Map();
    if (this._inFlight.has(cacheKey)) {
      return this._inFlight.get(cacheKey);
    }

    const promise = (async () => {
      const topic = getTopicById(topicId);
      const fallbackTitle = topic ? topic.title : "Core Career Concept";
      const userMastery = typeof context === "number" ? context : (context.userMastery || 30);
      const concepts = topic?.concepts || [fallbackTitle];
      const targetRole = context.targetRole || "Software Engineer";

      const payload = {
        topicTitle: fallbackTitle,
        concepts,
        userMastery,
        previousQuestionTexts,
        targetRole,
        questionCount: 3,
        assessmentType: "topic"
      };

      try {
        const response = await this.provider.callEndpoint("/api/generateQuestions", payload);
        if (response && Array.isArray(response.questions) && response.questions.length === 3) {
          return response;
        }
      } catch (err) {
        console.warn("AI Generate Questions endpoint unavailable, using deterministic 3-MCQ generator:", err.message);
      }

      // Deterministic 3-MCQ generator tailored specifically to the topic
      const difficulties = getDifficultyDistribution(userMastery, 3);
      const assessmentId = `asm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      const prevSet = new Set((previousQuestionTexts || []).map((t) => t.toLowerCase().trim()));
      const variationSuffix = previousQuestionTexts.length > 0 ? ` (Scenario Variant ${previousQuestionTexts.length + 1})` : "";

      const rawQuestions = [
        {
          id: `q_${topicId}_1_${Date.now()}`,
          skill: concepts[0] || fallbackTitle,
          concept: `${concepts[0] || fallbackTitle} Fundamentals`,
          difficulty: difficulties[0],
          question: `In ${fallbackTitle}, what is the foundational principle for state and data management${variationSuffix}?`,
          options: [
            "Enforce explicit boundaries, immutable contracts, and validation at the boundary",
            "Store all state in mutable global variables for quick accessible lookup",
            "Suppress all runtime errors silently to avoid service restarts",
            "Execute operations sequentially on the main thread without timeouts"
          ],
          correctIndex: 0,
          explanation: "Explicit boundaries and validation ensure state transitions remain predictable and testable."
        },
        {
          id: `q_${topicId}_2_${Date.now()}`,
          skill: concepts[1] || concepts[0] || fallbackTitle,
          concept: `${concepts[1] || concepts[0] || fallbackTitle} Execution`,
          difficulty: difficulties[1],
          question: `When implementing ${fallbackTitle} in production, which condition most commonly introduces edge-case failure?`,
          options: [
            "Unchecked null/undefined payloads across asynchronous boundaries",
            "Writing unit tests that assert deterministic outputs",
            "Applying standard modular design patterns",
            "Documenting interface parameters and return types"
          ],
          correctIndex: 0,
          explanation: "Unchecked payload boundaries lead to unexpected null-pointer or undefined reference exceptions."
        },
        {
          id: `q_${topicId}_3_${Date.now()}`,
          skill: concepts[0] || fallbackTitle,
          concept: `${concepts[0] || fallbackTitle} Optimization`,
          difficulty: difficulties[2],
          question: `Which architectural strategy maximizes performance and maintainability when structuring ${fallbackTitle}?`,
          options: [
            "Decouple business logic from side effects and cache idempotent calculations",
            "Couple UI presentation directly into raw database persistence calls",
            "Disable all caching layers to ensure every operation hits disk",
            "Hardcode configuration parameters throughout source files"
          ],
          correctIndex: 0,
          explanation: "Decoupling side effects and caching idempotent computations drastically improves throughput and testing."
        }
      ];

      const distinctQuestions = rawQuestions.map((q, idx) => {
        if (prevSet.has(q.question.toLowerCase().trim())) {
          return {
            ...q,
            question: `${q.question} (Advanced Variation #${idx + 2})`
          };
        }
        return q;
      });

      return {
        assessmentId,
        assessmentType: "topic",
        topic: fallbackTitle,
        questionCount: 3,
        questions: distinctQuestions
      };
    })();

    this._inFlight.set(cacheKey, promise);
    try {
      return await promise;
    } finally {
      this._inFlight.delete(cacheKey);
    }
  }

  /**
   * Generates a 5-6 question Cumulative Assessment covering the preceding 4 topics.
   *
   * @param {string[]} coveredTopicIds
   * @param {object} [context={}]
   * @param {string[]} [previousQuestionTexts=[]]
   * @returns {Promise<object>}
   */
  async generateCumulativeQuestions(coveredTopicIds = [], context = {}, previousQuestionTexts = []) {
    const coveredTopicObjects = coveredTopicIds.map((id) => getTopicById(id)).filter(Boolean);
    const coveredTitles = coveredTopicObjects.map((t) => t.title);
    const userMastery = typeof context === "number" ? context : (context.userMastery || 40);
    const targetRole = context.targetRole || "Software Engineer";

    const payload = {
      topicTitle: `Cumulative Milestone (${coveredTitles.join(", ")})`,
      coveredTopics: coveredTitles,
      userMastery,
      previousQuestionTexts,
      targetRole,
      questionCount: 5,
      assessmentType: "cumulative"
    };

    try {
      const response = await this.provider.callEndpoint("/api/generateQuestions", payload);
      if (response && Array.isArray(response.questions) && response.questions.length >= 5) {
        return response;
      }
    } catch (err) {
      console.warn("AI Cumulative Questions endpoint unavailable, using deterministic 5-question generator:", err.message);
    }

    const difficulties = getDifficultyDistribution(userMastery, 5);
    const assessmentId = `cum_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const questions = [
      {
        id: `q_cum_1_${Date.now()}`,
        skill: coveredTitles[0] || "Foundations",
        concept: `${coveredTitles[0] || "Foundations"} Retention`,
        difficulty: difficulties[0],
        question: `Reflecting on ${coveredTitles[0] || "Topic 1"}, what is the primary operational constraint when scaling?`,
        options: [
          "Preserving strict data contracts and explicit interface boundaries",
          "Hardcoding execution pathways for maximum raw throughput",
          "Bypassing validation checks in production environments",
          "Merging all logic into a monolithic script without modules"
        ],
        correctIndex: 0,
        explanation: "Preserving data contracts prevents regression across integrated modules."
      },
      {
        id: `q_cum_2_${Date.now()}`,
        skill: coveredTitles[1] || "Core Mechanics",
        concept: `${coveredTitles[1] || "Core Mechanics"} Retention`,
        difficulty: difficulties[1],
        question: `In ${coveredTitles[1] || "Topic 2"}, how do asynchronous operations propagate state changes to consumers?`,
        options: [
          "Through deterministic events and promise resolutions",
          "By blocking the event loop until processing finishes",
          "Via unbounded global variables polled periodically",
          "Through silent failure modes without error propagation"
        ],
        correctIndex: 0,
        explanation: "Deterministic promises and events provide safe asynchronous state propagation."
      },
      {
        id: `q_cum_3_${Date.now()}`,
        skill: coveredTitles[2] || "Advanced Application",
        concept: `${coveredTitles[2] || "Advanced Application"} Retention`,
        difficulty: difficulties[2],
        question: `When structuring ${coveredTitles[2] || "Topic 3"}, how should component state be isolated to prevent side effects?`,
        options: [
          "Encapsulate state within dedicated handlers and emit pure outputs",
          "Directly mutate parent state from arbitrary child components",
          "Rely on implicit window properties for inter-component coordination",
          "Disable all lifecycle cleanup hooks"
        ],
        correctIndex: 0,
        explanation: "Encapsulation prevents unexpected cross-module side effects."
      },
      {
        id: `q_cum_4_${Date.now()}`,
        skill: coveredTitles[3] || "Architecture",
        concept: `${coveredTitles[3] || "Architecture"} Retention`,
        difficulty: difficulties[3],
        question: `In ${coveredTitles[3] || "Topic 4"}, what is the recommended pattern to prevent cascading network failures?`,
        options: [
          "Deploy circuit breakers and exponential backoff strategies",
          "Repeat failing network requests in an immediate tight loop",
          "Crash the server whenever an endpoint returns 500",
          "Drop all incoming user requests during peak hours"
        ],
        correctIndex: 0,
        explanation: "Circuit breakers protect downstream services from cascading collapse."
      },
      {
        id: `q_cum_5_${Date.now()}`,
        skill: "Cross-Topic Synthesis",
        concept: "Integrated Architecture",
        difficulty: difficulties[4],
        question: `Across all four covered topics, when combining ${coveredTitles[0] || "Foundations"} with ${coveredTitles[3] || "Architecture"}, which architectural quality attribute is most critical?`,
        options: [
          "Loose coupling with high cohesion between independent subsystem layers",
          "Coupling all logic tightly into a single global namespace",
          "Ignoring backwards compatibility when upgrading interfaces",
          "Allowing arbitrary unstructured payloads between service layers"
        ],
        correctIndex: 0,
        explanation: "Loose coupling with high cohesion enables scalable, maintainable architectures."
      }
    ];

    return {
      assessmentId,
      assessmentType: "cumulative",
      coveredTopics: coveredTitles,
      questionCount: 5,
      questions
    };
  }

  /**
   * Evaluates submitted answers (3-question topic or 5-6 question cumulative) and provides analysis.
   *
   * @param {object} params
   * @param {string} params.topicTitle
   * @param {object[]} params.questions
   * @param {Array<{ questionId: string, selectedIndex: number }>} params.userAnswers
   * @param {string} [params.targetRole="Software Engineer"]
   * @param {string} [params.nextTopicTitle=""]
   * @param {"topic" | "cumulative"} [params.assessmentType="topic"]
   * @param {string[]} [params.coveredTopics=[]]
   * @returns {Promise<object>}
   */
  async evaluateAssessment({
    topicTitle,
    questions,
    userAnswers,
    targetRole = "Software Engineer",
    nextTopicTitle = "",
    assessmentType = "topic",
    coveredTopics = []
  }) {
    try {
      const response = await this.provider.callEndpoint("/api/analyzeAssessment", {
        topicTitle,
        questions,
        userAnswers,
        targetRole,
        nextTopicTitle,
        assessmentType,
        coveredTopics
      });
      if (response && (typeof response.score === "number" || typeof response.correctCount === "number")) {
        return response;
      }
    } catch (err) {
      console.warn("AI Assessment Evaluation endpoint unavailable, performing local deterministic scoring:", err.message);
    }

    // High quality deterministic fallback
    let correctCount = 0;
    const answeredDetails = questions.map((q, idx) => {
      const userAns = userAnswers.find((a) => a.questionId === q.id) || userAnswers[idx];
      const selectedIndex = userAns?.selectedIndex !== undefined ? userAns.selectedIndex : (userAns?.selectedOption ?? -1);
      const isCorrect = selectedIndex === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        concept: q.concept || q.skill || topicTitle,
        skill: q.skill || topicTitle,
        difficulty: q.difficulty || "medium",
        selectedIndex,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation
      };
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 10000) / 100;
    const weakConcepts = [];
    const masteredConcepts = [];

    answeredDetails.forEach((a) => {
      if (a.isCorrect) {
        if (!masteredConcepts.includes(a.concept)) masteredConcepts.push(a.concept);
      } else {
        if (!weakConcepts.includes(a.concept)) weakConcepts.push(a.concept);
      }
    });

    let qualitative = "Strong understanding";
    if (totalQuestions === 3) {
      if (correctCount === 3) qualitative = "Strong understanding (100%)";
      else if (correctCount === 2) qualitative = "Partial understanding (66.67%)";
      else if (correctCount === 1) qualitative = "Weak understanding (33.33%)";
      else qualitative = "Critical gap (0%)";
    } else {
      qualitative = percentage >= 80 ? "Strong retention across topics" : percentage >= 60 ? "Partial retention" : "Low retention";
    }

    return {
      assessmentType,
      correctCount,
      score: correctCount,
      totalQuestions,
      total: totalQuestions,
      percentage,
      submittedAt: new Date().toISOString(),
      answeredDetails,
      difficultyStats: {},
      analysis: {
        summary: `${correctCount}/${totalQuestions} — ${qualitative}`,
        masteredConcepts,
        weakConcepts,
        misconceptionAnalysis: weakConcepts.length > 0
          ? `Identified conceptual gaps in: ${weakConcepts.join(", ")}.`
          : "Solid conceptual grasp. No recurring anti-patterns detected.",
        adaptationAdvice: weakConcepts.length > 0
          ? `Future odd/even lane topics and prerequisite chains have been adapted to reinforce: ${weakConcepts.join(", ")}.`
          : "Advancing learning pathway at accelerated pacing.",
        recommendedNextDifficulty: percentage >= 75 ? "hard" : percentage >= 50 ? "medium" : "easy"
      }
    };
  }

  /**
   * Pre-generates Topic N+1 content in the background without blocking the UI.
   *
   * @param {string} nextTopicId
   * @param {object} context
   * @returns {Promise<object>}
   */
  async prepareNextTopic(nextTopicId, context = {}) {
    if (!nextTopicId) return null;
    return this.generateLesson(nextTopicId, context);
  }

  /**
   * Evaluates a single answer (legacy support).
   */
  async evaluateAnswer(params) {
    try {
      const response = await this.provider.callEndpoint("/api/evaluateAnswer", params);
      if (response && response.evaluation) {
        return response.evaluation;
      }
    } catch (err) {
      console.warn("AI Evaluate Answer endpoint unavailable, applying local evaluation:", err.message);
    }

    return {
      isCorrect: params.isCorrect,
      explanation: params.isCorrect
        ? "Excellent reasoning! Your answer directly satisfies the core architectural requirement."
        : `Not quite. ${params.explanation || "Review the key concept carefully and observe how the components interact."}`
    };
  }

  /**
   * Generates persistent study notes for a completed lesson.
   */
  async generateNotes(lessonContent) {
    try {
      const response = await this.provider.callEndpoint("/api/generateNotes", { lessonContent });
      if (response && response.notes) {
        return response.notes;
      }
    } catch (err) {
      console.warn("AI Notes endpoint unavailable, compiling structured local notes:", err.message);
    }

    return {
      title: lessonContent.title || "Study Notes",
      summary: lessonContent.objective || lessonContent.sections?.[0]?.content?.slice(0, 150),
      keyConcepts: lessonContent.keyPoints || [],
      definitions: [
        { term: "Core Pattern", definition: "A battle-tested solution to a recurring design problem." }
      ],
      examples: lessonContent.sections?.flatMap((s) => s.examples || []) || [],
      commonMistakes: lessonContent.commonMistakes || [],
      interviewPoints: lessonContent.interviewPoints || [
        `Be prepared to explain the tradeoffs of ${lessonContent.title}.`
      ]
    };
  }

  /**
   * Legacy AI Career Advisor chat prompt interface.
   */
  async askCareerAdvisor(userPrompt) {
    const response = await this.provider.callEndpoint("/api/generate", { userPrompt });
    return response.result || "No response generated.";
  }
}

export const aiService = new AIService();
