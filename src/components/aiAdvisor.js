// ===================================================
// PATH FORGE - AI ADVISOR COMPONENT
// Modal dialog shell and submission handling for AI advisory
// ===================================================

import { $, $$, on, refreshLucide } from "../utils/dom.js";
import { askCareerAdvisor } from "../services/aiService.js";

/**
 * Initializes the AI Advisor modal controls and event listeners.
 */
export function initAiAdvisor() {
  const aiModal = $("#ai-modal");
  const closeAiBtn = $("#close-ai-modal");
  const aiForm = $("#ai-form");
  const aiInput = $("#ai-user-input");
  const aiResponseBox = $("#ai-response-box");
  const aiSubmitBtn = $("#ai-submit-btn");

  // Open triggers
  $$('[data-action="open-ai"]').forEach((btn) => {
    on(btn, "click", openAIAdvisor);
  });

  // Close triggers
  if (closeAiBtn) {
    on(closeAiBtn, "click", closeAIAdvisor);
  }

  if (aiModal) {
    on(aiModal, "click", (e) => {
      if (e.target === aiModal) {
        closeAIAdvisor();
      }
    });
  }

  // Handle AI Form Submission
  if (aiForm && aiInput && aiResponseBox && aiSubmitBtn) {
    aiForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userPrompt = aiInput.value.trim();
      if (!userPrompt) return;

      // Show Loading State
      aiResponseBox.innerHTML = `
        <div class="flex items-center gap-2 text-indigo-400 font-medium">
          <i data-lucide="sparkles" class="w-4 h-4 animate-spin"></i>
          <span>Path Forge AI is thinking...</span>
        </div>
      `;
      aiSubmitBtn.disabled = true;
      refreshLucide();

      try {
        const adviceHtml = await askCareerAdvisor(userPrompt);
        aiResponseBox.innerHTML = adviceHtml;
      } catch (err) {
        aiResponseBox.innerHTML = `<span class="text-red-400 font-semibold">Error: ${err.message || "Failed to reach AI Advisor"}</span>`;
      } finally {
        aiSubmitBtn.disabled = false;
        aiInput.value = "";
        refreshLucide();
      }
    });
  }
}

/**
 * Opens the AI Advisor modal dialog.
 */
export function openAIAdvisor() {
  const aiModal = $("#ai-modal");
  if (aiModal) {
    aiModal.classList.remove("opacity-0", "pointer-events-none");
  }
}

/**
 * Closes the AI Advisor modal dialog.
 */
export function closeAIAdvisor() {
  const aiModal = $("#ai-modal");
  if (aiModal) {
    aiModal.classList.add("opacity-0", "pointer-events-none");
  }
}
