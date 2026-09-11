// ===================================================
// PATH FORGE - AUTHENTICATION SERVICE
// Firebase Google Authentication
// Desktop: Popup (signInWithPopup) with redirect fallback
// Mobile/iOS: Redirect (signInWithRedirect + getRedirectResult)
// Canonical Account Key: Firebase Auth UID
// Firebase is the SOLE authentication source of truth.
// ===================================================

import { databaseService } from "../database/databaseService.js";
import { LocalStorageService } from "../storage/localStorageService.js";

// ===================================================
// DYNAMIC FIREBASE SDK LOADER
// Loads from CDN in browser, npm in Node (tests/SSR)
// ===================================================

async function loadFirebaseSDK() {
  if (typeof window !== "undefined") {
    // Browser: Load from Google CDN
    const appModule = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const authModule = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
    return { ...appModule, ...authModule };
  } else {
    // Node.js (tests / SSR)
    try {
      const appModule = await import("firebase/app");
      const authModule = await import("firebase/auth");
      return { ...appModule, ...authModule };
    } catch {
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

  // 1. Check mobile user agent strings
  const isMobileUA = /android|iphone|ipad|ipod|mobile|silk|blackberry|iemobile|kindle/i.test(userAgent);

  // 2. iPadOS 13+ presents as MacIntel with touch points
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
      return "Your browser blocked the Google sign-in window. Trying secure redirect instead…";

    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before completing. Please try again.";

    case "auth/cancelled-popup-request":
      return "A sign-in request is already active. Please wait for it to complete.";

    case "auth/network-request-failed":
      return "Unable to reach Google. Please check your internet connection and try again.";

    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email address but a different sign-in method. Please sign in with the original method.";

    case "auth/credential-already-in-use":
      return "This Google account is already linked to a different PathForge account.";

    case "auth/redirect-cancelled-by-user":
      return "Google sign-in was cancelled. Please try again.";

    case "auth/invalid-api-key":
      return "Firebase configuration is invalid. Please check your environment variables.";

    case "auth/configuration-not-found":
      return "Firebase configuration not found. Check your environment variables and Firebase Console settings.";

    case "auth/invalid-credential":
      return "Google credential validation failed. Please verify that Google Sign-In is enabled in Firebase Console (Authentication → Sign-in method → Google) and try again.";

    case "auth/user-disabled":
      return "This user account has been disabled. Please contact the administrator.";

    case "auth/too-many-requests":
      return "Too many sign-in attempts. Please wait a moment before trying again.";

    case "auth/internal-error":
      return "An internal Firebase error occurred. Please try again later.";

    default:
      // Never expose raw Firebase error messages or stack traces to users
      return "Google Sign-In failed. Please try again.";
  }
}

// ===================================================
// AUTH SERVICE CLASS
// ===================================================

class AuthService {
  constructor() {
    // Firebase state
    this.auth = null;
    this.provider = null;
    this.sdk = null;
    this._firebaseApp = null;

    // Auth state — Firebase is the ONLY source of truth
    this.currentUser = null;     // null = no user OR still loading
    this.isLoading = true;       // true until Firebase resolves first time

    // Internal flags
    this.isInitialized = false;
    this.initPromise = null;
    this._redirectProcessed = false;  // prevent double _setAuthenticatedUser on redirect
    this._isAuthenticating = false;   // prevent double login button clicks

    // Listeners array: called with (user, isLoading)
    this.listeners = [];

    // Start initialization immediately
    this.initPromise = this._init();
  }

  // =================================================
  // FETCH PUBLIC FIREBASE CONFIG FROM SERVER
  // Config is served by /api/authConfig which reads env vars server-side.
  // This keeps credentials OUT of client-side source code.
  // =================================================

  async _fetchFirebaseConfig() {
    // Allow pre-injected config (SSR or hosting environments)
    if (typeof window !== "undefined" && window.__FIREBASE_CONFIG__) {
      return window.__FIREBASE_CONFIG__;
    }

    const response = await fetch("/api/authConfig");
    if (!response.ok) {
      throw new Error(`Failed to load Firebase configuration: HTTP ${response.status}`);
    }

    const config = await response.json();

    if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
      throw new Error(
        "Firebase configuration is incomplete. Ensure FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, and FIREBASE_APP_ID are set in your environment."
      );
    }

    return config;
  }

  // =================================================
  // INITIALIZATION LIFECYCLE
  // Order:
  //   1. Load Firebase SDK
  //   2. Fetch config from /api/authConfig
  //   3. Initialize Firebase App (once)
  //   4. Initialize Auth
  //   5. Set persistence (browserLocalPersistence with session fallback)
  //   6. Process pending redirect result (BEFORE auth state listener)
  //   7. Set up onAuthStateChanged listener
  // =================================================

  async _init() {
    if (this.isInitialized) return this.currentUser;

    try {
      // Step 1: Load SDK
      this.sdk = await loadFirebaseSDK();
      if (!this.sdk) {
        throw new Error("Firebase SDK could not be loaded. Check your network connection.");
      }

      // Step 2: Fetch public Firebase config from server
      const config = await this._fetchFirebaseConfig();

      // Step 3: Initialize Firebase App exactly once
      this._firebaseApp =
        this.sdk.getApps().length === 0
          ? this.sdk.initializeApp(config)
          : this.sdk.getApp();

      // Step 4: Get Auth instance
      this.auth = this.sdk.getAuth(this._firebaseApp);

      // Step 5: Set persistence — CRITICAL for iOS Safari and cross-session login
      // browserLocalPersistence: survives page refresh and browser restart
      // browserSessionPersistence: fallback for browsers that block local storage
      try {
        await this.sdk.setPersistence(this.auth, this.sdk.browserLocalPersistence);
      } catch (persistenceErr) {
        console.warn(
          "[AuthService] browserLocalPersistence not available, falling back to sessionPersistence:",
          persistenceErr.message
        );
        try {
          await this.sdk.setPersistence(this.auth, this.sdk.browserSessionPersistence);
        } catch (sessionPersistenceErr) {
          // In-memory persistence is Firebase's final fallback — log but continue
          console.warn(
            "[AuthService] Session persistence also unavailable, using in-memory:",
            sessionPersistenceErr.message
          );
        }
      }

      // Step 6: Configure Google Auth Provider (single reusable instance)
      this.provider = new this.sdk.GoogleAuthProvider();
      this.provider.addScope("email");
      this.provider.addScope("profile");
      this.provider.setCustomParameters({
        prompt: "select_account"  // Always show account chooser
      });

      // Step 7: Notify DatabaseService that Firebase is ready
      // This fixes the race condition where Firestore initializes before the Firebase app exists
      try {
        await databaseService.initFirestoreAfterAuth(this._firebaseApp);
      } catch (dbErr) {
        console.warn("[AuthService] DatabaseService Firestore init warning:", dbErr.message);
      }

      // Step 8: Process any pending redirect result FIRST
      // This handles the return journey from signInWithRedirect (iOS/mobile)
      // Must happen before onAuthStateChanged is set up to avoid double processing
      await this._processRedirectResult();

      // Step 9: Set up auth state listener
      // This is the SINGLE source of truth for authentication state.
      // We do NOT use localStorage to determine if a user is logged in.
      await new Promise((resolve) => {
        let hasResolved = false;

        this.sdk.onAuthStateChanged(this.auth, async (fbUser) => {
          if (fbUser) {
            // Firebase confirms a user is authenticated
            if (!this._redirectProcessed) {
              // Not a redirect return — normal auth state change (page load with existing session, popup login)
              await this._setAuthenticatedUser(fbUser);
            } else {
              // Redirect was already processed — update currentUser reference but avoid duplicate Firestore writes
              const userRecord = this._createUserRecord(fbUser);
              this.currentUser = userRecord;
            }
          } else {
            // Firebase explicitly says: no authenticated user
            // IMPORTANT: Do NOT restore from localStorage here.
            // An `auth_session` cache is only for display hints, not authentication.
            this.currentUser = null;
          }

          this.isLoading = false;
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
      console.error("[AuthService] Firebase initialization failed:", err.message);
      // Firebase is unavailable — treat as unauthenticated, not a cached session
      this.currentUser = null;
      this.isLoading = false;
      this.isInitialized = true;
      this._notifyListeners();
      return null;
    }
  }

  // =================================================
  // PROCESS REDIRECT RESULT (iOS/Mobile Return Flow)
  // Called once at startup, before onAuthStateChanged.
  // Handles the user returning from Google's sign-in page.
  // =================================================

  async _processRedirectResult() {
    try {
      const redirectResult = await this.sdk.getRedirectResult(this.auth);

      if (redirectResult && redirectResult.user) {
        console.log(
          "[AuthService] Google redirect login successful:",
          redirectResult.user.email
        );
        // Mark as processed so onAuthStateChanged doesn't duplicate the work
        this._redirectProcessed = true;
        await this._setAuthenticatedUser(redirectResult.user);
      }
      // null result = no pending redirect, perfectly normal
    } catch (redirectErr) {
      console.error("[AuthService] Redirect result processing error:", redirectErr.code, redirectErr.message);

      // Do not show UI errors here — the user will see the login screen
      // Log specific codes for debugging but never expose to UI
      const code = redirectErr.code || "";
      if (
        code === "auth/account-exists-with-different-credential" ||
        code === "auth/credential-already-in-use"
      ) {
        // Store the error temporarily so login.js can surface it to the user
        this._pendingRedirectError = formatAuthError(redirectErr);
      }
    }
  }

  // =================================================
  // CENTRALIZED USER RECORD FACTORY
  // Always derived from Firebase Auth user object.
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
      userId: uid,   // Canonical primary key — always Firebase UID
      email,
      displayName,
      photoURL,
      createdAt: fbUser.metadata?.creationTime || new Date().toISOString()
    };
  }

  // =================================================
  // SET AUTHENTICATED USER & PERSIST PROFILE
  // =================================================

  async _setAuthenticatedUser(fbUser) {
    if (!fbUser) return null;

    const userRecord = this._createUserRecord(fbUser);
    this.currentUser = userRecord;

    // Persist user profile to Firestore (merge semantics — preserves existing data)
    try {
      await databaseService.saveUser(userRecord);
    } catch (err) {
      console.warn("[AuthService] Could not save user profile to Firestore:", err.message);
      // Non-fatal: user is still authenticated, Firestore will sync when available
    }

    // Migrate any anonymous/legacy progress to this UID's namespace
    try {
      LocalStorageService.migrateLegacyProgress(userRecord.userId);
    } catch (err) {
      console.warn("[AuthService] Legacy progress migration warning:", err.message);
    }

    return userRecord;
  }

  // =================================================
  // SUBSCRIBE TO AUTH STATE CHANGES
  // Callback signature: (user, isLoading) => void
  // - user: null when loading OR unauthenticated
  // - isLoading: true while Firebase is still resolving auth state
  //
  // IMPORTANT: Do NOT treat user===null as "logged out"
  // until isLoading===false.
  // =================================================

  onAuthStateChanged(callback) {
    this.listeners.push(callback);

    // If Firebase has already resolved, call immediately with current state
    if (this.isInitialized) {
      try {
        callback(this.currentUser, this.isLoading);
      } catch (err) {
        console.error("[AuthService] Error in auth state listener:", err);
      }
    }
    // If still initializing, the callback will be called when init() completes

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  // =================================================
  // NOTIFY ALL LISTENERS
  // =================================================

  _notifyListeners() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.currentUser, this.isLoading);
      } catch (err) {
        console.error("[AuthService] Error in auth state listener:", err);
      }
    });
  }

  // =================================================
  // GOOGLE SIGN-IN
  // Strategy:
  //   Mobile/iOS → signInWithRedirect (avoids popup issues)
  //   Desktop    → signInWithPopup, with automatic redirect fallback
  //                if popup is blocked or fails
  //
  // Double-click guard: _isAuthenticating flag
  // Page reload: NEVER called — Firebase listener updates state
  // =================================================

  async signInWithGoogle() {
    // Ensure Firebase is initialized before proceeding
    await (this.initPromise || this._init());

    if (!this.auth || !this.provider || !this.sdk) {
      throw new Error("Firebase Auth is not initialized. Please check your environment variables and Firebase Console configuration.");
    }

    // Prevent multiple simultaneous sign-in requests
    if (this._isAuthenticating) {
      console.warn("[AuthService] Sign-in already in progress. Ignoring duplicate request.");
      return null;
    }

    this._isAuthenticating = true;

    try {
      // -----------------------------------------------
      // MOBILE / iOS (iPhone, iPad, Android)
      // Must use redirect — popups are unreliable on iOS Safari.
      // The page navigates away to Google; on return, _processRedirectResult()
      // handles the authenticated session in the next init() call.
      // -----------------------------------------------
      if (isMobileDevice()) {
        console.log("[AuthService] Mobile/iOS detected — using signInWithRedirect.");
        // signInWithRedirect navigates away — _isAuthenticating will reset on page return
        await this.sdk.signInWithRedirect(this.auth, this.provider);
        // Execution does not continue past this point on mobile — browser navigates away
        return null;
      }

      // -----------------------------------------------
      // DESKTOP — Try popup first, fall back to redirect
      // -----------------------------------------------
      console.log("[AuthService] Desktop browser — attempting signInWithPopup.");

      try {
        const result = await this.sdk.signInWithPopup(this.auth, this.provider);
        // Popup succeeded — Firebase onAuthStateChanged will fire automatically
        // We also call _setAuthenticatedUser here so the desktop flow can immediately
        // return the user record for navigation (onAuthStateChanged will be a no-op duplicate)
        const userRecord = await this._setAuthenticatedUser(result.user);
        this._notifyListeners();
        return userRecord;
      } catch (popupErr) {
        const code = popupErr.code || "";

        if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
          // Popup blocked or closed — fall back to redirect silently
          console.warn(
            `[AuthService] Popup ${code === "auth/popup-blocked" ? "blocked" : "closed"} — falling back to redirect.`
          );
          await this.sdk.signInWithRedirect(this.auth, this.provider);
          return null; // Browser navigates away
        }

        if (code === "auth/cancelled-popup-request") {
          // Another popup request was already pending — not an error, just log it
          console.warn("[AuthService] Cancelled duplicate popup request.");
          return null;
        }

        // All other popup errors — format and re-throw for UI to display
        throw new Error(formatAuthError(popupErr));
      }
    } catch (err) {
      // Re-throw formatted errors (already formatted above for known codes)
      if (err.message && !err.code) {
        throw err; // Already formatted
      }
      throw new Error(formatAuthError(err));
    } finally {
      // Always reset the authenticating flag
      // (For redirect flows this runs before navigation, which is fine)
      this._isAuthenticating = false;
    }
  }

  // =================================================
  // SIGN OUT
  // Uses Firebase signOut — clears Firebase session.
  // Clears in-memory state and display cache.
  // Does NOT delete Firestore data.
  // =================================================

  async signOut() {
    try {
      if (this.auth && this.sdk?.signOut) {
        await this.sdk.signOut(this.auth);
      }
    } catch (err) {
      console.warn("[AuthService] Firebase sign-out error:", err.message);
    }

    // Clear in-memory state — Firebase onAuthStateChanged will also fire with null
    this.currentUser = null;

    // Clear display cache only (not Firestore data, not user progress)
    LocalStorageService.clearUserSession();

    this._notifyListeners();
  }

  // =================================================
  // GETTERS
  // =================================================

  /**
   * Returns the current Firebase-authenticated user, or null.
   * Use onAuthStateChanged for reactive updates — do not poll this.
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Returns the initialized Firebase App instance.
   * Used by DatabaseService to get the Firestore instance.
   */
  getFirebaseApp() {
    return this._firebaseApp;
  }

  isAuthenticated() {
    return Boolean(this.currentUser);
  }

  /**
   * Returns any error that occurred during a redirect login flow.
   * Call once on app start to surface redirect errors to the user.
   */
  getPendingRedirectError() {
    const err = this._pendingRedirectError || null;
    this._pendingRedirectError = null;
    return err;
  }
}

// ===================================================
// EXPORT SINGLETON INSTANCE
// All modules import this same instance.
// Firebase is initialized exactly once.
// ===================================================

export const authService = new AuthService();