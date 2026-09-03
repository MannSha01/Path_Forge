// ===================================================
// PATH FORGE - AUTHENTICATION SERVICE
// Firebase Google Authentication
// Desktop: Popup (signInWithPopup)
// Mobile/iOS: Redirect (signInWithRedirect + getRedirectResult)
// Canonical Account Key: Firebase Auth UID
// ===================================================

import { databaseService } from "../database/databaseService.js";
import { LocalStorageService } from "../storage/localStorageService.js";

// ===================================================
// DYNAMIC FIREBASE SDK LOADER
// ===================================================

async function loadFirebaseSDK() {
  if (typeof window !== "undefined") {
    // Browser environment: Load CDN ES modules
    const appModule = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const authModule = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
    return { ...appModule, ...authModule };
  } else {
    // Node.js environment (Unit tests / SSR)
    try {
      const appModule = await import("firebase/app");
      const authModule = await import("firebase/auth");
      return { ...appModule, ...authModule };
    } catch (e) {
      return null;
    }
  }
}

// ===================================================
// HELPER: EXTRACT DISPLAY NAME FROM EMAIL
// ===================================================

export function extractNameFromEmail(email) {
  if (!email || typeof email !== "string") return "Candidate";

  const username = email.split("@")[0] || "";

  const cleaned = username
    .replace(/[._\-+]/g, " ")
    .replace(/([a-zA-Z])([0-9])/g, "$1 $2")
    .replace(/([0-9])([a-zA-Z])/g, "$1 $2")
    .trim();

  const formatted = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");

  return formatted || "Candidate";
}

// ===================================================
// DEVICE DETECTION: MOBILE & TABLET (iOS/iPad/Android)
// ===================================================

export function isMobileDevice() {
  if (typeof navigator === "undefined") return false;

  const userAgent = navigator.userAgent || navigator.vendor || window.opera || "";

  // 1. Check mobile user agent strings (iPhone, iPod, Android, BlackBerry, etc.)
  const isMobileUA = /android|iphone|ipad|ipod|mobile|silk|blackberry|iemobile|kindle/i.test(userAgent);

  // 2. Detect iPadOS 13+ which presents as MacIntel but has touch points
  const isIPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  // 3. Touch screen with mobile/tablet viewport width
  const isSmallTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)) &&
    window.innerWidth <= 1024;

  return isMobileUA || isIPadOS || Boolean(isSmallTouchDevice);
}

// ===================================================
// USER-FRIENDLY AUTH ERROR FORMATTER
// ===================================================

export function formatAuthError(err) {
  if (!err) return "An unknown error occurred during sign-in.";
  if (typeof err === "string") return err;

  const code = err.code || "";
  const hostname = typeof window !== "undefined" ? window.location.hostname : "this domain";

  switch (code) {
    case "auth/unauthorized-domain":
      return `Google Sign-In is not available on this domain (${hostname}). Please add this domain to Firebase Console → Authentication → Settings → Authorized Domains.`;

    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled in Firebase Console. Please enable Google under Authentication → Sign-in method.";

    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window. Please allow popups for this site or try again.";

    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before completing.";

    case "auth/cancelled-popup-request":
      return "Another sign-in request is already active.";

    case "auth/network-request-failed":
      return "Unable to connect to Google. Please check your internet connection and try again.";

    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email address using a different sign-in method.";

    case "auth/redirect-cancelled-by-user":
      return "Google sign-in was cancelled.";

    case "auth/invalid-api-key":
      return "Firebase configuration is invalid. Please check your environment variables.";

    case "auth/configuration-not-found":
      return "Firebase configuration not found. Check your environment variables.";

    case "auth/user-disabled":
      return "This user account has been disabled.";

    default:
      return err.message || "Google Sign-In was cancelled or failed.";
  }
}

