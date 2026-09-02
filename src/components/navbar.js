// ===================================================
// PATH FORGE - NAVBAR COMPONENT
// Top bar navigation, back buttons, reset & credits modal
// ===================================================

import { $, on } from "../utils/dom.js";

/**
 * Initialize Navbar navigation controls and credits modal.
 *
 * @param {object} options
 * @param {() => void} options.onNavigateHome
 * @param {() => void} options.onNavigateBack
 * @param {() => void} options.onResetProgress
 */
export function initNavbar({ onNavigateHome, onNavigateBack, onResetProgress }) {
  const logoBtn = $("#logo-btn");
  const navBackBtn = $("#nav-back-btn");
  const resetBtn = $("#reset-btn");
  const creditsBtn = $("#trigger-credits-btn");
  const creditsModal = $("#credits-modal");
  const closeCreditsBtn = $("#close-credits-modal");

  on(logoBtn, "click", () => {
    if (onNavigateHome) onNavigateHome();
  });

  on(navBackBtn, "click", () => {
    if (onNavigateBack) onNavigateBack();
  });

  on(resetBtn, "click", () => {
    if (confirm("Reset completion status across all career pathways?")) {
      if (onResetProgress) onResetProgress();
    }
  });

  if (creditsBtn && creditsModal && closeCreditsBtn) {
    on(creditsBtn, "click", () => {
      creditsModal.classList.remove("opacity-0", "pointer-events-none");
    });

    on(closeCreditsBtn, "click", () => {
      creditsModal.classList.add("opacity-0", "pointer-events-none");
    });

    on(creditsModal, "click", (e) => {
      if (e.target === creditsModal) {
        creditsModal.classList.add("opacity-0", "pointer-events-none");
      }
    });
  }
}

/**
 * Update the Back button state in the navbar.
 * @param {boolean} visible
 * @param {string} [label="Back"]
 */
export function updateBackButton(visible, label = "Back") {
  const navBackBtn = $("#nav-back-btn");
  const backBtnText = $("#back-btn-text");

  if (!navBackBtn) return;

  if (visible) {
    navBackBtn.classList.remove("hidden");
    if (backBtnText) backBtnText.textContent = label;
  } else {
    navBackBtn.classList.add("hidden");
  }
}
