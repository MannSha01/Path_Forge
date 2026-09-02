// ===================================================
// PATH FORGE - CAREER QUIZ COMPONENT
// Preference questionnaire & initial role recommendation signal
// ===================================================

import { $, refreshLucide } from "../../utils/dom.js";
import { QUIZ_QUESTIONS } from "../../data/quizQuestions.js";
import { calculateQuizResults } from "../../services/quizEngine.js";

let quizAnswers = [];
let currentQuizStep = 0;
let onLaunchCallback = null;
let pathwaysRef = {};

export function initQuiz({ pathwaysData, onLaunchRole }) {
  pathwaysRef = pathwaysData;
  onLaunchCallback = onLaunchRole;

  const triggerQuizBtn = $("#trigger-quiz-btn");
  const modal = $("#detail-modal");
  const closeModalBtn = $("#close-modal");

  if (triggerQuizBtn) {
    triggerQuizBtn.addEventListener("click", openQuizModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeQuizModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeQuizModal();
    });
  }
}

export function openQuizModal() {
  quizAnswers = [];
  currentQuizStep = 0;

  const modal = $("#detail-modal");
  const modalBox = $("#modal-box");

  if (modal && modalBox) {
    modal.classList.remove("opacity-0", "pointer-events-none");
    modalBox.classList.add("animate-modal-pop");
  }

  renderQuizStep();
}

export function closeQuizModal() {
  const modal = $("#detail-modal");
  const modalBox = $("#modal-box");

  if (modal && modalBox) {
    modal.classList.add("opacity-0", "pointer-events-none");
    modalBox.classList.remove("animate-modal-pop");
  }
}

function renderQuizStep() {
  const modalContent = $("#modal-content");
  if (!modalContent) return;

  const q = QUIZ_QUESTIONS[currentQuizStep];
  if (!q) {
    renderQuizResult();
    return;
  }

  modalContent.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
        Question ${currentQuizStep + 1} of ${QUIZ_QUESTIONS.length}
      </span>
      <span class="text-xs text-slate-500 font-semibold">1-Min Quiz</span>
    </div>

    <h3 class="text-lg font-bold text-white mt-1 mb-4">${q.question}</h3>

    <div class="space-y-2.5">
      ${q.options
        .map(
          (opt, i) => `
        <button 
          data-index="${i}"
          class="quiz-opt-btn w-full text-left p-3.5 bg-slate-950/80 hover:bg-indigo-600/20 rounded-xl border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white text-xs font-medium transition flex items-center justify-between group cursor-pointer"
        >
          <span>${opt.text}</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-indigo-400"></i>
        </button>
      `
        )
        .join("")}
    </div>
  `;

  refreshLucide();

  modalContent.querySelectorAll(".quiz-opt-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const selectedIndex = parseInt(e.currentTarget.getAttribute("data-index"), 10);
      quizAnswers.push(q.options[selectedIndex]);
      currentQuizStep++;
      renderQuizStep();
    });
  });
}

function renderQuizResult() {
  const modalContent = $("#modal-content");
  if (!modalContent) return;

  const { bestCategory, matchedRole } = calculateQuizResults(quizAnswers, pathwaysRef);

  if (!matchedRole) {
    modalContent.innerHTML = `
      <div class="text-center py-4 text-slate-300">
        <p>No matching role found. Please try again.</p>
        <button id="retry-quiz-btn" class="mt-4 px-4 py-2 bg-indigo-600 rounded-xl text-white text-xs font-bold">Retry Quiz</button>
      </div>
    `;
    $("#retry-quiz-btn")?.addEventListener("click", openQuizModal);
    return;
  }

  modalContent.innerHTML = `
    <div class="text-center py-2">
      <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
        <i data-lucide="sparkles" class="w-6 h-6"></i>
      </div>
      <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
        Your Match Found!
      </span>
      <h3 class="text-2xl font-black text-white mt-2">${matchedRole.title}</h3>
      <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">${matchedRole.tagline}</p>

      <div class="mt-6">
        <button 
          id="launch-matched-roadmap"
          class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>Set As Target Role & Continue</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `;

  refreshLucide();

  $("#launch-matched-roadmap")?.addEventListener("click", () => {
    closeQuizModal();
    if (onLaunchCallback) {
      onLaunchCallback(matchedRole, bestCategory);
    }
  });
}
