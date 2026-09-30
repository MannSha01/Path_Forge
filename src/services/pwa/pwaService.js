// ===================================================
// PATH FORGE - PWA & OFFLINE MANAGER
// Handles Service Worker registration, install prompts & network status
// ===================================================

import { refreshLucide } from "../../utils/dom.js";

let deferredInstallPrompt = null;

/**
 * Initializes PWA features: Service Worker, Install Prompt, and Network Watcher.
 */
export function initPWA() {
  // 1. Register Service Worker in production / supported environments
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("[PWA] Service Worker registered successfully with scope:", registration.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    });
  }

  // 2. Native PWA Install Prompt Listener
  const installBtn = document.getElementById("pwa-install-btn");

  window.addEventListener("beforeinstallprompt", (event) => {
    // Prevent the default mini-infobar or banner from appearing immediately
    event.preventDefault();
    deferredInstallPrompt = event;

    if (installBtn) {
      installBtn.classList.remove("hidden");
      installBtn.classList.add("flex");
      refreshLucide();
    }
  });

  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;

      // Show the native install prompt
      deferredInstallPrompt.prompt();

      const { outcome } = await deferredInstallPrompt.userChoice;
      console.log(`[PWA] User response to install prompt: ${outcome}`);

      if (outcome === "accepted") {
        installBtn.classList.add("hidden");
        installBtn.classList.remove("flex");
      }

      deferredInstallPrompt = null;
    });
  }

  window.addEventListener("appinstalled", () => {
    console.log("[PWA] Path Forge application installed on device");
    if (installBtn) {
      installBtn.classList.add("hidden");
      installBtn.classList.remove("flex");
    }
  });

  // 3. Floating Network Status Indicator (Offline / Online Toast)
  setupNetworkWatcher();
}

/**
 * Creates floating pill for offline detection and reconnection feedback.
 */
function setupNetworkWatcher() {
  const pill = document.createElement("div");
  pill.id = "network-status-pill";
  pill.className =
    "fixed bottom-4 left-4 z-50 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl transition-all duration-300 pointer-events-none opacity-0 translate-y-3 flex items-center gap-2";
  document.body.appendChild(pill);

  function updateStatus(isOnline) {
    if (!isOnline) {
      pill.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <span>Offline Mode — Studying from cache</span>
      `;
      pill.className =
        "fixed bottom-4 left-4 z-50 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl transition-all duration-300 pointer-events-none bg-slate-900/95 text-amber-300 border border-amber-500/40 opacity-100 translate-y-0 flex items-center gap-2";
    } else {
      pill.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>Back Online</span>
      `;
      pill.className =
        "fixed bottom-4 left-4 z-50 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl transition-all duration-300 pointer-events-none bg-slate-900/95 text-emerald-300 border border-emerald-500/40 opacity-100 translate-y-0 flex items-center gap-2";

      setTimeout(() => {
        pill.classList.remove("opacity-100", "translate-y-0");
        pill.classList.add("opacity-0", "translate-y-3");
      }, 3000);
    }
  }

  window.addEventListener("offline", () => updateStatus(false));
  window.addEventListener("online", () => updateStatus(true));

  // Check initial state
  if (navigator.onLine === false) {
    updateStatus(false);
  }
}
