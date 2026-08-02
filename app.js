// --- PATHWAY DATA CONFIGURATION ---
const PATHWAYS = {
  frontend: {
    title: "Frontend Developer Pathway",
    description: "Master modern user interfaces, responsive styling, interactive JS, and production deployment.",
    steps: [
      {
        id: "fe-1",
        title: "HTML5 & Modern CSS3 Architecture",
        duration: "2 - 3 Weeks",
        summary: "Semantic HTML, CSS Grid, Flexbox, layout patterns, and modern responsive design.",
        concepts: ["Semantic HTML", "Flexbox & Grid", "CSS Variables", "Responsive Breakpoints"],
        resources: [
          { name: "MDN Web Docs: HTML & CSS", url: "https://developer.mozilla.org" },
          { name: "CSS Tricks Guide to Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" }
        ],
        project: "Build a responsive personal portfolio webpage from scratch."
      },
      {
        id: "fe-2",
        title: "JavaScript Essentials (ES6+)",
        duration: "3 - 4 Weeks",
        summary: "Core programming concepts, DOM manipulation, events, and asynchronous JS.",
        concepts: ["DOM Manipulation", "Promises & Async/Await", "ES6 Modules", "Fetch API"],
        resources: [
          { name: "JavaScript.info Tutorial", url: "https://javascript.info/" },
          { name: "Eloquent JavaScript", url: "https://eloquentjavascript.net/" }
        ],
        project: "Build an interactive weather dashboard fetching real-time API data."
      },
      {
        id: "fe-3",
        title: "Tailwind CSS & Utility-First UI",
        duration: "1 - 2 Weeks",
        summary: "Rapid styling, component design systems, dark mode, and responsive configurations.",
        concepts: ["Utility Classes", "Tailwind Config", "Dark Mode Styling", "Component Patterns"],
        resources: [
          { name: "Official Tailwind Docs", url: "https://tailwindcss.com/docs" }
        ],
        project: "Redesign a SaaS landing page using Tailwind CSS."
      },
      {
        id: "fe-4",
        title: "React.js Framework Core",
        duration: "4 - 5 Weeks",
        summary: "Component-driven development, state management, hooks, and client-side routing.",
        concepts: ["JSX Markup", "useState & useEffect", "Custom Hooks", "React Router"],
        resources: [
          { name: "React Official Docs", url: "https://react.dev/" }
        ],
        project: "Build an e-commerce platform with persistent cart state."
      },
      {
        id: "fe-5",
        title: "Build Tools, Git & Vercel Deployment",
        duration: "1 - 2 Weeks",
        summary: "Version control workflows with Git, Vite module bundling, and live deployment.",
        concepts: ["Git Workflow", "Vite Config", "CI/CD Deployment", "Vercel Hosting"],
        resources: [
          { name: "Vercel Docs", url: "https://vercel.com/docs" }
        ],
        project: "Deploy all your portfolio projects live with CI/CD integration."
      }
    ]
  },
  backend: {
    title: "Backend Developer Pathway",
    description: "Build scalable server-side APIs, design database architectures, and secure web services.",
    steps: [
      {
        id: "be-1",
        title: "Server Runtimes (Node.js/Python)",
        duration: "3 - 4 Weeks",
        summary: "Understand server runtime environments, event loops, and asynchronous I/O operations.",
        concepts: ["Event Loop", "File System API", "Package Management", "Async I/O"],
        resources: [
          { name: "Node.js Official Documentation", url: "https://nodejs.org/en/docs/" }
        ],
        project: "Build a Node CLI tool for log parsing and automated file organization."
      },
      {
        id: "be-2",
        title: "RESTful API Architecture & Express",
        duration: "3 - 4 Weeks",
        summary: "Designing HTTP endpoints, middleware pipelines, dynamic routing, and input validation.",
        concepts: ["HTTP Methods", "Custom Middleware", "Request Validation", "Error Handling"],
        resources: [
          { name: "Express.js Guide", url: "https://expressjs.com/" }
        ],
        project: "Create a scalable RESTful API service for a content platform."
      },
      {
        id: "be-3",
        title: "Databases: PostgreSQL & MongoDB",
        duration: "4 - 5 Weeks",
        summary: "Relational vs NoSQL database modeling, querying, indexing, and ORMs (Prisma).",
        concepts: ["PostgreSQL & SQL", "MongoDB Documents", "Indexing", "Prisma ORM"],
        resources: [
          { name: "Prisma Documentation", url: "https://www.prisma.io/docs" }
        ],
        project: "Integrate PostgreSQL with Prisma into your REST API."
      },
      {
        id: "be-4",
        title: "Authentication & Web Security",
        duration: "2 - 3 Weeks",
        summary: "Implement JWT tokens, password hashing, OAuth2, CORS policies, and rate-limiting.",
        concepts: ["JWT Auth", "Bcrypt Hashing", "OAuth2 Flow", "OWASP Security"],
        resources: [
          { name: "OWASP Web Security", url: "https://owasp.org/www-project-top-ten/" }
        ],
        project: "Build an auth microservice with login, registration, and refresh tokens."
      }
    ]
  },
  "data-analyst": {
    title: "Data Analyst Pathway",
    description: "Transform raw data into strategic business insights using SQL, Python, and modern dashboard tools.",
    steps: [
      {
        id: "da-1",
        title: "Advanced Data Analysis in Excel",
        duration: "2 Weeks",
        summary: "Master dynamic formulas, XLOOKUP, pivot tables, and statistical modeling.",
        concepts: ["Pivot Tables", "XLOOKUP/VLOOKUP", "Conditional Formulas", "Data Validation"],
        resources: [
          { name: "Excel Data Analysis Hub", url: "https://support.microsoft.com/excel" }
        ],
        project: "Clean and model a multi-year sales dataset to find operational trends."
      },
      {
        id: "da-2",
        title: "SQL Data Querying & Wrangling",
        duration: "3 - 4 Weeks",
        summary: "Extracting, joining, aggregating, and analyzing database tables using SQL.",
        concepts: ["Complex JOINs", "GROUP BY & Aggregations", "Window Functions", "Subqueries"],
        resources: [
          { name: "Mode Analytics SQL Guide", url: "https://mode.com/sql-tutorial/" }
        ],
        project: "Solve business analytical queries on a large e-commerce database."
      },
      {
        id: "da-3",
        title: "Python for Data Science (Pandas/NumPy)",
        duration: "4 Weeks",
        summary: "Programmatic data cleaning, data transformation, and exploratory analysis.",
        concepts: ["DataFrames", "Handling Missing Data", "Data Aggregation", "Matplotlib/Seaborn"],
        resources: [
          { name: "Pandas Docs", url: "https://pandas.pydata.org/" }
        ],
        project: "Perform Exploratory Data Analysis (EDA) on a real-world Kaggle dataset."
      },
      {
        id: "da-4",
        title: "Data Visualization & Dashboards",
        duration: "2 - 3 Weeks",
        summary: "Create executive-ready visual dashboards using Power BI or Tableau.",
        concepts: ["Dashboard UX", "Calculated Measures", "Interactive Filters", "Data Storytelling"],
        resources: [
          { name: "Tableau Public Learning", url: "https://public.tableau.com" }
        ],
        project: "Build an interactive KPI business dashboard for key stakeholders."
      }
    ]
  },
  uiux: {
    title: "UI/UX Designer Pathway",
    description: "Craft human-centered digital experiences through user research, wireframing, and Figma prototyping.",
    steps: [
      {
        id: "ux-1",
        title: "UX Research & User Journeys",
        duration: "2 - 3 Weeks",
        summary: "User interviews, persona creation, user journey mapping, and information architecture.",
        concepts: ["User Personas", "Journey Maps", "Usability Heuristics", "Card Sorting"],
        resources: [
          { name: "Nielsen Norman Group", url: "https://www.nngroup.com/" }
        ],
        project: "Conduct user interviews and design 2 user personas for a new app concept."
      },
      {
        id: "ux-2",
        title: "Figma Prototyping & Design Systems",
        duration: "3 - 4 Weeks",
        summary: "Master Figma Auto Layout, component variants, design tokens, and micro-interactions.",
        concepts: ["Auto Layout", "Component Variants", "Design Systems", "Interactive Prototypes"],
        resources: [
          { name: "Figma Learn Hub", url: "https://www.figma.com/resources/learn/" }
        ],
        project: "Create a high-fidelity interactive prototype for a mobile app in Figma."
      }
    ]
  }
};

