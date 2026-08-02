
// --- LOADING SCREEN CONTROLLER ---
window.addEventListener("load", () => {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        loadingScreen.remove();
      }, 700);
    }, 600);
  }
});

// --- DATASET: BEGINNER-FRIENDLY PATHWAYS ---
const PATHWAYS_DATA = {
  tech: {
    categoryName: "Tech & Coding",
    roles: [
      {
        id: "frontend",
        title: "Frontend Developer",
        icon: "layout",
        tagline: "Build the visual parts of websites that people see and interact with every day.",
        steps: [
          {
            id: "tech-fe-1",
            title: "Web Page Basics: HTML & CSS",
            duration: "2 - 3 Weeks",
            summary: "Learn how to put text, buttons, and images on a screen, and color them so they look great on phones and laptops.",
            whyMatters: "Without this, websites would just be boring black-and-white text documents with no buttons or layout!",
            concepts: ["Page Structure (HTML)", "Colors & Fonts (CSS)", "Mobile Layouts"],
            syllabus: [
              "Week 1: Creating your first web page with titles, paragraphs, buttons, and pictures.",
              "Week 2: Adding colors, custom fonts, and arranging elements neatly side-by-side.",
              "Week 3: Making your website automatically adjust its size so it works on phone screens."
            ],
            resources: [
              { name: "freeCodeCamp HTML/CSS for Beginners", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" },
              { name: "MDN Beginner's Web Guide", url: "https://developer.mozilla.org" }
            ],
            project: "Build a personalized digital profile page about your favorite hobbies."
          },
          {
            id: "tech-fe-2",
            title: "Making Pages Interactive: JavaScript",
            duration: "3 - 4 Weeks",
            summary: "Give your web pages a 'brain' so buttons actually do things when clicked, forms process input, and popups appear.",
            whyMatters: "This turns a static picture of a website into an interactive app you can actually use.",
            concepts: ["Click Events", "Storing Information (Variables)", "Fetching Live Data"],
            syllabus: [
              "Week 1: How code makes decisions (if/else) and stores user details like names or scores.",
              "Week 2: Reacting when a user clicks a button, types text, or scrolls down.",
              "Week 3: Fetching live data from the internet (like getting today's real weather)."
            ],
            resources: [
              { name: "JavaScript.info Easy Guide", url: "https://javascript.info/" },
              { name: "Scrimba Interactive JavaScript Course", url: "https://scrimba.com/learn/learnjavascript" }
            ],
            project: "Build a simple weather app that shows today's temperature when you type in a city name."
          },
          {
            id: "tech-fe-3",
            title: "Fast & Easy Styling: Tailwind CSS",
            duration: "1 - 2 Weeks",
            summary: "Learn a modern tool used by professional developers to style apps in minutes without writing repetitive CSS rules.",
            whyMatters: "Saves you hours of time and helps you create slick dark-mode themes effortlessly.",
            concepts: ["Pre-made Style Tags", "Dark Mode Toggle", "Speedy Layouts"],
            syllabus: [
              "Week 1: Styling buttons, cards, and navigation bars instantly using simple shorthand tags.",
              "Week 2: Creating a sleek Dark Mode button that flips your site from light to dark."
            ],
            resources: [
              { name: "Tailwind CSS Quick Start Guide", url: "https://tailwindcss.com/docs" }
            ],
            project: "Recreate the layout of your favorite app homepage (like Spotify or Twitter)."
          },
          {
            id: "tech-fe-4",
            title: "Building Modern Web Apps: React",
            duration: "4 Weeks",
            summary: "Learn the #1 tool used by Airbnb, Netflix, and Instagram to build lightning-fast web applications.",
            whyMatters: "React lets you build reusable Lego-like pieces (components) so you don't have to rewrite code over and over.",
            concepts: ["Lego-block Components", "App Memory (State)", "Multi-page Links"],
            syllabus: [
              "Week 1: Breaking a web page into small reusable pieces (like headers, cards, and buttons).",
              "Week 2: Teaching components to 'remember' things (like items added to a shopping cart).",
              "Week 3: Switching between pages smoothly without reloading the entire web browser.",
              "Week 4: Combining everything into one polished app."
            ],
            resources: [
              { name: "React Official Interactive Tutorial", url: "https://react.dev/learn" }
            ],
            project: "Build an online store prototype where users can browse products and add them to a cart."
          }
        ]
      },
      {
        id: "backend",
        title: "Backend Developer",
        icon: "server",
        tagline: "Build the behind-the-scenes engine that stores user data, powers logins, and processes security.",
        steps: [
          {
            id: "tech-be-1",
            title: "The Server Brain: Node.js",
            duration: "3 Weeks",
            summary: "Understand how computers process user requests behind the scenes outside of a web browser.",
            whyMatters: "The frontend is what users see; the backend is the invisible server engine that handles all the actual work.",
            concepts: ["How Servers Work", "Reading Files", "Handling Requests"],
            syllabus: [
              "Week 1: What is a server, and how does it talk to internet browsers?",
              "Week 2: Writing code to read, write, and organize files on a computer server.",
              "Week 3: Listening for visits from users and sending back messages."
            ],
            resources: [
              { name: "Node.js Beginner Guide", url: "https://nodejs.org/en/docs/" }
            ],
            project: "Build a miniature server that logs visits and sends back dynamic messages."
          },
          {
            id: "tech-be-2",
            title: "Connecting Front to Back: APIs",
            duration: "3 Weeks",
            summary: "Create secure pathways (APIs) so mobile phones and web apps can talk to your server software.",
            whyMatters: "An API is like a waiter in a restaurant—it takes orders from the user and brings back data from the kitchen.",
            concepts: ["API Endpoints", "Receiving Data", "Error Catching"],
            syllabus: [
              "Week 1: Creating digital 'countertops' where apps can send requests for info.",
              "Week 2: Checking incoming messages to make sure users sent the right information.",
              "Week 3: Handling broken requests gracefully so the app doesn't crash."
            ],
            resources: [
              { name: "FreeCodeCamp API Primer", url: "https://www.freecodecamp.org/news/free-node-js-course-express-and-mongodb/" }
            ],
            project: "Create a backend service for a notebook app where users can create, edit, and delete notes."
          },
          {
            id: "tech-be-3",
            title: "Saving App Data: Databases",
            duration: "4 Weeks",
            summary: "Learn how apps store user accounts, passwords, posts, and order histories safely forever.",
            whyMatters: "Without a database, your app forgets everything as soon as you refresh the page!",
            concepts: ["Digital Filing Cabinets", "Database Searching", "Prisma Connector"],
            syllabus: [
              "Week 1: Organizing data into tidy digital spreadsheets (tables and columns).",
              "Week 2: Writing searches to find specific rows (like 'find all users who joined today').",
              "Week 3: Using a helper tool (Prisma) to connect your code directly to the database.",
              "Week 4: Saving, updating, and deleting database records securely."
            ],
            resources: [
              { name: "Prisma Database Guide for Beginners", url: "https://www.prisma.io/docs" }
            ],
            project: "Connect a user database to your API so user signups get stored permanently."
          }
        ]
      },
      {
        id: "fullstack",
        title: "Fullstack Developer",
        icon: "code",
        tagline: "Master both the front user interface and the backend database server to build complete products.",
        steps: [
          {
            id: "tech-fs-1",
            title: "All-in-One App Building: Next.js",
            duration: "4 Weeks",
            summary: "Combine screen layouts and database servers into one unified, super-powered modern framework.",
            whyMatters: "Allows a single developer to build fully functional web applications by themselves.",
            concepts: ["Fullstack Framework", "Fast Page Loading", "Server Actions"],
            syllabus: [
              "Week 1: Creating pages and nested sub-pages effortlessly with modern routing.",
              "Week 2: Pre-loading data on the server so pages load instantly for users.",
              "Week 3: Connecting web forms directly to databases without complex setup.",
              "Week 4: Deploying your app live onto the web for the world to see."
            ],
            resources: [
              { name: "Next.js Interactive Learn Portal", url: "https://nextjs.org/learn" }
            ],
            project: "Build a complete community message board where people can write public posts."
          },
          {
            id: "tech-fs-2",
            title: "User Accounts & Logins",
            duration: "2 Weeks",
            summary: "Safely allow users to sign up, log in, encrypt passwords, and protect private profile pages.",
            whyMatters: "Keeps user information private and protects accounts from hackers.",
            concepts: ["Password Protection", "Log In / Log Out", "Google Sign-In"],
            syllabus: [
              "Week 1: Encrypting user passwords so no one can steal them.",
              "Week 2: Adding 'Sign in with Google' and protecting secret user pages."
            ],
            resources: [
              { name: "Auth0 Security Basics", url: "https://auth0.com/docs" }
            ],
            project: "Add a full login system with password protection to your message board app."
          }
        ]
      },
      {
        id: "data-analyst",
        title: "Data Analyst",
        icon: "bar-chart-3",
        tagline: "Turn numbers and spreadsheets into easy charts to answer big business questions.",
        steps: [
          {
            id: "tech-da-1",
            title: "Asking Questions with SQL",
            duration: "3 Weeks",
            summary: "Learn the universal language used to ask giant databases for specific numbers and answers.",
            whyMatters: "SQL allows you to instantly search through millions of customer sales in seconds.",
            concepts: ["Filtering Rows", "Combining Tables", "Calculating Totals"],
            syllabus: [
              "Week 1: Filtering database lists to find specific items (e.g., 'orders over $50').",
              "Week 2: Stitching two tables together (e.g., matching Customer Names with their Orders).",
              "Week 3: Finding averages, totals, and peak sales months automatically."
            ],
            resources: [
              { name: "Mode Analytics Free SQL Course", url: "https://mode.com/sql-tutorial/" }
            ],
            project: "Analyze a real online store sales report to figure out their top 3 bestselling items."
          }
        ]
      }
    ]
  },
  "non-tech": {
    categoryName: "Design & Product",
    roles: [
      {
        id: "uiux-designer",
        title: "UI/UX Designer",
        icon: "palette",
        tagline: "Design intuitive screens, app prototypes, and beautiful user experiences using Figma.",
        steps: [
          {
            id: "nontech-ux-1",
            title: "Understanding Users & Wireframes",
            duration: "2 - 3 Weeks",
            summary: "Interview real people to learn what bugs them about existing apps, then draw simple visual blueprints.",
            whyMatters: "Prevents teams from wasting months building an app nobody actually wants or understands.",
            concepts: ["User Interviews", "Rough Blueprint Layouts", "App Flows"],
            syllabus: [
              "Week 1: Talking to people to discover their biggest pain points when using apps.",
              "Week 2: Drawing rough pen-and-paper outlines (wireframes) of screen ideas.",
              "Week 3: Mapping out the step-by-step clicks a user takes to complete a task."
            ],
            resources: [
              { name: "Nielsen Norman Group UX Basics", url: "https://www.nngroup.com/" }
            ],
            project: "Sketch rough layout blueprints for a mobile app that helps people track daily hydration."
          }
        ]
      },
      {
        id: "product-manager",
        title: "Product Manager",
        icon: "kanban",
        tagline: "Guide app vision, guide team priorities, and make sure projects finish on schedule.",
        steps: [
          {
            id: "nontech-pm-1",
            title: "Product Strategy & Feature Choices",
            duration: "2 - 3 Weeks",
            summary: "Figure out what app features to build first, research competitors, and write clear task instructions.",
            whyMatters: "Keeps designers, coders, and business leads working on the exact same goals together.",
            concepts: ["Competitor Spotting", "Prioritizing Ideas", "Feature Blueprints"],
            syllabus: [
              "Week 1: Studying competitor apps to find missed opportunities.",
              "Week 2: Deciding which feature ideas are MUST-HAVES versus 'nice-to-haves'.",
              "Week 3: Writing simple, clear feature requests for designers and developers."
            ],
            resources: [
              { name: "Product School Free Resources", url: "https://productschool.com/free-product-management-resources" }
            ],
            project: "Write a 1-page proposal outlining an exciting new feature idea for your favorite mobile app."
          }
        ]
      }
    ]
  }
};

// --- QUIZ QUESTIONS DATASET ---
const QUIZ_QUESTIONS = [
  {
    question: "What kind of activity sounds most fun to you?",
    options: [
      { text: "Designing screen layouts, choosing colors, and making things look visual", category: "non-tech", roleId: "uiux-designer" },
      { text: "Building website pages, writing basic code, or creating interactive buttons", category: "tech", roleId: "frontend" },
      { text: "Searching through data to spot trends, charts, and patterns", category: "tech", roleId: "data-analyst" },
      { text: "Planning project roadmaps, organizing team tasks, and brainstorm features", category: "non-tech", roleId: "product-manager" }
    ]
  },
  {
    question: "How do you feel about writing computer code?",
    options: [
      { text: "I want to learn step-by-step programming from total scratch!", category: "tech", roleId: "frontend" },
      { text: "I prefer using visual design software (like Figma) with no heavy code.", category: "non-tech", roleId: "uiux-designer" },
      { text: "I like organizing data, numbers, and logical spreadsheets.", category: "tech", roleId: "data-analyst" },
      { text: "I like high-level strategy, product ideas, and team management.", category: "non-tech", roleId: "product-manager" }
    ]
  }
];

// --- APP STATE ---
let currentCategory = null; 
let currentRole = null;     
let completedMap = JSON.parse(localStorage.getItem("pathforge_completed")) || {};
let quizAnswers = [];
let currentQuizStep = 0;
let hasCelebrated = false;

// --- DOM ELEMENTS ---
const viewLanding = document.getElementById("view-landing");
const viewRoles = document.getElementById("view-roles");
const viewRoadmap = document.getElementById("view-roadmap");

const navBackBtn = document.getElementById("nav-back-btn");
const backBtnText = document.getElementById("back-btn-text");
const logoBtn = document.getElementById("logo-btn");
const resetBtn = document.getElementById("reset-btn");

const startHeroBtn = document.getElementById("start-hero-btn");
const triggerQuizBtn = document.getElementById("trigger-quiz-btn");
const topBannerQuizBtn = document.getElementById("top-banner-quiz-btn");

const roleCategoryBadge = document.getElementById("role-category-badge");
const roleCategoryTitle = document.getElementById("role-category-title");
const rolesGrid = document.getElementById("roles-grid");

const roadmapDomainTag = document.getElementById("roadmap-domain-tag");
const pathwayTitle = document.getElementById("pathway-title");
const pathwayDesc = document.getElementById("pathway-desc");
const stepsContainer = document.getElementById("steps-container");
const progressBar = document.getElementById("progress-bar");
const progressPercent = document.getElementById("progress-percent");
const trophyContainer = document.getElementById("trophy-container");

const modal = document.getElementById("detail-modal");
const modalBox = document.getElementById("modal-box");
const modalContent = document.getElementById("modal-content");
const closeModalBtn = document.getElementById("close-modal");

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();

  if (logoBtn) logoBtn.addEventListener("click", showLandingView);

  if (startHeroBtn) {
    startHeroBtn.addEventListener("click", () => selectCategory("tech"));
  }
  if (triggerQuizBtn) {
    triggerQuizBtn.addEventListener("click", openQuizModal);
  }
  if (topBannerQuizBtn) {
    topBannerQuizBtn.addEventListener("click", openQuizModal);
  }

  if (navBackBtn) {
    navBackBtn.addEventListener("click", () => {
      if (viewRoadmap && !viewRoadmap.classList.contains("hidden")) {
        selectCategory(currentCategory || "tech");
      } else {
        showLandingView();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Reset completion status across all career pathways?")) {
        completedMap = {};
        hasCelebrated = false;
        saveProgress();
        if (currentRole) renderRoadmap();
      }
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
});

// --- NAVIGATION & VIEWS ---
function showLandingView() {
  currentCategory = null;
  currentRole = null;

  if (viewLanding) viewLanding.classList.remove("hidden");
  if (viewRoles) viewRoles.classList.add("hidden");
  if (viewRoadmap) viewRoadmap.classList.add("hidden");

  if (navBackBtn) navBackBtn.classList.add("hidden");
}

function selectCategory(categoryKey) {
  currentCategory = categoryKey;
  const categoryData = PATHWAYS_DATA[categoryKey];
  if (!categoryData) return;

  if (roleCategoryBadge) roleCategoryBadge.textContent = `Track: ${categoryData.categoryName}`;
  if (roleCategoryTitle) roleCategoryTitle.textContent = `Pick Your Career Goal`;

  if (rolesGrid) {
    rolesGrid.innerHTML = "";

    categoryData.roles.forEach((role) => {
      const card = document.createElement("button");
      card.className = "glass-card p-6 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 border border-slate-800 hover:border-indigo-500/50 flex flex-col justify-between space-y-4 group";
      
      card.innerHTML = `
        <div>
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <i data-lucide="${role.icon || 'compass'}" class="w-5 h-5"></i>
          </div>
          <h3 class="text-lg font-bold text-white group-hover:text-indigo-300 transition">${role.title}</h3>
          <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">${role.tagline}</p>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 w-full text-xs">
          <span class="text-slate-500 font-medium">${role.steps.length} Easy Milestones</span>
          <span class="text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
            Start Learning <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          </span>
        </div>
      `;

      card.addEventListener("click", () => selectRole(role));
      rolesGrid.appendChild(card);
    });
  }

  if (window.lucide) lucide.createIcons();

  if (viewLanding) viewLanding.classList.add("hidden");
  if (viewRoles) viewRoles.classList.remove("hidden");
  if (viewRoadmap) viewRoadmap.classList.add("hidden");

  if (backBtnText) backBtnText.textContent = "Home";
  if (navBackBtn) navBackBtn.classList.remove("hidden");
}

function selectRole(role) {
  currentRole = role;
  hasCelebrated = false;

  renderRoadmap();

  if (viewLanding) viewLanding.classList.add("hidden");
  if (viewRoles) viewRoles.classList.add("hidden");
  if (viewRoadmap) viewRoadmap.classList.remove("hidden");

  if (backBtnText) backBtnText.textContent = "Roles";
  if (navBackBtn) navBackBtn.classList.remove("hidden");
}

// --- RENDER ROADMAP & PROGRESS ---
function renderRoadmap() {
  if (!currentRole) return;

  if (roadmapDomainTag) roadmapDomainTag.textContent = PATHWAYS_DATA[currentCategory].categoryName;
  if (pathwayTitle) pathwayTitle.textContent = currentRole.title;
  if (pathwayDesc) pathwayDesc.textContent = currentRole.tagline;

  if (stepsContainer) {
    stepsContainer.innerHTML = "";

    currentRole.steps.forEach((step, index) => {
      const isChecked = !!completedMap[step.id];

      const stepCard = document.createElement("div");
      stepCard.className = "relative group flex items-start gap-4 sm:gap-6";

      stepCard.innerHTML = `
        <!-- Node Checkbox -->
        <label class="relative z-10 flex items-center justify-center -ml-[31px] sm:-ml-[39px] mt-4 cursor-pointer" title="Click to mark milestone as done">
          <input 
            type="checkbox" 
            data-id="${step.id}" 
            ${isChecked ? "checked" : ""}
            class="step-checkbox sr-only"
          />
          <div class="w-8 h-8 rounded-full bg-slate-950 border-2 ${isChecked ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'border-indigo-500/50 text-indigo-400 group-hover:border-indigo-400'} flex items-center justify-center transition-all duration-300">
            ${isChecked 
              ? '<i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>' 
              : `<span class="text-xs font-bold">${index + 1}</span>`
            }
          </div>
        </label>

        <!-- Glass Step Card -->
        <div class="glass-card flex-1 p-5 sm:p-6 rounded-2xl transition-all duration-300 ${isChecked ? 'opacity-75 border-emerald-500/30' : ''}">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1.5">
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isChecked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'} uppercase tracking-wider">
                  Milestone ${index + 1}
                </span>
                <h3 class="text-base sm:text-lg font-bold text-white ${isChecked ? 'line-through text-slate-400' : ''}">
                  ${step.title}
                </h3>
              </div>

              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">${step.summary}</p>

              <!-- WHY THIS MATTERS CALLOUT (ELI5) -->
              <div class="mt-2.5 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-start gap-2">
                <i data-lucide="lightbulb" class="w-4 h-4 text-amber-400 shrink-0 mt-0.5"></i>
                <p class="text-xs text-indigo-200">
                  <strong class="text-amber-300">Why this matters:</strong> ${step.whyMatters}
                </p>
              </div>

              <div class="flex items-center gap-4 mt-3 text-xs text-slate-400 font-medium">
                <span class="inline-flex items-center gap-1.5 bg-slate-950/50 px-2.5 py-1 rounded-lg border border-slate-800">
                  <i data-lucide="clock" class="w-3.5 h-3.5 text-indigo-400"></i> Estimated: ${step.duration}
                </span>
                <span class="inline-flex items-center gap-1.5 bg-slate-950/50 px-2.5 py-1 rounded-lg border border-slate-800">
                  <i data-lucide="book-open" class="w-3.5 h-3.5 text-cyan-400"></i> ${step.resources ? step.resources.length : 0} Free Guides
                </span>
              </div>
            </div>

            <!-- Toggle Expand Button -->
            <button 
              data-target="expand-${step.id}" 
              class="toggle-details-btn self-end sm:self-center px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition border border-slate-700/80 hover:border-indigo-500 flex items-center gap-2 whitespace-nowrap shadow-sm group/btn"
            >
              <i data-lucide="book-open-check" class="w-3.5 h-3.5"></i>
              <span class="btn-label">View Simple Breakdown</span>
              <i data-lucide="chevron-down" class="w-3.5 h-3.5 chevron-icon transition-transform duration-300"></i>
            </button>
          </div>

          <!-- COLLAPSIBLE EXPANDED DETAILS SECTION -->
          <div id="expand-${step.id}" class="hidden mt-5 pt-5 border-t border-slate-800/80 space-y-4 transition-all">
            
            ${step.syllabus && step.syllabus.length ? `
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-1.5">
                  <i data-lucide="calendar" class="w-3.5 h-3.5 text-indigo-400"></i> Step-by-Step Learning Plan
                </h4>
                <ul class="space-y-1.5 pl-1">
                  ${step.syllabus.map(item => `
                    <li class="text-xs text-slate-300 flex items-start gap-2">
                      <span class="text-indigo-400 font-bold">•</span>
                      <span>${item}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}

            ${step.concepts && step.concepts.length ? `
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                  <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-400"></i> Key Skills You Will Pick Up
                </h4>
                <div class="flex flex-wrap gap-1.5">
                  ${step.concepts.map(c => `<span class="bg-slate-950 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg border border-slate-800 font-medium">${c}</span>`).join('')}
                </div>
              </div>
            ` : ''}

            ${step.resources && step.resources.length ? `
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                  <i data-lucide="external-link" class="w-3.5 h-3.5 text-cyan-400"></i> Beginner Free Tutorials
                </h4>
                <div class="flex flex-wrap gap-2">
                  ${step.resources.map(r => `
                    <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-950/30 border border-cyan-800/50 hover:border-cyan-500 px-3 py-1.5 rounded-lg transition font-medium">
                      <i data-lucide="link" class="w-3 h-3"></i> ${r.name}
                    </a>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${step.project ? `
              <div class="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/20 flex items-start gap-3">
                <i data-lucide="trophy" class="w-5 h-5 text-amber-400 shrink-0 mt-0.5"></i>
                <div>
                  <h5 class="text-xs font-bold text-amber-300 uppercase tracking-wider">Beginner Hands-On Practice Project</h5>
                  <p class="text-xs text-slate-300 mt-1">${step.project}</p>
                </div>
              </div>
            ` : ''}

          </div>
        </div>
      `;

      stepsContainer.appendChild(stepCard);
    });

    // Attach step event listeners
    document.querySelectorAll(".step-checkbox").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const id = e.target.getAttribute("data-id");
        completedMap[id] = e.target.checked;
        saveProgress();
        renderRoadmap();
      });
    });

    document.querySelectorAll(".toggle-details-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        const targetEl = document.getElementById(targetId);
        const chevron = btn.querySelector(".chevron-icon");
        const label = btn.querySelector(".btn-label");

        if (targetEl) {
          const isHidden = targetEl.classList.contains("hidden");
          if (isHidden) {
            targetEl.classList.remove("hidden");
            if (chevron) chevron.classList.add("rotate-180");
            if (label) label.textContent = "Hide Breakdown";
          } else {
            targetEl.classList.add("hidden");
            if (chevron) chevron.classList.remove("rotate-180");
            if (label) label.textContent = "View Simple Breakdown";
          }
        }
      });
    });
  }

  updateProgress();
  if (window.lucide) lucide.createIcons();
}

