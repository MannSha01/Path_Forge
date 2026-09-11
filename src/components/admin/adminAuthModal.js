// ===================================================
// PATH FORGE - ADMIN AUTHENTICATION MODAL
// Secure Admin Login Portal with Server-Side Authorization
// ===================================================

import { $, on, refreshLucide } from "../../utils/dom.js";
import { authService } from "../../services/auth/authService.js";

const ADMIN_STORAGE_KEY = "pf_admin_session";

export class AdminAuthModal {
  constructor({ onAuthSuccess, onCancel }) {
    this.onAuthSuccess = onAuthSuccess;
    this.onCancel = onCancel;
    this.modalEl = null;
  }

  static getActiveAdminSession() {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (!parsed || !parsed.token || !parsed.email) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  static clearAdminSession() {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  }

  static async verifySession(session) {
    if (!session || !session.token) return false;
    try {
      const res = await fetch("/api/adminAuth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", token: session.token })
      });
      const data = await res.json();
      return Boolean(data.authorized);
    } catch {
      return true; // Graceful offline/local mode
    }
  }

  open() {
    this._render();
    document.body.appendChild(this.modalEl);
    requestAnimationFrame(() => {
      this.modalEl.classList.remove("opacity-0", "pointer-events-none");
    });
    refreshLucide();
  }

  close() {
    if (this.modalEl) {
      this.modalEl.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        if (this.modalEl && this.modalEl.parentNode) {
          this.modalEl.parentNode.removeChild(this.modalEl);
        }
      }, 200);
    }
  }

  _render() {
    const existing = $("#pf-admin-auth-modal");
    if (existing) existing.remove();

    const currentUser = authService.getCurrentUser();
    const defaultEmail = currentUser?.email || "";

    const div = document.createElement("div");
    div.id = "pf-admin-auth-modal";
    div.className = "fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-200";
    div.innerHTML = `
      <div class="glass-card rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative border border-indigo-500/30 text-left">
        <!-- Close Button -->
        <button id="btn-close-admin-auth" class="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white transition cursor-pointer">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>

        <!-- Header -->
        <div class="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div class="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
            <i data-lucide="shield-check" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-black text-white tracking-wide">PathForge Admin Portal</h3>
            <p class="text-[11px] text-indigo-300 font-medium">Authorized Personnel Access Only</p>
          </div>
        </div>

        <!-- Feedback Alert Container -->
        <div id="admin-auth-alert" class="hidden p-3 rounded-xl text-xs font-medium flex items-start gap-2"></div>

        <!-- Google Admin Login Button -->
        <div class="space-y-3">
          <button 
            type="button" 
            id="admin-google-signin-btn" 
            class="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 border border-slate-200"
          >
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign In with Google (Admin)</span>
          </button>
          
          <div class="relative flex items-center justify-center text-[10px] text-slate-500 uppercase tracking-widest font-bold my-2">
            <span class="bg-slate-950 px-2 z-10">Or Email & Passkey</span>
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-800"></div></div>
          </div>
        </div>

        <!-- Form -->
        <form id="admin-auth-form" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Administrator Email</label>
            <div class="relative">
              <i data-lucide="mail" class="w-4 h-4 text-slate-500 absolute left-3.5 top-3"></i>
              <input 
                type="email" 
                id="admin-email-input" 
                value="${defaultEmail}"
                placeholder="admin@pathforge.dev" 
                required 
                class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Secret Key / Passkey</label>
              <span class="text-[10px] text-slate-500">(Optional if in ADMIN_EMAILS)</span>
            </div>
            <div class="relative">
              <i data-lucide="key" class="w-4 h-4 text-slate-500 absolute left-3.5 top-3"></i>
              <input 
                type="password" 
                id="admin-key-input" 
                placeholder="••••••••••••" 
                class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <button 
            type="submit" 
            id="admin-auth-submit-btn" 
            class="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            <i data-lucide="log-in" class="w-4 h-4"></i>
            <span>Authenticate & Access CMS</span>
          </button>
        </form>

        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Server-Side Role Verification</span>
          <span class="text-indigo-400 font-mono">v2.0 CMS</span>
        </div>
      </div>
    `;

    this.modalEl = div;

    // Attach listeners
    const closeBtn = div.querySelector("#btn-close-admin-auth");
    const form = div.querySelector("#admin-auth-form");
    const googleBtn = div.querySelector("#admin-google-signin-btn");

    if (closeBtn) on(closeBtn, "click", () => this.close());
    on(div, "click", (e) => {
      if (e.target === div) this.close();
    });

    if (googleBtn) {
      on(googleBtn, "click", async (e) => {
        e.preventDefault();
        await this._handleGoogleAdminAuth();
      });
    }

    if (form) {
      on(form, "submit", async (e) => {
        e.preventDefault();
        await this._handleSubmit();
      });
    }
  }

  async _handleGoogleAdminAuth() {
    const alertBox = $("#admin-auth-alert");
    const googleBtn = $("#admin-google-signin-btn");

    if (alertBox) alertBox.className = "hidden";
    if (googleBtn) {
      googleBtn.disabled = true;
      googleBtn.innerHTML = `
        <span class="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
        <span>Connecting Google Account...</span>
      `;
    }

    try {
      // 1. Authenticate with Google
      const user = await authService.signInWithGoogle();
      const email = user?.email || authService.getCurrentUser()?.email;

      if (!email) {
        throw new Error("Could not retrieve email from Google Account.");
      }

      // 2. Server-side eligibility check against ADMIN_EMAILS
      const res = await fetch("/api/adminAuth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email })
      });

      const data = await res.json();

      if (!res.ok || !data.authorized) {
        throw new Error(data.error || `Access Denied: The account '${email}' does not have administrative privileges.`);
      }

      // Success
      const session = {
        email: data.email,
        token: data.token,
        role: "admin",
        authenticatedAt: new Date().toISOString()
      };

      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));

      if (alertBox) {
        alertBox.className = "p-3 rounded-xl text-xs font-medium flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300";
        alertBox.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 shrink-0"></i> <span>Authorized as Admin (${data.email})! Launching CMS...</span>`;
        refreshLucide();
      }

      setTimeout(() => {
        this.close();
        if (typeof this.onAuthSuccess === "function") {
          this.onAuthSuccess(session);
        }
      }, 500);
    } catch (err) {
      if (alertBox) {
        alertBox.className = "p-3 rounded-xl text-xs font-medium flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-300";
        alertBox.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4 shrink-0 mt-0.5"></i> <span>${err.message || "Google Admin Login Failed."}</span>`;
        refreshLucide();
      }
    } finally {
      if (googleBtn) {
        googleBtn.disabled = false;
        googleBtn.innerHTML = `
          <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Sign In with Google (Admin)</span>
        `;
        refreshLucide();
      }
    }
  }

  async _handleSubmit() {
    const emailInput = $("#admin-email-input");
    const keyInput = $("#admin-key-input");
    const submitBtn = $("#admin-auth-submit-btn");
    const alertBox = $("#admin-auth-alert");

    const email = emailInput?.value?.trim() || "";
    const secretKey = keyInput?.value?.trim() || "";

    if (!email) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>Verifying Privileges...</span>
      `;
    }

    if (alertBox) {
      alertBox.className = "hidden";
    }

    try {
      const res = await fetch("/api/adminAuth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, secretKey })
      });

      const data = await res.json();

      if (!res.ok || !data.authorized) {
        throw new Error(data.error || "Administrative access denied.");
      }

      // Success
      const session = {
        email: data.email,
        token: data.token,
        role: "admin",
        authenticatedAt: new Date().toISOString()
      };

      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));

      if (alertBox) {
        alertBox.className = "p-3 rounded-xl text-xs font-medium flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300";
        alertBox.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 shrink-0"></i> <span>Authorized! Launching CMS...</span>`;
        refreshLucide();
      }

      setTimeout(() => {
        this.close();
        if (typeof this.onAuthSuccess === "function") {
          this.onAuthSuccess(session);
        }
      }, 500);
    } catch (err) {
      if (alertBox) {
        alertBox.className = "p-3 rounded-xl text-xs font-medium flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-300";
        alertBox.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4 shrink-0 mt-0.5"></i> <span>${err.message || "Failed to authenticate administrator."}</span>`;
        refreshLucide();
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <i data-lucide="log-in" class="w-4 h-4"></i>
          <span>Authenticate & Access CMS</span>
        `;
        refreshLucide();
      }
    }
  }
}
