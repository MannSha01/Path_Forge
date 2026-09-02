// ===================================================
// PATH FORGE - PROFILE COMPONENT
// User account details, session overview & reset preferences
// ===================================================

import { $, on, refreshLucide } from "../../utils/dom.js";
import { extractNameFromEmail } from "../../services/auth/authService.js";

export function initProfileModal({ onResetData }) {
  const modal = $("#profile-modal");
  const closeBtn = $("#close-profile-modal");
  const resetBtn = $("#profile-reset-data-btn");

  if (closeBtn) {
    on(closeBtn, "click", closeProfileModal);
  }

  if (modal) {
    on(modal, "click", (e) => {
      if (e.target === modal) closeProfileModal();
    });
  }

  if (resetBtn) {
    on(resetBtn, "click", () => {
      if (confirm("Are you sure you want to reset all goals, skill progress, and scheduled plans?")) {
        if (onResetData) onResetData();
        closeProfileModal();
      }
    });
  }
}

export function openProfileModal(user, goal, skillCount = 0) {
  const modal = $("#profile-modal");
  if (!modal) return;

  const nameEl = $("#profile-modal-name");
  const emailEl = $("#profile-modal-email");
  const targetEl = $("#profile-modal-target");
  const skillsCountEl = $("#profile-modal-skills");

  const displayName = user?.displayName || extractNameFromEmail(user?.email);

  if (nameEl) nameEl.textContent = displayName;
  if (emailEl) emailEl.textContent = user?.email || "candidate@pathforge.dev";
  if (targetEl) targetEl.textContent = goal?.targetPosition || "No active goal set";
  if (skillsCountEl) skillsCountEl.textContent = `${skillCount} Tracked Skills`;

  modal.classList.remove("opacity-0", "pointer-events-none");
  refreshLucide();
}

export function closeProfileModal() {
  const modal = $("#profile-modal");
  if (modal) {
    modal.classList.add("opacity-0", "pointer-events-none");
  }
}
