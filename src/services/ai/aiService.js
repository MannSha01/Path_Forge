// ===================================================
// PATH FORGE - AI SERVICE
// Task-based routing for goal analysis, lessons & evaluations
// ===================================================

import { defaultGeminiProvider } from "./providers/geminiProvider.js";
import { getTopicById } from "../../data/curriculum.js";
import { evaluateInitialSkills } from "../learning/assessmentEngine.js";

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
      const response = await this.provider.callEndpoint("/api/analyzeGoal", goalData);
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
   * Generates an interactive, structured lesson for a specific curriculum topic.
   * @param {string} topicId
   * @param {number} [userMastery=30]
   * @returns {Promise<object>}
   */
  async generateLesson(topicId, userMastery = 30) {
    const topic = getTopicById(topicId);
    const fallbackTitle = topic ? topic.title : "Core Career Concept";

    try {
      const response = await this.provider.callEndpoint("/api/generateLesson", {
        topicId,
        topicTitle: fallbackTitle,
        concepts: topic ? topic.concepts : [],
        userMastery
      });
      if (response && response.lesson) {
        return response.lesson;
      }
    } catch (err) {
      console.warn("AI Lesson Generation endpoint unavailable, using deterministic curriculum:", err.message);
    }

    // Deterministic fallback lesson
    return {
      title: fallbackTitle,
      objective: `Master the foundational and practical mechanics of ${fallbackTitle}.`,
      explanation: topic
        ? `${topic.summary}\n\nUnderstanding ${fallbackTitle} is critical for production workflows. You must recognize when and how to implement this pattern cleanly without introducing common performance or architectural anti-patterns.`
        : "Foundational conceptual review and implementation best practices.",
      examples: [
        `Standard Implementation: Using ${topic?.concepts?.[0] || "core syntax"} in a clean, reusable component.`,
        `Edge Case Handling: Guarding against asynchronous race conditions and memory leaks.`
      ],
      keyPoints: topic ? topic.concepts : ["Core syntax", "Best practices", "Efficiency"],
      commonMistakes: [
        "Neglecting boundary validation and error handling.",
        "Overcomplicating the architecture before requirements demand it."
      ],
      questions: [
        {
          id: `q_${topicId || "1"}_1`,
          skill: topic?.concepts?.[0] || fallbackTitle,
          topic: fallbackTitle,
          difficulty: userMastery >= 60 ? "medium" : "easy",
          question: `When building with ${fallbackTitle}, what is the recommended practice for maintainability?`,
          options: [
            "Keep logic modular, isolated, and covered with automated tests",
            "Bundle all states into a single global monolithic file",
            "Avoid writing comments, documentation, or typing",
            "Rely entirely on third-party opaque black-box libraries"
          ],
          correctIndex: 0,
          explanation: "Modular separation of concerns ensures that code remains testable, decoupled, and easy to refactor.",
          conceptTested: "Architectural Decoupling"
        }
      ]
    };
  }

  /**
   * Evaluates a user answer and provides targeted misconception feedback.
   * @param {object} params
   * @returns {Promise<object>}
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
   * @param {object} lessonContent
   * @returns {Promise<object>}
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
      summary: lessonContent.objective || lessonContent.explanation?.slice(0, 150),
      keyConcepts: lessonContent.keyPoints || [],
      definitions: [
        { term: "Core Pattern", definition: "A battle-tested solution to a recurring design problem." }
      ],
      examples: lessonContent.examples || [],
      commonMistakes: lessonContent.commonMistakes || [],
      interviewPoints: [
        `Be prepared to explain the tradeoffs of ${lessonContent.title}.`,
        "Highlight real-world scenarios where you applied this pattern."
      ]
    };
  }

  /**
   * Legacy AI Career Advisor prompt interface.
   * @param {string} userPrompt
   * @returns {Promise<string>}
   */
  async askCareerAdvisor(userPrompt) {
    const response = await this.provider.callEndpoint("/api/generate", { userPrompt });
    return response.result || "No response generated.";
  }
}

export const aiService = new AIService();