// --- APP STATE ---
let currentRole = "frontend";
let completedMap = JSON.parse(localStorage.getItem("pathforge_completed")) || {};
let hasCelebrated = false;

// --- DOM ELEMENTS ---
const roleSelect = document.getElementById("role-select");
const resetBtn = document.getElementById("reset-btn");
const pathwayTitle = document.getElementById("pathway-title");
const pathwayDesc = document.getElementById("pathway-desc");
const stepsContainer = document.getElementById("steps-container");
const progressBar = document.getElementById("progress-bar");
const progressPercent = document.getElementById("progress-percent");
const trophyIcon = document.getElementById("trophy-icon");

const modal = document.getElementById("detail-modal");
const modalBox = document.getElementById("modal-box");
const modalContent = document.getElementById("modal-content");
const closeModalBtn = document.getElementById("close-modal");

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  // Sync select dropdown value with current state
  roleSelect.value = currentRole;

  renderPathway();
  lucide.createIcons();

  // Event Listeners
  roleSelect.addEventListener("change", (e) => {
    currentRole = e.target.value;
    hasCelebrated = false;
    renderPathway();
  });

  resetBtn.addEventListener("click", () => {
    if (confirm("Reset progress across all tech pathways?")) {
      completedMap = {};
      hasCelebrated = false;
      saveProgress();
      renderPathway();
    }
  });

  closeModalBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
});

