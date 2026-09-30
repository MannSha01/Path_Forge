// ===================================================
// PATH FORGE - INTERACTIVE FLASHCARD REVIEW MODAL
// 3D flip card UI powered by the SM-2 Spaced Repetition Engine
// ===================================================

import { refreshLucide } from "../../utils/dom.js";
import { srsEngine } from "../../services/learning/srsEngine.js";

export class FlashcardModal {
  /**
   * @param {object} params
   * @param {string} params.userId
   * @param {() => void} [params.onComplete]
   */
  constructor({ userId = "default", onComplete = null } = {}) {
    this.userId = userId;
    this.onComplete = onComplete;
    this.cards = srsEngine.getDueCards(userId);
    this.currentIndex = 0;
    this.isFlipped = false;
    this.modalEl = null;
  }

  open() {
    this.cards = srsEngine.getDueCards(this.userId);
    this.currentIndex = 0;
    this.isFlipped = false;

    if (this.cards.length === 0) {
      alert("No cards due for review right now! Check back tomorrow.");
      return;
    }

    this.render();
  }

  close() {
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
    }
    this.modalEl = null;
    if (this.onComplete) this.onComplete();
  }

  render() {
    if (!this.modalEl) {
      this.modalEl = document.createElement("div");
      this.modalEl.id = "srs-flashcard-modal";
      this.modalEl.className =
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in";
      document.body.appendChild(this.modalEl);
    }

    if (this.currentIndex >= this.cards.length) {
      this.renderCompletionScreen();
      return;
    }

    const card = this.cards[this.currentIndex];
    const progressPercent = Math.round((this.currentIndex / this.cards.length) * 100);

    this.modalEl.innerHTML = `
      <div class="glass-card max-w-xl w-full rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl relative space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
              <i data-lucide="layers" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-xs font-black text-slate-900 uppercase tracking-wider">Spaced Repetition Review (SM-2)</h3>
              <p class="text-[11px] text-slate-500">Card ${this.currentIndex + 1} of ${this.cards.length}</p>
            </div>
          </div>
          <button id="srs-close-btn" class="p-2 text-slate-400 hover:text-slate-800 rounded-xl bg-slate-100 border border-slate-200 transition cursor-pointer">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-300" style="width: ${progressPercent}%"></div>
        </div>

        <!-- Flashcard Body -->
        <div id="srs-card-box" class="cursor-pointer select-none min-h-[220px] p-6 rounded-2xl bg-white border ${this.isFlipped ? "border-teal-500 ring-2 ring-teal-500/20" : "border-slate-200"} shadow-xs flex flex-col justify-between transition-all duration-300">
          <div>
            <div class="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 mb-3">
              <span>${card.category || "Core Concept"}</span>
              <span class="text-teal-700 font-mono">Rep: ${card.repetitions || 0}</span>
            </div>
            <h4 class="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
              ${card.front}
            </h4>
          </div>

          <!-- Back Content (Shown if flipped) -->
          <div id="srs-answer-container" class="${this.isFlipped ? "block" : "hidden"} pt-4 mt-4 border-t border-slate-200 space-y-2">
            <span class="text-[10px] font-bold uppercase text-teal-800 tracking-wider">Key Takeaway & Architecture</span>
            <p class="text-xs text-slate-700 leading-relaxed font-medium">${card.back}</p>
          </div>

          <div class="text-[11px] text-slate-500 font-medium text-center pt-3 flex items-center justify-center gap-1.5">
            <i data-lucide="rotate-cw" class="w-3 h-3"></i>
            <span>${this.isFlipped ? "Tap card to collapse" : "Click anywhere on card to flip"}</span>
          </div>
        </div>

        <!-- Rating Controls (Visible only after flipping) -->
        <div id="srs-controls" class="${this.isFlipped ? "grid" : "hidden"} grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button data-quality="1" class="srs-rate-btn p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 flex flex-col items-center gap-1 transition active:scale-95 cursor-pointer">
            <span class="text-xs font-bold">Again</span>
            <span class="text-[9px] text-rose-600 font-mono">1 day</span>
          </button>
          <button data-quality="2" class="srs-rate-btn p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex flex-col items-center gap-1 transition active:scale-95 cursor-pointer">
            <span class="text-xs font-bold">Hard</span>
            <span class="text-[9px] text-amber-600 font-mono">2 days</span>
          </button>
          <button data-quality="3" class="srs-rate-btn p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 flex flex-col items-center gap-1 transition active:scale-95 cursor-pointer">
            <span class="text-xs font-bold">Good</span>
            <span class="text-[9px] text-teal-600 font-mono">4 days</span>
          </button>
          <button data-quality="5" class="srs-rate-btn p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex flex-col items-center gap-1 transition active:scale-95 cursor-pointer">
            <span class="text-xs font-bold">Easy</span>
            <span class="text-[9px] text-emerald-600 font-mono">7+ days</span>
          </button>
        </div>

        <!-- Flip Trigger Button when not yet flipped -->
        <button
          id="srs-flip-btn"
          class="${this.isFlipped ? "hidden" : "flex"} w-full py-3 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold rounded-xl border border-teal-200 items-center justify-center gap-2 transition cursor-pointer active:scale-95"
        >
          <i data-lucide="eye" class="w-4 h-4"></i>
          <span>Show Answer & Rate Recall</span>
        </button>
      </div>
    `;

    refreshLucide();
    this.attachEvents();
  }

  renderCompletionScreen() {
    if (window.confetti) {
      window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }

    this.modalEl.innerHTML = `
      <div class="glass-card max-w-md w-full rounded-3xl p-8 border border-teal-200 bg-white shadow-xl text-center space-y-5 animate-scale-up">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
          <i data-lucide="award" class="w-7 h-7"></i>
        </div>
        <div class="space-y-1.5">
          <h3 class="text-xl font-black text-slate-900">Daily Review Complete!</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            All ${this.cards.length} spaced repetition cards have been reviewed. The SM-2 engine has scheduled your next recall intervals.
          </p>
        </div>
        <button
          id="srs-finish-btn"
          class="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/30 transition cursor-pointer active:scale-95"
        >
          Return to Dashboard
        </button>
      </div>
    `;

    refreshLucide();
    document.getElementById("srs-finish-btn")?.addEventListener("click", () => this.close());
  }

  attachEvents() {
    const closeBtn = document.getElementById("srs-close-btn");
    closeBtn?.addEventListener("click", () => this.close());

    const flipCard = () => {
      this.isFlipped = !this.isFlipped;
      this.render();
    };

    document.getElementById("srs-card-box")?.addEventListener("click", flipCard);
    document.getElementById("srs-flip-btn")?.addEventListener("click", flipCard);

    // Rating buttons
    document.querySelectorAll(".srs-rate-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const quality = Number(btn.getAttribute("data-quality")) || 3;
        const currentCard = this.cards[this.currentIndex];

        // Record SM-2 review
        srsEngine.recordReview(this.userId, currentCard.id, quality);

        // Advance to next card
        this.currentIndex++;
        this.isFlipped = false;
        this.render();
      });
    });
  }
}
