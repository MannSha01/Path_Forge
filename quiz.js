// 1. QUIZ DATASET
const QUIZ_QUESTIONS = [
  {
    question: "1. What sounds like the most fun thing to build or work on?",
    options: [
      { text: "🎨 Designing clean visual interfaces and mobile app layouts", category: "non-tech", roleId: "uiux-designer" },
      { text: "💻 Writing code to make websites interactive and responsive", category: "tech", roleId: "frontend" },
      { text: "⚙️ Building server-side APIs, logic, and database schemas", category: "tech", roleId: "backend" },
      { text: "🚀 Planning a new app idea, user strategy, and feature list", category: "non-tech", roleId: "product-manager" }
    ]
  },
  {
    question: "2. How do you prefer to solve problems day-to-day?",
    options: [
      { text: "🎧 Deep focus mode: Writing logic, fixing bugs, or building APIs", category: "tech", roleId: "backend" },
      { text: "✏️ Creative mode: Sketching ideas, choosing colors, and user testing", category: "non-tech", roleId: "uiux-designer" },
      { text: "💬 People mode: Helping team members, running catch-ups, and organizing tasks", category: "non-tech", roleId: "product-manager" },
      { text: "🌐 Fullstack mode: Working on both frontend interfaces & database logic", category: "tech", roleId: "fullstack" }
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
      { text: "Server infrastructure, database optimization, and APIs", category: "tech", roleId: "backend" },
      { text: "Launching new digital software products", category: "non-tech", roleId: "product-manager" }
    ]
  },
  {
    question: "5. What is your primary career goal right now?",
    options: [
      { text: "Become a Frontend Web Developer", category: "tech", roleId: "frontend" },
      { text: "Become a Product UI/UX Designer", category: "non-tech", roleId: "uiux-designer" },
      { text: "Become a Product Manager", category: "non-tech", roleId: "product-manager" },
      { text: "Become a Backend or Fullstack Engineer", category: "tech", roleId: "backend" }
    ]
  }
];

let quizAnswers = [];
let currentQuizStep = 0;

// 2. MAIN INITIALIZATION
function initPathForgeModule() {
  if (document.getElementById("pathforge-quiz-modal")) return;

  const modalHTML = `
    <div id="pathforge-quiz-modal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-300">
      <div id="pf-modal-box" class="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 relative shadow-2xl">
        <button id="close-modal-quiz" class="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer text-xl font-bold">
          ✕
        </button>
        <div id="modal-content-quiz" class="mt-2"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("#trigger-quiz-btn, #top-banner-quiz-btn, .trigger-quiz-btn, [data-action='open-quiz']");
    if (trigger) {
      e.preventDefault();
      openQuizModal();
    }

    if (e.target.closest("#close-modal-quiz")) {
      closeQuizModal();
    }

    const modal = document.getElementById("pathforge-quiz-modal");
    if (modal && e.target === modal) {
      closeQuizModal();
    }
  });

  initCustomCursor();
}

// 3. SAFE CUSTOM CURSOR (Failsafe against hiding default cursor entirely)
function initCustomCursor() {
  if (document.getElementById("custom-cursor-dot") || window.innerWidth < 768) return;

  const style = document.createElement("style");
  style.id = "custom-cursor-styles";
  style.innerHTML = `
    @media (pointer: fine) {
      #custom-cursor-dot {
        position: fixed; top: 0; left: 0; width: 8px; height: 8px;
        background-color: #818cf8; border-radius: 50%; pointer-events: none;
        z-index: 999999; transform: translate(-50%, -50%);
        transition: transform 0.15s ease-out, background-color 0.2s;
        box-shadow: 0 0 10px rgba(129, 140, 248, 0.8);
      }
      #custom-cursor-ring {
        position: fixed; top: 0; left: 0; width: 36px; height: 36px;
        border: 1.5px solid rgba(129, 140, 248, 0.5); border-radius: 50%;
        pointer-events: none; z-index: 999998; transform: translate(-50%, -50%);
        transition: width 0.2s ease, height 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
      }
      #custom-cursor-ring.cursor-hover {
        width: 52px; height: 52px; background-color: rgba(99, 102, 241, 0.15);
        border-color: #a5b4fc; box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
      }
    }
  `;
  document.head.appendChild(style);

  const dot = document.createElement("div");
  dot.id = "custom-cursor-dot";
  const ring = document.createElement("div");
  ring.id = "custom-cursor-ring";
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.2;
    ringY += (mouseY - ringY) * 0.2;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }
  animateRing();
}

// 4. QUIZ LOGIC
function openQuizModal() {
  quizAnswers = [];
  currentQuizStep = 0;
  renderQuizQuestion();
  const modal = document.getElementById("pathforge-quiz-modal");
  if (modal) {
    modal.classList.remove("opacity-0", "pointer-events-none");
    document.body.style.overflow = "hidden";
  }
}

function closeQuizModal() {
  const modal = document.getElementById("pathforge-quiz-modal");
  if (modal) {
    modal.classList.add("opacity-0", "pointer-events-none");
    document.body.style.overflow = "auto";
  }
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

  container.querySelectorAll(".quiz-opt-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
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

  // Pull roles directly from CAREER_DATA
  const dataStore = typeof CAREER_DATA !== "undefined" ? CAREER_DATA : (typeof PATHWAYS_DATA !== "undefined" ? PATHWAYS_DATA : {});
  const allRoles = [];

  Object.keys(dataStore).forEach((catKey) => {
    const rolesArray = Array.isArray(dataStore[catKey]) ? dataStore[catKey] : (dataStore[catKey].roles || []);
    rolesArray.forEach((r) => {
      allRoles.push({ ...r, category: catKey });
    });
  });

  allRoles.sort((a, b) => (roleScores[b.id] || 0) - (roleScores[a.id] || 0));
  const topMatches = allRoles.length > 0 ? allRoles.slice(0, 2) : [];

  if (topMatches.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4 space-y-3">
        <h3 class="text-lg font-bold text-white">Quiz Completed!</h3>
        <p class="text-xs text-slate-400">Explore our available pathways from the main screen to get started.</p>
        <button onclick="closeQuizModal()" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">Close</button>
      </div>
    `;
    return;
  }

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
            <p class="text-xs text-slate-400 mt-0.5">${role.desc || role.tagline || ''}</p>
          </div>

          <button data-role-id="${role.id}" data-category="${role.category}" class="select-quiz-option-btn w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition cursor-pointer">
            Select & Start Pathway →
          </button>
        </div>
      `).join("")}
    </div>
  `;

  container.querySelectorAll(".select-quiz-option-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const targetRoleId = e.currentTarget.getAttribute("data-role-id");
      const targetCategory = e.currentTarget.getAttribute("data-category");
      
      closeQuizModal();

      if (typeof selectCategory === "function") selectCategory(targetCategory);
      if (typeof selectRole === "function") selectRole(targetRoleId); // Pass string ID!
    });
  });
}

// 5. TRIGGER EXECUTION SAFELY
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPathForgeModule);
} else {
  initPathForgeModule();
}
