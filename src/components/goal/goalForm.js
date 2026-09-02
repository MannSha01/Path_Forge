// ===================================================
// PATH FORGE - GOAL FORM COMPONENT
// Target position, company, JD, deadline, daily study time & resume
// ===================================================

import { $, on, refreshLucide } from "../../utils/dom.js";
import { validateGoalInput } from "../../utils/validation.js";

export function initGoalForm({ onGoalSubmit }) {
  const form = $("#goal-setup-form");
  const resumeFileInput = $("#goal-resume-file");
  const resumeTextArea = $("#goal-resume-text");
  const submitBtn = $("#goal-submit-btn");

  // Handle optional resume file upload text extraction
  if (resumeFileInput && resumeTextArea) {
    on(resumeFileInput, "change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        resumeTextArea.value = event.target?.result || "";
      };
      reader.readAsText(file);
    });
  }

  // Pre-fill default deadline (60 days out) if empty
  const deadlineInput = $("#goal-deadline");
  if (deadlineInput && !deadlineInput.value) {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 60);
    deadlineInput.value = defaultDate.toISOString().split("T")[0];
  }

  if (form) {
    on(form, "submit", async (e) => {
      e.preventDefault();

      const targetPosition = $("#goal-position")?.value?.trim();
      const targetCompany = $("#goal-company")?.value?.trim() || "Industry Standard";
      const jobDescription = $("#goal-job-description")?.value?.trim();
      const jobUrl = $("#goal-job-url")?.value?.trim();
      const deadline = $("#goal-deadline")?.value;
      const dailyMinutes = parseInt($("#goal-daily-minutes")?.value, 10) || 60;
      const resumeText = $("#goal-resume-text")?.value?.trim();

      const payload = {
        targetPosition,
        targetCompany,
        jobDescription,
        jobUrl,
        deadline,
        dailyMinutes,
        resumeText
      };

      const validation = validateGoalInput(payload);
      if (!validation.valid) {
        alert("Please complete the required fields:\n• " + validation.errors.join("\n• "));
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <i data-lucide="sparkles" class="w-4 h-4 animate-spin text-indigo-400"></i>
          <span>Analyzing Goal & Skill Gaps...</span>
        `;
        refreshLucide();
      }

      try {
        if (onGoalSubmit) {
          await onGoalSubmit(payload);
        }
      } catch (err) {
        alert("Failed to analyze goal: " + err.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <i data-lucide="zap" class="w-4 h-4 text-white"></i>
            <span>Generate Adaptive Study Plan</span>
          `;
          refreshLucide();
        }
      }
    });
  }
}
