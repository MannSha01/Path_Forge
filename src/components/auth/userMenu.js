// ===================================================
// PATH FORGE - USER MENU COMPONENT
// Top bar user badge showing Name & Email ID, and sign-out action
// ===================================================

import { $, on, refreshLucide } from "../../utils/dom.js";
import { authService, extractNameFromEmail } from "../../services/auth/authService.js";

export function initUserMenu({ onSignOut, onOpenProfile }) {
  const container = $("#user-menu-container");
  const authTriggerBtn = $("#header-login-btn");
  const signOutBtn = $("#user-signout-btn");
  const profileTrigger = $("#user-profile-trigger");

  authService.onAuthStateChanged((user) => {
    if (!container) return;

    if (user) {
      if (authTriggerBtn) authTriggerBtn.classList.add("hidden");
      container.classList.remove("hidden");

      const avatar = $("#user-avatar-img");
      const nameEl = $("#user-name-display");
      const emailEl = $("#user-email-display");

      const displayName = user.displayName || extractNameFromEmail(user.email);

      if (avatar && user.photoURL) avatar.src = user.photoURL;
      if (nameEl) nameEl.textContent = displayName;
      if (emailEl) emailEl.textContent = user.email || "";
    } else {
      container.classList.add("hidden");
      if (authTriggerBtn) authTriggerBtn.classList.remove("hidden");
    }
    refreshLucide();
  });

  if (signOutBtn) {
    on(signOutBtn, "click", async () => {
      await authService.signOut();
      if (onSignOut) onSignOut();
    });
  }

  if (profileTrigger) {
    on(profileTrigger, "click", () => {
      if (onOpenProfile) onOpenProfile();
    });
  }
}