// --- ENHANCED BEGINNER-FRIENDLY PROGRESS TRACKER ---
function updateProgress() {
  if (!currentRole) return;

  const total = currentRole.steps.length;
  const completedCount = currentRole.steps.filter((s) => completedMap[s.id]).length;
  const percentage = Math.round((completedCount / total) * 100);

  if (progressBar) progressBar.style.width = `${percentage}%`;
  
  if (progressPercent) {
    let friendlyStatus = `${completedCount} of ${total} Milestones Done (${percentage}%)`;
    if (percentage === 100) {
      friendlyStatus = `🎉 Pathway Mastered! (100%)`;
    } else if (percentage > 0) {
      friendlyStatus = `🚀 ${completedCount}/${total} Done (${percentage}%) - Keep Going!`;
    }
    progressPercent.textContent = friendlyStatus;
  }

  if (percentage === 100 && !hasCelebrated) {
    hasCelebrated = true;
    if (trophyContainer) {
      trophyContainer.classList.remove("hidden");
      trophyContainer.classList.add("animate-bounce");
    }
  } else if (percentage < 100 && trophyContainer) {
    trophyContainer.classList.add("hidden");
  }
}

function saveProgress() {
  localStorage.setItem("pathforge_completed", JSON.stringify(completedMap));
}

