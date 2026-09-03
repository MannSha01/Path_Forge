// ===================================================
// PATH FORGE - AUTHENTICATION SERVICE
// Firebase Google Authentication
// Desktop: Popup
// Mobile/iOS: Redirect
// ===================================================

import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { databaseService } from "../database/databaseService.js";
import { LocalStorageService } from "../storage/localStorageService.js";

// ===================================================
// FIREBASE CONFIG
// ===================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDnUrQ2wdKWqhh_wW7ZlvTxCaSHui8LeF4",
  authDomain: "path-forge-7845e.firebaseapp.com",
  projectId: "path-forge-7845e",
  storageBucket: "path-forge-7845e.firebasestorage.app",
  messagingSenderId: "580025481377",
  appId: "1:580025481377:web:5e53953bcdc986bbef18e0"
};

// ===================================================
// HELPER
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
// DEVICE DETECTION
// ===================================================

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;

  const userAgent = navigator.userAgent || navigator.vendor || "";

  return /android|iphone|ipad|ipod|mobile/i.test(userAgent);
}

// ===================================================
// AUTH SERVICE
// ===================================================

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.auth = null;
    this.provider = null;

    this._initFirebase();
  }

  // =================================================
  // FIREBASE INITIALIZATION
  // =================================================

  _initFirebase() {
    try {
      const app =
        getApps().length === 0
          ? initializeApp(FIREBASE_CONFIG)
          : getApp();

      this.auth = getAuth(app);

      this.provider = new GoogleAuthProvider();

      // Always show Google's account selector.
      // This is useful for recruitment portals where
      // candidates may have multiple Google accounts.
      this.provider.setCustomParameters({
        prompt: "select_account"
      });

      // ---------------------------------------------
      // FIREBASE AUTH STATE
      // ---------------------------------------------

      fbOnAuthStateChanged(this.auth, async (fbUser) => {
        if (fbUser) {
          await this._setAuthenticatedUser(fbUser);
        } else {
          // Do not immediately destroy the cached session
          // because Firebase may still be restoring auth state.
          const cachedSession =
            LocalStorageService.get("auth_session", null);

          this.currentUser = cachedSession;
        }

        this._notifyListeners();
      });

      // ---------------------------------------------
      // HANDLE REDIRECT RESULT
      // ---------------------------------------------
      //
      // On mobile we use signInWithRedirect().
      // When Google sends the user back to Path Forge,
      // Firebase needs getRedirectResult() to process
      // the completed authentication flow.
      //
      this._handleRedirectResult();

    } catch (err) {
      console.warn(
        "Firebase initialization error, using local session:",
        err
      );

      this.currentUser =
        LocalStorageService.get("auth_session", null);

      this._notifyListeners();
    }
  }

  // =================================================
  // HANDLE REDIRECT AUTH RESULT
  // =================================================

  async _handleRedirectResult() {
    if (!this.auth) return;

    try {
      const result = await getRedirectResult(this.auth);

      if (!result || !result.user) {
        return;
      }

      console.log(
        "Google redirect authentication successful."
      );

      // onAuthStateChanged will also fire, but handling
      // the user here makes the redirect flow explicit.
      await this._setAuthenticatedUser(result.user);

      this._notifyListeners();

    } catch (err) {
      console.error(
        "Google Redirect Authentication Error:",
        err
      );

      this._handleAuthError(err);
    }
  }

  // =================================================
  // CONVERT FIREBASE USER TO PATH FORGE USER
  // =================================================

  async _setAuthenticatedUser(fbUser) {
    if (!fbUser) return null;

    const userRecord = {
      userId: fbUser.uid,
      email: fbUser.email,
      displayName:
        fbUser.displayName ||
        extractNameFromEmail(fbUser.email),

      photoURL:
        fbUser.photoURL ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
          fbUser.email
        )}`,

      createdAt:
        fbUser.metadata?.creationTime ||
        new Date().toISOString()
    };

    this.currentUser = userRecord;

    // Persist session locally.
    LocalStorageService.set(
      "auth_session",
      userRecord
    );

    // Save/update user in database.
    try {
      await databaseService.saveUser(userRecord);
    } catch (err) {
      console.warn(
        "Could not save user to database:",
        err
      );
    }

    // Migrate any previous local progress.
    try {
      LocalStorageService.migrateLegacyProgress(
        userRecord.userId
      );
    } catch (err) {
      console.warn(
        "Could not migrate legacy progress:",
        err
      );
    }

    return userRecord;
  }

  // =================================================
  // AUTH ERROR HANDLING
  // =================================================

  _handleAuthError(err) {
    if (!err) return;

    switch (err.code) {
      case "auth/unauthorized-domain":
        console.error(
          `Unauthorized Firebase domain: ${window.location.hostname}`
        );
        break;

      case "auth/operation-not-allowed":
        console.error(
          "Google sign-in provider is not enabled in Firebase Console."
        );
        break;

      case "auth/popup-blocked":
        console.error(
          "Google sign-in popup was blocked by the browser."
        );
        break;

      case "auth/popup-closed-by-user":
        console.error(
          "Google sign-in popup was closed before completing."
        );
        break;

      case "auth/cancelled-popup-request":
        console.error(
          "Another Google sign-in request is already active."
        );
        break;

      case "auth/network-request-failed":
        console.error(
          "Network error while communicating with Firebase."
        );
        break;

      default:
        console.error(
          "Firebase authentication error:",
          err
        );
    }
  }

  // =================================================
  // SUBSCRIBE TO AUTH STATE
  // =================================================

  onAuthStateChanged(callback) {
    this.listeners.push(callback);

    // Immediately provide current state.
    callback(this.currentUser);

    return () => {
      this.listeners = this.listeners.filter(
        (cb) => cb !== callback
      );
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
        console.error(
          "Error in auth listener:",
          err
        );
      }
    });
  }

  // =================================================
  // GOOGLE SIGN-IN
  // =================================================

  async signInWithGoogle() {
    if (!this.auth || !this.provider) {
      throw new Error(
        "Firebase Auth is not initialized."
      );
    }

    try {
      // ---------------------------------------------
      // MOBILE / IOS
      // ---------------------------------------------
      //
      // Safari/iOS is much more reliable with redirect
      // authentication than popup authentication.
      //

      if (isMobileDevice()) {
        console.log(
          "Mobile device detected. Using Google redirect authentication."
        );

        await signInWithRedirect(
          this.auth,
          this.provider
        );

        // The browser will leave this page and return
        // after authentication.
        //
        // There is intentionally no user object here.
        // _handleRedirectResult() processes the result
        // when the application loads again.

        return null;
      }

      // ---------------------------------------------
      // DESKTOP
      // ---------------------------------------------

      console.log(
        "Desktop device detected. Using Google popup authentication."
      );

      const result = await signInWithPopup(
        this.auth,
        this.provider
      );

      const fbUser = result.user;

      const userRecord =
        await this._setAuthenticatedUser(fbUser);

      this._notifyListeners();

      return userRecord;

    } catch (err) {
      console.error(
        "Google Sign-In Error:",
        err
      );

      // User manually closed the popup.
      if (
        err.code ===
        "auth/popup-closed-by-user"
      ) {
        throw new Error(
          "Sign-in popup was closed before completing."
        );
      }

      // Firebase doesn't allow this website.
      if (
        err.code ===
        "auth/unauthorized-domain"
      ) {
        throw new Error(
          `Current domain (${window.location.hostname}) is not authorized in Firebase Console. Add it under Firebase Console → Authentication → Settings → Authorized Domains.`
        );
      }

      // Google provider isn't enabled.
      if (
        err.code ===
        "auth/operation-not-allowed"
      ) {
        throw new Error(
          "Google sign-in is not enabled in Firebase Console."
        );
      }

      // Popup was blocked.
      if (
        err.code ===
        "auth/popup-blocked"
      ) {
        throw new Error(
          "Google sign-in was blocked by the browser. Please allow popups or try again."
        );
      }

      // Network issue.
      if (
        err.code ===
        "auth/network-request-failed"
      ) {
        throw new Error(
          "Network error while connecting to Google. Please check your internet connection and try again."
        );
      }

      throw err;
    }
  }

  // =================================================
  // SIGN OUT
  // =================================================

  async signOut() {
    try {
      if (this.auth) {
        await fbSignOut(this.auth);
      }
    } catch (err) {
      console.warn(
        "Firebase sign out error:",
        err
      );
    }

    this.currentUser = null;

    LocalStorageService.remove(
      "auth_session"
    );

    this._notifyListeners();
  }

  // =================================================
  // GET CURRENT USER
  // =================================================

  getCurrentUser() {
    return this.currentUser;
  }

  // =================================================
  // AUTHENTICATED?
  // =================================================

  isAuthenticated() {
    return Boolean(this.currentUser);
  }
}

// ===================================================
// SINGLE AUTH SERVICE INSTANCE
// ===================================================

export const authService = new AuthService();