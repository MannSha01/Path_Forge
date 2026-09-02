// ===================================================
// PATH FORGE - AUTHENTICATION SERVICE
// Official Firebase Google Authentication Integration
// ===================================================

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { databaseService } from "../database/databaseService.js";
import { LocalStorageService } from "../storage/localStorageService.js";

// Firebase Web Client Configuration (as configured in .env.local)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDnUrQ2wdKWqhh_wW7ZlvTxCaSHui8LeF4",
  authDomain: "path-forge-7845e.firebaseapp.com",
  projectId: "path-forge-7845e",
  storageBucket: "path-forge-7845e.firebasestorage.app",
  messagingSenderId: "580025481377",
  appId: "1:580025481377:web:5e53953bcdc986bbef18e0"
};

/**
 * Extracts a formatted human-readable name from an email ID.
 * @param {string} email
 * @returns {string}
 */
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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return formatted || "Candidate";
}

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.auth = null;
    this.provider = null;

    this._initFirebase();
  }

  _initFirebase() {
    try {
      const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
      this.auth = getAuth(app);
      this.provider = new GoogleAuthProvider();
      // Force Google account chooser prompt every time so candidate can select their email
      this.provider.setCustomParameters({ prompt: "select_account" });

      // Listen for Firebase native auth state changes
      fbOnAuthStateChanged(this.auth, async (fbUser) => {
        if (fbUser) {
          const userRecord = {
            userId: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || extractNameFromEmail(fbUser.email),
            photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.email)}`,
            createdAt: fbUser.metadata?.creationTime || new Date().toISOString()
          };
          this.currentUser = userRecord;
          LocalStorageService.set("auth_session", userRecord);
          await databaseService.saveUser(userRecord);
          LocalStorageService.migrateLegacyProgress(userRecord.userId);
        } else {
          // Check if cached session exists
          this.currentUser = LocalStorageService.get("auth_session", null);
        }
        this._notifyListeners();
      });
    } catch (err) {
      console.warn("Firebase initialization error, using local session:", err);
      this.currentUser = LocalStorageService.get("auth_session", null);
    }
  }

  /**
   * Subscribe to auth state changes.
   * @param {(user: object | null) => void} callback
   * @returns {() => void} Unsubscribe function
   */
  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  _notifyListeners() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.currentUser);
      } catch (err) {
        console.error("Error in auth listener:", err);
      }
    });
  }

  /**
   * Trigger the official Google Sign-In popup via Firebase.
   * @returns {Promise<object>}
   */
  async signInWithGoogle() {
    if (!this.auth || !this.provider) {
      throw new Error("Firebase Auth is not initialized.");
    }

    try {
      const result = await signInWithPopup(this.auth, this.provider);
      const fbUser = result.user;

      const userRecord = {
        userId: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || extractNameFromEmail(fbUser.email),
        photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.email)}`,
        createdAt: fbUser.metadata?.creationTime || new Date().toISOString()
      };

      this.currentUser = userRecord;
      LocalStorageService.set("auth_session", userRecord);
      await databaseService.saveUser(userRecord);
      LocalStorageService.migrateLegacyProgress(userRecord.userId);

      this._notifyListeners();
      return userRecord;
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        throw new Error("Sign-in popup was closed before completing.");
      } else if (err.code === "auth/unauthorized-domain") {
        throw new Error(
          `Current domain (${window.location.hostname}) is not authorized in Firebase Console. Add it in Firebase Console -> Authentication -> Settings -> Authorized Domains.`
        );
      } else if (err.code === "auth/operation-not-allowed") {
        throw new Error("Google sign-in provider is not enabled in Firebase Console.");
      }
      throw err;
    }
  }

  /**
   * Sign out the active user.
   */
  async signOut() {
    try {
      if (this.auth) {
        await fbSignOut(this.auth);
      }
    } catch (err) {
      console.warn("Firebase sign out error:", err);
    }
    this.currentUser = null;
    LocalStorageService.remove("auth_session");
    this._notifyListeners();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return Boolean(this.currentUser);
  }
}

export const authService = new AuthService();