// --- QUIZ MODAL CONTROLLER ---
function openQuizModal() {
  currentQuizStep = 0;
  quizAnswers = [];
  renderQuizStep();
  openModal();
}

function renderQuizStep() {
  if (!modalContent) return;

  if (currentQuizStep >= QUIZ_QUESTIONS.length) {
    const recommendedRole = recommendRole(quizAnswers);
    modalContent.innerHTML = `
      <div class="text-center space-y-4 py-4">
        <div class="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
          <i data-lucide="sparkles" class="w-8 h-8 animate-pulse"></i>
        </div>
        <h3 class="text-2xl font-black text-white">Your Career Pathway Match</h3>
        <p class="text-sm text-slate-300">Based on what you enjoy doing, here is the perfect starting role:</p>

        <div class="glass-card p-5 rounded-2xl border border-indigo-500/40 my-4 text-left">
          <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-400">${recommendedRole.categoryName}</span>
          <h4 class="text-xl font-bold text-white mt-1">${recommendedRole.role.title}</h4>
          <p class="text-xs text-slate-300 mt-2">${recommendedRole.role.tagline}</p>
        </div>

        <button id="apply-quiz-role-btn" class="w-full py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg transition">
          Start Learning This Pathway
        </button>
      </div>
    `;

    document.getElementById("apply-quiz-role-btn")?.addEventListener("click", () => {
      closeModal();
      selectCategory(recommendedRole.categoryKey);
      selectRole(recommendedRole.role);
    });

    if (window.lucide) lucide.createIcons();
    return;
  }

  const q = QUIZ_QUESTIONS[currentQuizStep];
  modalContent.innerHTML = `
    <div class="space-y-5">
      <div class="flex items-center justify-between text-xs text-slate-400">
        <span>Question ${currentQuizStep + 1} of ${QUIZ_QUESTIONS.length}</span>
        <span class="font-mono text-indigo-400">${Math.round(((currentQuizStep + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
      </div>

      <h3 class="text-lg font-bold text-white">${q.question}</h3>

      <div class="space-y-2.5">
        ${q.options.map((opt, idx) => `
          <button data-opt-idx="${idx}" class="quiz-opt-btn w-full p-4 rounded-xl text-left bg-slate-900/80 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/50 text-xs sm:text-sm text-slate-200 hover:text-white transition flex items-center justify-between group">
            <span>${opt.text}</span>
            <i data-lucide="arrow-right" class="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition transform group-hover:translate-x-1"></i>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  document.querySelectorAll(".quiz-opt-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-opt-idx"), 10);
      quizAnswers.push(q.options[idx]);
      currentQuizStep++;
      renderQuizStep();
    });
  });

  if (window.lucide) lucide.createIcons();
}