// --- RENDER PATHWAY ---
function renderPathway() {
  const data = PATHWAYS[currentRole];
  if (!data) return;

  pathwayTitle.textContent = data.title;
  pathwayDesc.textContent = data.description;

  stepsContainer.innerHTML = "";

  data.steps.forEach((step, index) => {
    const isChecked = !!completedMap[step.id];

    const stepCard = document.createElement("div");
    // Stagger animation timing per card
    stepCard.style.animationDelay = `${index * 80}ms`;
    stepCard.className = `animate-fade-in-up p-5 sm:p-6 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
      isChecked 
        ? "bg-slate-900/40 border-emerald-500/40 opacity-90 shadow-lg shadow-emerald-950/20" 
        : "bg-slate-900/80 border-slate-800/80 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-950/20 hover:-translate-y-0.5 backdrop-blur-md"
    }`;

    stepCard.innerHTML = `
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div class="flex items-start gap-4">
          <!-- Animated Checkbox -->
          <label class="relative flex items-center justify-center mt-1 cursor-pointer group">
            <input 
              type="checkbox" 
              data-id="${step.id}" 
              ${isChecked ? "checked" : ""}
              class="step-checkbox peer sr-only"
            />
            <div class="w-6 h-6 rounded-lg border-2 border-slate-700 bg-slate-950 peer-checked:bg-emerald-500 peer-checked:border-emerald-400 flex items-center justify-center transition-all duration-200 group-hover:border-indigo-400">
              <i data-lucide="check" class="w-4 h-4 text-slate-950 stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity"></i>
            </div>
          </label>

          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${isChecked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'} tracking-wide">
                STEP ${index + 1}
              </span>
              <h3 class="font-bold text-lg text-white ${isChecked ? 'line-through text-slate-400' : ''}">
                ${step.title}
              </h3>
            </div>
            <p class="text-sm text-slate-400 mt-1.5 leading-relaxed">${step.summary}</p>
            
            <div class="flex items-center gap-4 mt-3.5 text-xs text-slate-400 font-medium">
              <span class="flex items-center gap-1.5 bg-slate-950/40 px-2.5 py-1 rounded-md border border-slate-800">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-indigo-400"></i> ${step.duration}
              </span>
              <span class="flex items-center gap-1.5 bg-slate-950/40 px-2.5 py-1 rounded-md border border-slate-800">
                <i data-lucide="layers" class="w-3.5 h-3.5 text-cyan-400"></i> ${step.concepts.length} Topics
              </span>
            </div>
          </div>
        </div>

        <button 
          data-id="${step.id}" 
          class="view-detail-btn self-end sm:self-center px-4 py-2.5 bg-slate-800/80 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold rounded-xl transition-all border border-slate-700/80 hover:border-indigo-500 flex items-center gap-2 whitespace-nowrap shadow-sm"
        >
          <i data-lucide="book-open" class="w-3.5 h-3.5"></i> View Details
        </button>
      </div>
    `;

    stepsContainer.appendChild(stepCard);
  });

  lucide.createIcons();
  bindStepEvents();
  updateProgress();
}

