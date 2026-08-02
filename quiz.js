
// PATH FORGE - PLUG & PLAY QUIZ MODULE


// 1. AUTOMATICALLY INJECT MODAL HTML ON LOAD
document.addEventListener("DOMContentLoaded", () => {
  const modalHTML = `
    <div id="detail-modal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-300">
      <div id="modal-box" class="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-2xl">
        <button id="close-modal-quiz" class="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer text-xl font-bold">
          ✕
        </button>
        <div id="modal-content-quiz" class="mt-2"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Attach button click handlers
  const triggerBtn = document.getElementById("trigger-quiz-btn");
  const topBannerBtn = document.getElementById("top-banner-quiz-btn");
  const closeBtn = document.getElementById("close-modal-quiz");
  const modal = document.getElementById("detail-modal");

  if (triggerBtn) triggerBtn.addEventListener("click", openQuizModal);
  if (topBannerBtn) topBannerBtn.addEventListener("click", openQuizModal);
  if (closeBtn) closeBtn.addEventListener("click", closeQuizModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeQuizModal();
    });
  }
});

// 2. 5-QUESTION EASY DATASET
const QUIZ_QUESTIONS = [
  {
    question: "1. What sounds like the most fun thing to build or work on?",
    options: [
      { text: "🎨 Designing clean visual interfaces and mobile app layouts", category: "non-tech", roleId: "uiux-designer" },
      { text: "💻 Writing code to make websites interactive and responsive", category: "tech", roleId: "frontend" },
      { text: "📊 Finding hidden patterns, trends, and charts in raw data", category: "tech", roleId: "data-analyst" },
      { text: "🚀 Planning a new app idea, user strategy, and feature list", category: "non-tech", roleId: "product-manager" }
    ]
  },
  {
    question: "2. How do you prefer to solve problems day-to-day?",
    options: [
      { text: "🎧 Deep focus mode: Writing logic, fixing bugs, or building tools", category: "tech", roleId: "backend" },
      { text: "✏️ Creative mode: Sketching ideas, choosing colors, and user testing", category: "non-tech", roleId: "uiux-designer" },
      { text: "💬 People mode: Helping team members, running catch-ups, and organizing tasks", category: "non-tech", roleId: "product-manager" },
      { text: "📊 Analyst mode: Finding trends in spreadsheet data", category: "tech", roleId: "data-analyst" }
    ]
  },
  {
    question: "3. How do you feel about coding vs. visual creativity?",
    options: [
      { text: "I want code to be my main superpower (HTML, JavaScript, React)", category: "tech", roleId: "frontend" },
      { text: "I prefer zero code — give me visual design tools like Figma", category: "non-tech", roleId: "uiux-designer" },
      { text: "I prefer fullstack engineering across frontend & backend", category: "tech", roleId: "fullstack" },
      { text: "I prefer business strategy, user requirements, and product roadmaps", category: "non-tech", roleId: "product-manager" }
    ]
  },
  {
    question: "4. What kind of topics get you most excited?",
    options: [
      { text: "Building cool full-stack web applications", category: "tech", roleId: "fullstack" },
      { text: "Crafting beautiful design systems and smooth animations", category: "non-tech", roleId: "uiux-designer" },
      { text: "Analyzing data insights to increase business profits", category: "tech", roleId: "data-analyst" },
      { text: "Launching new digital software products", category: "non-tech", roleId: "product-manager" }
    ]
  },
  {
    question: "5. What is your primary career goal right now?",
    options: [
      { text: "Become a Web Developer or Software Engineer", category: "tech", roleId: "frontend" },
      { text: "Become a Product UI/UX Designer", category: "non-tech", roleId: "uiux-designer" },
      { text: "Become a Product Manager", category: "non-tech", roleId: "product-manager" },
      { text: "Become a Data Analyst", category: "tech", roleId: "data-analyst" }
    ]
  }
];

let quizAnswers = [];
let currentQuizStep = 0;

function openQuizModal() {
  quizAnswers = [];
  currentQuizStep = 0;
  renderQuizQuestion();
  const modal = document.getElementById("detail-modal");
  if (modal) modal.classList.remove("opacity-0", "pointer-events-none");
}

function closeQuizModal() {
  const modal = document.getElementById("detail-modal");
  if (modal) modal.classList.add("opacity-0", "pointer-events-none");
}

function renderQuizQuestion() {
  const q = QUIZ_QUESTIONS[currentQuizStep];
  const container = document.getElementById("modal-content-quiz");

  if (!q) {
    calculateQuizResults();
    return;
  }

  container.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase">
        Question ${currentQuizStep + 1} of ${QUIZ_QUESTIONS.length}
      </span>
      <span class="text-xs text-slate-500 font-semibold">1-Min Career Quiz</span>
    </div>

    <h3 class="text-lg font-bold text-white mt-1 mb-4">${q.question}</h3>

    <div class="space-y-2.5">
      ${q.options.map((opt, i) => `
        <button data-index="${i}" class="quiz-opt-btn w-full text-left p-3.5 bg-slate-950/80 hover:bg-indigo-600/20 rounded-xl border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white text-xs font-medium transition flex items-center justify-between cursor-pointer">
          <span>${opt.text}</span>
          <span class="text-indigo-400 font-bold">→</span>
        </button>
      `).join("")}
    </div>
  `;

  document.querySelectorAll(".quiz-opt-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.getAttribute("data-index"));
      quizAnswers.push(q.options[idx]);
      currentQuizStep++;
      renderQuizQuestion();
    });
  });
}