function recommendRole(answers) {
  const techCount = answers.filter(a => a.category === "tech").length;
  const nonTechCount = answers.filter(a => a.category === "non-tech").length;
  const categoryKey = techCount >= nonTechCount ? "tech" : "non-tech";

  const specificRole = answers.find(a => a.roleId)?.roleId;
  let matchedRole = PATHWAYS_DATA[categoryKey].roles.find(r => r.id === specificRole);

  if (!matchedRole) {
    matchedRole = PATHWAYS_DATA[categoryKey].roles[0];
  }

  return {
    categoryKey,
    categoryName: PATHWAYS_DATA[categoryKey].categoryName,
    role: matchedRole
  };
}

// --- GENERAL MODAL UTILS ---
function openModal() {
  if (modal) {
    modal.classList.remove("hidden");
    setTimeout(() => {
      if (modalBox) {
        modalBox.classList.remove("scale-95", "opacity-0");
        modalBox.classList.add("scale-100", "opacity-100");
      }
    }, 10);
  }
}

function closeModal() {
  if (modalBox) {
    modalBox.classList.remove("scale-100", "opacity-100");
    modalBox.classList.add("scale-95", "opacity-0");
  }
  setTimeout(() => {
    if (modal) modal.classList.add("hidden");
  }, 200);
}