function bindStepEvents() {
  document.querySelectorAll(".step-checkbox").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const stepId = e.target.getAttribute("data-id");
      completedMap[stepId] = e.target.checked;
      saveProgress();
      renderPathway();
    });
  });

  document.querySelectorAll(".view-detail-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const stepId = e.currentTarget.getAttribute("data-id");
      openModal(stepId);
    });
  });
}

// --- UPDATE PROGRESS & TRIGGER CONFETTI ---
function updateProgress() {
  const steps = PATHWAYS[currentRole].steps;
  const completedCount = steps.filter((s) => completedMap[s.id]).length;
  const percentage = Math.round((completedCount / steps.length) * 100) || 0;

  progressBar.style.width = `${percentage}%`;
  progressPercent.textContent = `${percentage}%`;

  if (percentage === 100) {
    trophyIcon.className = "p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-bounce";
    if (!hasCelebrated) {
      triggerConfetti();
      hasCelebrated = true;
    }
  } else {
    trophyIcon.className = "p-2 rounded-lg bg-slate-800 text-slate-500";
  }
}

function triggerConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function saveProgress() {
  localStorage.setItem("pathforge_completed", JSON.stringify(completedMap));
}

// --- MODAL CONTROLS ---
function openModal(stepId) {
  const step = PATHWAYS[currentRole].steps.find((s) => s.id === stepId);
  if (!step) return;

  modalContent.innerHTML = `
    <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
      Resource & Capstone Guide
    </span>
    <h3 class="text-2xl font-bold text-white mt-2">${step.title}</h3>
    <p class="text-sm text-slate-400 leading-relaxed">${step.summary}</p>

    <div class="mt-4">
      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-400"></i> Core Concepts
      </h4>
      <div class="flex flex-wrap gap-2">
        ${step.concepts.map((c) => `<span class="bg-slate-950 text-slate-300 text-xs px-3 py-1 rounded-lg border border-slate-800 font-medium">${c}</span>`).join("")}
      </div>
    </div>

    <div class="mt-4">
      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
        <i data-lucide="link" class="w-3.5 h-3.5 text-cyan-400"></i> Recommended Resources
      </h4>
      <ul class="space-y-2 text-sm">
        ${step.resources.map((r) => `
          <li>
            <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300 transition hover:underline inline-flex items-center gap-1.5 font-medium">
              ${r.name} <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </li>
        `).join("")}
      </ul>
    </div>

    <div class="mt-5 p-4 bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-xl relative overflow-hidden">
      <h4 class="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
        <i data-lucide="code-2" class="w-4 h-4 text-indigo-400"></i> Capstone Project Prompt
      </h4>
      <p class="text-xs text-slate-300 leading-relaxed">${step.project}</p>
    </div>
  `;

  lucide.createIcons();
  modal.classList.remove("opacity-0", "pointer-events-none");
  modalBox.classList.add("animate-pop-in");
}

function closeModal() {
  modal.classList.add("opacity-0", "pointer-events-none");
  modalBox.classList.remove("animate-pop-in");
}