function calculateQuizResults() {
  const container = document.getElementById("modal-content-quiz");
  const roleScores = {};

  quizAnswers.forEach((ans) => {
    const roleId = ans.roleId;
    roleScores[roleId] = (roleScores[roleId] || 0) + 2;
  });

  const allRoles = [];
  if (typeof PATHWAYS_DATA !== "undefined") {
    Object.keys(PATHWAYS_DATA).forEach((catKey) => {
      PATHWAYS_DATA[catKey].roles.forEach((r) => {
        allRoles.push({ ...r, category: catKey });
      });
    });
  }

  allRoles.sort((a, b) => (roleScores[b.id] || 0) - (roleScores[a.id] || 0));
  const topMatches = allRoles.slice(0, 2);

  container.innerHTML = `
    <div class="text-center mb-4">
      <h3 class="text-xl font-bold text-white">✨ We Found Your Best Matches!</h3>
      <p class="text-xs text-slate-400 mt-1">Select an option to start tracking your path:</p>
    </div>

    <div class="grid grid-cols-1 gap-3 my-4">
      ${topMatches.map((role, idx) => `
        <div class="p-4 bg-slate-950/90 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition space-y-3">
          <div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase">
              ${idx === 0 ? '🔥 Top Match' : '✨ Great Alternative'}
            </span>
            <h4 class="text-base font-bold text-white mt-1">${role.title}</h4>
            <p class="text-xs text-slate-400 mt-0.5">${role.tagline}</p>
          </div>

          <button data-role-id="${role.id}" data-category="${role.category}" class="select-quiz-option-btn w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition cursor-pointer">
            Select & Start Pathway →
          </button>
        </div>
      `).join("")}
    </div>
  `;

  document.querySelectorAll(".select-quiz-option-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const targetRoleId = e.currentTarget.getAttribute("data-role-id");
      const targetCategory = e.currentTarget.getAttribute("data-category");
      
      closeQuizModal();

      if (typeof PATHWAYS_DATA !== "undefined" && typeof selectRole === "function") {
        const chosenRole = PATHWAYS_DATA[targetCategory].roles.find(r => r.id === targetRoleId);
        if (chosenRole) {
          if (typeof currentCategory !== "undefined") currentCategory = targetCategory;
          selectRole(chosenRole); // Automatically opens your existing pathway view!
        }
      }
    });
  });
}
// ===================================================
// CUSTOM GLOWING CURSOR MODULE
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Inject Cursor Styles
  const cursorStyle = document.createElement("style");
  cursorStyle.innerHTML = `
    /* Hide default cursor on interactive elements for custom cursor feel */
    body, button, a, input, label {
      cursor: none !important;
    }

    .cursor-dot {
      position: fixed;
      top: 0;
      left: 0;
      width: 8px;
      height: 8px;
      background-color: #818cf8; /* indigo-400 */
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      transition: transform 0.15s ease-out, background-color 0.2s;
      box-shadow: 0 0 10px rgba(129, 140, 248, 0.8);
    }

    .cursor-ring {
      position: fixed;
      top: 0;
      left: 0;
      width: 36px;
      height: 36px;
      border: 1.5px solid rgba(129, 140, 248, 0.5);
      border-radius: 50%;
      pointer-events: none;
      z-index: 99998;
      transform: translate(-50%, -50%);
      transition: width 0.2s ease, height 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
    }

    /* Hover State for Buttons & Quiz Options */
    .cursor-ring.cursor-hover {
      width: 52px;
      height: 52px;
      background-color: rgba(99, 102, 241, 0.15); /* indigo glow fill */
      border-color: #a5b4fc;
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
    }

    .cursor-dot.cursor-hover {
      transform: translate(-50%, -50%) scale(1.5);
      background-color: #34d399; /* emerald highlight on hover */
      box-shadow: 0 0 12px rgba(52, 211, 153, 0.9);
    }
  `;
  document.head.appendChild(cursorStyle);

  // 2. Inject Cursor HTML Elements
  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "cursor-dot";
  ring.className = "cursor-ring";
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  // 3. Mouse Movement Tracking
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Instant update for precision dot
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  // Smooth trailing animation loop for outer ring
  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18; // Smooth lerp delay
    ringY += (mouseY - ringY) * 0.18;

    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;

    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // 4. Hover Expansion Effect on Interactive Elements
  document.addEventListener("mouseover", (e) => {
    const isInteractive = e.target.closest("button, a, input, label, .quiz-opt-btn, .glass-card");
    if (isInteractive) {
      ring.classList.add("cursor-hover");
      dot.classList.add("cursor-hover");
    } else {
      ring.classList.remove("cursor-hover");
      dot.classList.remove("cursor-hover");
    }
  });
});