// ===================================================
// AUTH SERVICE CLASS
// ===================================================

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.auth = null;
    this.provider = null;
    this.sdk = null;
    this.isInitialized = false;
    this.initPromise = null;

    // Start initialization lifecycle immediately
    this.initPromise = this.init();
  }

  // =================================================
  // FETCH PUBLIC FIREBASE CONFIG
  // =================================================

  async _fetchFirebaseConfig() {
    // 1. Check window globals (in case injected by SSR or hosting environment)
    if (typeof window !== "undefined" && window.__FIREBASE_CONFIG__) {
      return window.__FIREBASE_CONFIG__;
    }

    // 2. Fetch from serverless /api/authConfig
    try {
      const response = await fetch("/api/authConfig");
      if (!response.ok) {
        throw new Error(`Failed to load Firebase config: HTTP ${response.status}`);
      }
      const config = await response.json();

      if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
        throw new Error("Firebase configuration is incomplete. Check your environment variables.");
      }

      return config;
    } catch (err) {
      console.warn("Could not fetch /api/authConfig:", err.message);
      throw err;
    }
  }

  // =================================================
  // INITIALIZATION LIFECYCLE
  // =================================================

  async init() {
    if (this.isInitialized) return this.currentUser;

    try {
      this.sdk = await loadFirebaseSDK();
      if (!this.sdk) {
        throw new Error("Firebase SDK could not be loaded.");
      }

      const config = await this._fetchFirebaseConfig();

      const app = this.sdk.getApps().length === 0 ? this.sdk.initializeApp(config) : this.sdk.getApp();
      this.auth = this.sdk.getAuth(app);
      this.provider = new this.sdk.GoogleAuthProvider();

      // Always show Google's account selector
      this.provider.setCustomParameters({
        prompt: "select_account"
      });

      // ---------------------------------------------
      // 1. HANDLE REDIRECT RESULT (Mobile / iOS return flow)
      // ---------------------------------------------
      // This must happen BEFORE deciding final logged-in state.
      try {
        const redirectResult = await this.sdk.getRedirectResult(this.auth);
        if (redirectResult && redirectResult.user) {
          console.log("[AuthService] Google redirect authentication successful for:", redirectResult.user.email);
          await this._setAuthenticatedUser(redirectResult.user);
        }
      } catch (redirectErr) {
        console.error("[AuthService] Google Redirect Authentication Error:", redirectErr);
        this._handleAuthError(redirectErr);
      }

      // ---------------------------------------------
      // 2. LISTEN FOR FIREBASE AUTH STATE CHANGES
      // ---------------------------------------------
      await new Promise((resolve) => {
        let hasResolved = false;

        this.sdk.onAuthStateChanged(this.auth, async (fbUser) => {
          if (fbUser) {
            await this._setAuthenticatedUser(fbUser);
          } else {
            // Only use cached session if Firebase is not yet ready or offline
            const cachedSession = LocalStorageService.get("auth_session", null);
            if (!this.currentUser && cachedSession) {
              this.currentUser = cachedSession;
            } else if (!fbUser && this.isInitialized) {
              this.currentUser = null;
              LocalStorageService.clearUserSession();
            }
          }

          this._notifyListeners();

          if (!hasResolved) {
            hasResolved = true;
            resolve();
          }
        });
      });

      this.isInitialized = true;
      return this.currentUser;
    } catch (err) {
      console.warn("[AuthService] Firebase initialization warning, using local session:", err.message);
      this.currentUser = LocalStorageService.get("auth_session", null);
      this.isInitialized = true;
      this._notifyListeners();
      return this.currentUser;
    }
  }

  // =================================================
  // CENTRALIZED USER RECORD FACTORY
  // =================================================

  _createUserRecord(fbUser) {
    if (!fbUser) return null;

    const uid = fbUser.uid;
    const email = fbUser.email || "";
    const displayName = fbUser.displayName || extractNameFromEmail(email);
    const photoURL =
      fbUser.photoURL ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email || uid)}`;

    return {
      uid,
      userId: uid, // Canonical primary key
      email,
      displayName,
      photoURL,
      createdAt: fbUser.metadata?.creationTime || new Date().toISOString()
    };
  }

  // =================================================
  // SET AUTHENTICATED USER & LOAD ACCOUNT DATA
  // =================================================

  async _setAuthenticatedUser(fbUser) {
    if (!fbUser) return null;

    const userRecord = this._createUserRecord(fbUser);
    this.currentUser = userRecord;

    // 1. Persist active auth session locally
    LocalStorageService.set("auth_session", userRecord);

    // 2. Persist user in database
    try {
      await databaseService.saveUser(userRecord);
    } catch (err) {
      console.warn("[AuthService] Could not save user to database:", err);
    }

    // 3. Migrate legacy unauthenticated progress safely (no leakage to other accounts)
    try {
      LocalStorageService.migrateLegacyProgress(userRecord.userId);
    } catch (err) {
      console.warn("[AuthService] Legacy progress migration warning:", err);
    }

    return userRecord;
  }

  // =================================================
  // AUTH ERROR HANDLING (INTERNAL LOGGING)
  // =================================================

  _handleAuthError(err) {
    if (!err) return;
    const friendlyMessage = formatAuthError(err);
    console.warn(`[AuthService] ${friendlyMessage} (Code: ${err.code || "UNKNOWN"})`);
  }

  // =================================================
  // SUBSCRIBE TO AUTH STATE
  // =================================================

  onAuthStateChanged(callback) {
    this.listeners.push(callback);

    // If already initialized, provide current state immediately
    if (this.isInitialized) {
      try {
        callback(this.currentUser);
      } catch (err) {
        console.error("Error in initial auth listener execution:", err);
      }
    }

    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  // =================================================
  // NOTIFY LISTENERS
  // =================================================

  _notifyListeners() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.currentUser);
      } catch (err) {
        console.error("Error in auth listener:", err);
      }
    });
  }

  // =================================================
  // GOOGLE SIGN-IN (DESKTOP: POPUP, MOBILE: REDIRECT)
  // =================================================

  async signInWithGoogle() {
    // Ensure initialized before triggering sign-in
    await (this.initPromise || this.init());

    if (!this.auth || !this.provider || !this.sdk) {
      throw new Error("Firebase Auth is not initialized. Check your environment variables.");
    }

    try {
      // ---------------------------------------------
      // MOBILE / IOS (iPhone, iPad, Android)
      // ---------------------------------------------
      if (isMobileDevice()) {
        console.log("[AuthService] Mobile / iOS device detected. Executing signInWithRedirect().");

        await this.sdk.signInWithRedirect(this.auth, this.provider);

        // The browser navigates away to Google and returns to Path Forge.
        // getRedirectResult() in init() will process the authenticated session upon return.
        return null;
      }

      // ---------------------------------------------
      // DESKTOP (Chrome, Edge, Firefox, Safari Desktop)
      // ---------------------------------------------
      console.log("[AuthService] Desktop browser detected. Executing signInWithPopup().");

      const result = await this.sdk.signInWithPopup(this.auth, this.provider);
      const userRecord = await this._setAuthenticatedUser(result.user);

      this._notifyListeners();
      return userRecord;
    } catch (err) {
      console.error("[AuthService] Google Sign-In Error:", err);
      const friendlyMessage = formatAuthError(err);
      throw new Error(friendlyMessage);
    }
  }

  // =================================================
  // SIGN OUT (ISOLATED SESSION CLEARING)
  // =================================================

  async signOut() {
    try {
      if (this.auth && this.sdk?.signOut) {
        await this.sdk.signOut(this.auth);
      }
    } catch (err) {
      console.warn("[AuthService] Firebase sign out error:", err);
    }

    this.currentUser = null;

    // Clear active auth session without wiping stored database progress
    LocalStorageService.clearUserSession();

    this._notifyListeners();
  }

  // =================================================
  // GETTERS
  // =================================================

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return Boolean(this.currentUser);
  }
}

// ===================================================
// EXPORT SINGLETON INSTANCE
// ===================================================

export const authService = new AuthService();