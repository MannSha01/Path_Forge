// --- DATASET: TECH & NON-TECH PATHWAYS WITH COURSES ---
const PATHWAYS_DATA = {
  tech: {
    categoryName: "Tech & Engineering",
    roles: [
      {
        id: "frontend",
        title: "Frontend Developer",
        icon: "layout",
        tagline: "Build client-side web apps with HTML, CSS, JS & React.",
        steps: [
          {
            id: "tech-fe-1",
            title: "HTML5, Modern CSS3 & Responsive Design",
            duration: "2 - 3 Weeks",
            summary: "Semantic markup, Flexbox, CSS Grid, and media queries for multi-device support.",
            concepts: ["Semantic Tags", "Flexbox & Grid", "CSS Variables", "Responsive Breakpoints"],
            syllabus: [
              "Week 1: Document structure, accessibility (a11y), and semantic tags.",
              "Week 2: CSS Layouts with Flexbox, CSS Grid, and container queries.",
              "Week 3: Mobile-first responsive design, media queries, and design tokens."
            ],
            resources: [
              { name: "freeCodeCamp Responsive Web Design", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" },
              { name: "MDN Web Docs: HTML & CSS", url: "https://developer.mozilla.org" }
            ],
            project: "Build a responsive portfolio page from scratch."
          },
          {
            id: "tech-fe-2",
            title: "JavaScript Essentials (ES6+)",
            duration: "3 - 4 Weeks",
            summary: "DOM manipulation, asynchronous JS, promises, and Fetch API.",
            concepts: ["DOM Events", "Async/Await", "Promises", "ES6 Modules"],
            syllabus: [
              "Week 1: Data types, closures, array methods (.map, .filter, .reduce).",
              "Week 2: Event delegation, DOM manipulation, and dynamic HTML creation.",
              "Week 3: Promises, Async/Await, and API integration via Fetch API."
            ],
            resources: [
              { name: "JavaScript.info Modern Tutorial", url: "https://javascript.info/" },
              { name: "Scrimba Learn JavaScript Free Course", url: "https://scrimba.com/learn/learnjavascript" }
            ],
            project: "Build an interactive weather web app fetching live API data."
          },
          {
            id: "tech-fe-3",
            title: "Tailwind CSS & Component Styling",
            duration: "1 - 2 Weeks",
            summary: "Utility-first CSS, dark mode design systems, and rapid UI development.",
            concepts: ["Utility Classes", "Tailwind Config", "Dark Mode", "Custom Plugins"],
            syllabus: [
              "Week 1: Utility class patterns, layout setup, and dark mode toggles.",
              "Week 2: Reusable UI component abstraction and responsive breakpoints."
            ],
            resources: [
              { name: "Official Tailwind CSS Docs & Lab", url: "https://tailwindcss.com/docs" }
            ],
            project: "Recreate a popular SaaS landing page using Tailwind."
          },
          {
            id: "tech-fe-4",
            title: "React.js Framework & State Architecture",
            duration: "4 - 5 Weeks",
            summary: "JSX, props, component lifecycles, custom hooks, and routing.",
            concepts: ["JSX Markup", "useState & useEffect", "Custom Hooks", "React Router"],
            syllabus: [
              "Week 1: Component architecture, JSX syntax, and props pattern.",
              "Week 2: State management with useState and side effects with useEffect.",
              "Week 3: Single Page Application (SPA) routing with React Router.",
              "Week 4: Custom Hooks, Context API, and performance optimization."
            ],
            resources: [
              { name: "React Official Docs & Interactive Tutorials", url: "https://react.dev/learn" }
            ],
            project: "Build a single-page e-commerce app with cart state management."
          }
        ]
      },
      {
        id: "backend",
        title: "Backend Developer",
        icon: "server",
        tagline: "Design APIs, structure server runtimes, and query databases.",
        steps: [
          {
            id: "tech-be-1",
            title: "Server Runtimes (Node.js/Python)",
            duration: "3 Weeks",
            summary: "Understand server execution, I/O handling, and package managers.",
            concepts: ["Event Loop", "File System API", "Package Managers", "Async I/O"],
            syllabus: [
              "Week 1: Node.js runtime architecture, non-blocking I/O, and event loop.",
              "Week 2: File system operations, environment variables, and NPM modules.",
              "Week 3: Building basic HTTP servers and handling request stream data."
            ],
            resources: [
              { name: "Node.js Official Documentation", url: "https://nodejs.org/en/docs/" }
            ],
            project: "Build a CLI file parser utility."
          },
          {
            id: "tech-be-2",
            title: "RESTful API Architecture & Express",
            duration: "3 - 4 Weeks",
            summary: "HTTP endpoints, custom middleware pipelines, and JSON validation.",
            concepts: ["HTTP Verbs", "Express Routing", "Middleware", "JSON Schemas"],
            syllabus: [
              "Week 1: Express route parameters, body parsing, and status codes.",
              "Week 2: Custom middleware pipelines for authentication and logging.",
              "Week 3: Request payload validation and error handling patterns."
            ],
            resources: [
              { name: "FreeCodeCamp Node/Express Course", url: "https://www.freecodecamp.org/news/free-node-js-course-express-and-mongodb/" }
            ],
            project: "Build a REST API for a blog platform."
          },
          {
            id: "tech-be-3",
            title: "Databases (PostgreSQL & Prisma ORM)",
            duration: "4 Weeks",
            summary: "Relational modeling, SQL queries, table joins, and ORM migrations.",
            concepts: ["PostgreSQL & SQL", "Indexing", "Prisma ORM", "Database Migrations"],
            syllabus: [
              "Week 1: Relational data modeling, primary/foreign keys, and normalization.",
              "Week 2: Complex SQL queries, JOINs, indexing, and performance tuning.",
              "Week 3: Prisma ORM schemas, CRUD operations, and migrations.",
              "Week 4: Connecting ORM data layer to Express REST API endpoints."
            ],
            resources: [
              { name: "Prisma ORM Guide", url: "https://www.prisma.io/docs" }
            ],
            project: "Connect PostgreSQL database to your REST API with Prisma."
          }
        ]
      },
      {
        id: "fullstack",
        title: "Fullstack Engineer",
        icon: "code",
        tagline: "Connect frontend interfaces directly to scalable backend infrastructure.",
        steps: [
          {
            id: "tech-fs-1",
            title: "Fullstack Frameworks (Next.js)",
            duration: "4 Weeks",
            summary: "Server-Side Rendering (SSR), Static Site Generation (SSG), and Server Actions.",
            concepts: ["App Router", "SSR vs SSG", "Server Actions", "API Routes"],
            syllabus: [
              "Week 1: Next.js App Router, layout hierarchy, and page routing.",
              "Week 2: Server Components vs Client Components rendering models.",
              "Week 3: Data fetching strategies, SSR, and incremental static revalidation.",
              "Week 4: Server Actions and backend integration within UI forms."
            ],
            resources: [
              { name: "Next.js Official Learn Course", url: "https://nextjs.org/learn" }
            ],
            project: "Build a fullstack blog platform with dynamic routes."
          },
          {
            id: "tech-fs-2",
            title: "Authentication & Security",
            duration: "2 Weeks",
            summary: "User authentication, JWTs, OAuth single sign-on, and role-based access.",
            concepts: ["OAuth 2.0", "JWT Tokens", "Session Storage", "Middleware Protection"],
            syllabus: [
              "Week 1: Session vs JWT authentication and password hashing algorithms.",
              "Week 2: NextAuth / Auth0 integration and route protection middleware."
            ],
            resources: [
              { name: "Auth0 Docs & Security Guides", url: "https://auth0.com/docs" }
            ],
            project: "Implement secure login/signup with NextAuth or Clerk."
          }
        ]
      },
      {
        id: "devops",
        title: "DevOps & Cloud Engineer",
        icon: "cloud",
        tagline: "Automate build pipelines, manage cloud infrastructure, and monitor systems.",
        steps: [
          {
            id: "tech-do-1",
            title: "Linux Administration & Bash Scripting",
            duration: "3 Weeks",
            summary: "Command line mastery, file permissions, process management, and shell scripting.",
            concepts: ["SSH Keys", "Bash Scripts", "Systemd Services", "Cron Jobs"],
            syllabus: [
              "Week 1: Terminal navigation, permission models (chmod/chown), and package managers.",
              "Week 2: Process management, system logging, and SSH server management.",
              "Week 3: Automated Bash scripting for system updates and backups."
            ],
            resources: [
              { name: "Linux Journey Fundamentals", url: "https://linuxjourney.com/" }
            ],
            project: "Write a shell script to automate server log rotation and backup."
          }
        ]
      },
      {
        id: "data-analyst",
        title: "Data Analyst",
        icon: "bar-chart-3",
        tagline: "Turn raw datasets into business decisions via SQL, Python & Dashboards.",
        steps: [
          {
            id: "tech-da-1",
            title: "SQL Querying & Data Aggregation",
            duration: "3 Weeks",
            summary: "Extracting and filtering data from relational databases.",
            concepts: ["JOINs", "GROUP BY & HAVING", "Window Functions", "Subqueries"],
            syllabus: [
              "Week 1: SELECT queries, filtering (WHERE, LIKE), and ordering data.",
              "Week 2: Combining tables with INNER/LEFT/RIGHT JOINs and aggregations.",
              "Week 3: Advanced analytical functions (RANK, ROW_NUMBER, NTILE)."
            ],
            resources: [
              { name: "Mode Analytics SQL Tutorial", url: "https://mode.com/sql-tutorial/" }
            ],
            project: "Solve business analytics questions on an e-commerce database."
          }
        ]
      },
      {
        id: "ai-engineer",
        title: "Data Scientist & AI Specialist",
        icon: "cpu",
        tagline: "Train machine learning models, analyze big data, and integrate GenAI APIs.",
        steps: [
          {
            id: "tech-ai-1",
            title: "Mathematics & Scientific Python",
            duration: "3 - 4 Weeks",
            summary: "Linear algebra, probability, statistics, NumPy, and SciPy.",
            concepts: ["Matrix Operations", "Probability Distributions", "Hypothesis Testing", "NumPy Arrays"],
            syllabus: [
              "Week 1: Vectors, matrices, dot products, and linear transformations.",
              "Week 2: Descriptive statistics, probability distributions, and Z-scores.",
              "Week 3: Hypothesis testing, p-values, and confidence intervals."
            ],
            resources: [
              { name: "Khan Academy Linear Algebra & Stats", url: "https://www.khanacademy.org/math" }
            ],
            project: "Build a statistical analysis notebook for housing market predictions."
          }
        ]
      },
      {
        id: "cybersecurity",
        title: "Cybersecurity Analyst",
        icon: "shield",
        tagline: "Protect networks, audit security vulnerabilities, and monitor threat activity.",
        steps: [
          {
            id: "tech-sec-1",
            title: "Computer Networks & Security Fundamentals",
            duration: "3 Weeks",
            summary: "TCP/IP models, firewalls, DNS, VPNs, and common attack vectors.",
            concepts: ["TCP/IP & OSI Layers", "Wireshark Packet Analysis", "DNS Spoofing", "Encryption Standards"],
            syllabus: [
              "Week 1: OSI 7-layer model, packet routing, and subnetting.",
              "Week 2: Wireshark network traffic capture and log analysis.",
              "Week 3: Cryptography basics, SSL/TLS certificates, and firewalls."
            ],
            resources: [
              { name: "Cybrary Free Cybersecurity Fundamentals", url: "https://www.cybrary.it/" }
            ],
            project: "Analyze network traffic logs to detect suspicious activity."
          }
        ]
      }
    ]
  },
  "non-tech": {
    categoryName: "Non-Tech & Business",
    roles: [
      {
        id: "product-manager",
        title: "Product Manager",
        icon: "kanban",
        tagline: "Lead product strategy, define roadmaps, and align cross-functional teams.",
        steps: [
          {
            id: "nontech-pm-1",
            title: "Product Discovery & Market Research",
            duration: "2 - 3 Weeks",
            summary: "Identifying target customer pain points, competitor analysis, and value proposition design.",
            concepts: ["Customer Interviews", "Competitor Matrix", "Value Proposition", "TAM/SAM/SOM"],
            syllabus: [
              "Week 1: Conducting user interview sessions and mapping customer pain points.",
              "Week 2: Competitor analysis, market sizing (TAM/SAM/SOM), and positioning.",
              "Week 3: Defining unique value propositions and feature prioritizations."
            ],
            resources: [
              { name: "Product School Free PM Resources", url: "https://productschool.com/free-product-management-resources" }
            ],
            project: "Create a product opportunity document for a new app idea."
          }
        ]
      },
      {
        id: "uiux-designer",
        title: "UI/UX Designer",
        icon: "palette",
        tagline: "Design human-centered user interfaces and wireframes in Figma.",
        steps: [
          {
            id: "nontech-ux-1",
            title: "UX Research & User Journeys",
            duration: "2 - 3 Weeks",
            summary: "User interviews, persona creation, journey mapping, and information architecture.",
            concepts: ["User Personas", "Journey Maps", "Usability Heuristics", "Card Sorting"],
            syllabus: [
              "Week 1: User research techniques, interviews, and synthesis into User Personas.",
              "Week 2: Mapping User Journey maps, identifying friction points, and card sorting.",
              "Week 3: Information Architecture (IA) and sitemap structuring."
            ],
            resources: [
              { name: "Nielsen Norman Group UX Articles", url: "https://www.nngroup.com/" }
            ],
            project: "Conduct interviews and create 2 user personas for a concept app."
          }
        ]
      },
      {
        id: "digital-marketing",
        title: "Digital Growth Marketer",
        icon: "trending-up",
        tagline: "Drive customer acquisition through SEO, paid ads, content, and analytics.",
        steps: [
          {
            id: "nontech-dm-1",
            title: "SEO & Content Marketing Strategy",
            duration: "3 Weeks",
            summary: "Keyword research, on-page optimization, content calendars, and search intent.",
            concepts: ["Keyword Research", "On-Page SEO", "Backlink Strategy", "Content Funnels"],
            syllabus: [
              "Week 1: Keyword research tools (Ahrefs/SEMrush), search intent, and volume analysis.",
              "Week 2: On-page SEO: headings, meta tags, schema markup, and internal linking.",
              "Week 3: Content calendar planning and authority link-building outreach."
            ],
            resources: [
              { name: "Ahrefs SEO Learning Center", url: "https://ahrefs.com/academy" }
            ],
            project: "Perform an SEO audit and keyword strategy for a SaaS blog."
          }
        ]
      },
      {
        id: "business-analyst",
        title: "Business Analyst",
        icon: "pie-chart",
        tagline: "Bridge business requirements with technical systems and operational strategy.",
        steps: [
          {
            id: "nontech-ba-1",
            title: "Business Requirements & Process Modeling",
            duration: "3 Weeks",
            summary: "Eliciting requirements, mapping process workflows (BPMN), and gap analysis.",
            concepts: ["BPMN Flowcharts", "Gap Analysis", "Use Cases", "Stakeholder Mapping"],
            syllabus: [
              "Week 1: Stakeholder interview techniques and requirement gathering.",
              "Week 2: Business Process Model and Notation (BPMN) mapping.",
              "Week 3: Conducting AS-IS vs TO-BE gap analysis and feasibility studies."
            ],
            resources: [
              { name: "IIBA Business Analysis Guide", url: "https://www.iiba.org/" }
            ],
            project: "Document and model an AS-IS vs TO-BE workflow for a business process."
          }
        ]
      },
      {
        id: "scrum-master",
        title: "Scrum Master / Agile Coach",
        icon: "users",
        tagline: "Facilitate team execution, clear blockers, and foster continuous delivery.",
        steps: [
          {
            id: "nontech-sm-1",
            title: "Agile Manifesto & Scrum Ceremonies",
            duration: "2 - 3 Weeks",
            summary: "Sprint planning, daily standups, sprint reviews, and retrospectives.",
            concepts: ["Sprint Planning", "Burndown Charts", "Agile Principles", "Retrospectives"],
            syllabus: [
              "Week 1: The 4 Agile values, 12 principles, and Scrum framework roles.",
              "Week 2: Facilitating Daily Standups, Sprint Planning, and Sprint Reviews.",
              "Week 3: Organizing productive Retrospectives and metric tracking."
            ],
            resources: [
              { name: "Official Scrum Guide", url: "https://scrumguides.org/" }
            ],
            project: "Set up a Jira project workspace with complete sprint board workflow rules."
          }
        ]
      },
      {
        id: "solutions-architect",
        title: "Solutions Architect / Tech Sales",
        icon: "layers",
        tagline: "Drive high-value enterprise sales with technical demos and solution designs.",
        steps: [
          {
            id: "nontech-sa-1",
            title: "Discovery & Solution Scoping",
            duration: "3 Weeks",
            summary: "Uncovering client technical pain points and drafting architectural proposals.",
            concepts: ["Discovery Calls", "RFP Responses", "Technical Proofs of Concept", "Solution Architecture"],
            syllabus: [
              "Week 1: Conducting technical discovery calls and pain-point identification.",
              "Week 2: Architectural diagramming, cloud components selection, and cost estimation.",
              "Week 3: Responding to RFPs (Request For Proposals) and scope documentation."
            ],
            resources: [
              { name: "AWS Cloud Practitioner Essentials", url: "https://aws.amazon.com/training/" }
            ],
            project: "Create a technical proposal and architecture outline responding to a sample RFP."
          }
        ]
      }
    ]
  }
};

// --- QUIZ QUESTIONS DATASET ---
const QUIZ_QUESTIONS = [
  {
    question: "What type of daily problem-solving excites you the most?",
    options: [
      { text: "Designing visual UI layouts, colors, and user interactions", category: "non-tech", roleId: "uiux-designer" },
      { text: "Writing logical code, building web apps, or managing databases", category: "tech", roleId: "frontend" },
      { text: "Analyzing numbers, datasets, charts, and financial metrics", category: "tech", roleId: "data-analyst" },
      { text: "Leading project strategy, managing teams, and defining features", category: "non-tech", roleId: "product-manager" }
    ]
  },
  {
    question: "How do you feel about writing deep programming code?",
    options: [
      { text: "I want code to be my core daily tool (HTML/JS/Python/SQL)", category: "tech", roleId: "fullstack" },
      { text: "I prefer visual design tools (Figma) and zero heavy code", category: "non-tech", roleId: "uiux-designer" },
      { text: "I like business logic, process mapping, and spreadsheets", category: "non-tech", roleId: "business-analyst" },
      { text: "I enjoy high-level technical concepts and client pitches", category: "non-tech", roleId: "solutions-architect" }
    ]
  },
  {
    question: "What is your primary career target right now?",
    options: [
      { text: "Become a software developer or cloud engineer", category: "tech", roleId: "frontend" },
      { text: "Become a UX designer crafting digital experiences", category: "non-tech", roleId: "uiux-designer" },
      { text: "Become a product manager or agile facilitator", category: "non-tech", roleId: "product-manager" },
      { text: "Work in data analytics, AI, or cybersecurity", category: "tech", roleId: "ai-engineer" }
    ]
  }
];

// --- APP STATE ---
let currentCategory = null; // 'tech' | 'non-tech'
let currentRole = null;     // role object
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
  lucide.createIcons();

  logoBtn.addEventListener("click", showLandingView);

  // Hero Actions
  if (startHeroBtn) {
    startHeroBtn.addEventListener("click", () => selectCategory("tech")); // default to tech grid or category choice
  }
  if (triggerQuizBtn) {
    triggerQuizBtn.addEventListener("click", openQuizModal);
  }
  if (topBannerQuizBtn) {
    topBannerQuizBtn.addEventListener("click", openQuizModal);
  }

  navBackBtn.addEventListener("click", () => {
    if (!viewRoadmap.classList.contains("hidden")) {
      selectCategory(currentCategory || "tech");
    } else {
      showLandingView();
    }
  });

  resetBtn.addEventListener("click", () => {
    if (confirm("Reset completion status across all career pathways?")) {
      completedMap = {};
      hasCelebrated = false;
      saveProgress();
      if (currentRole) renderRoadmap();
    }
  });

  closeModalBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
});

function showLandingView() {
  currentCategory = null;
  currentRole = null;

  viewLanding.classList.remove("hidden");
  viewRoles.classList.add("hidden");
  viewRoadmap.classList.add("hidden");

  navBackBtn.classList.add("hidden");
}

function selectCategory(categoryKey) {
  currentCategory = categoryKey;
  const categoryData = PATHWAYS_DATA[categoryKey];

  roleCategoryBadge.textContent = `Category: ${categoryData.categoryName}`;
  roleCategoryTitle.textContent = `Select Your ${categoryData.categoryName} Role`;

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
        <span class="text-slate-500 font-medium">${role.steps.length} Milestones</span>
        <span class="text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
          View Path <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
        </span>
      </div>
    `;

    card.addEventListener("click", () => selectRole(role));
    rolesGrid.appendChild(card);
  });

  lucide.createIcons();

  viewLanding.classList.add("hidden");
  viewRoles.classList.remove("hidden");
  viewRoadmap.classList.add("hidden");

  backBtnText.textContent = "Home";
  navBackBtn.classList.remove("hidden");
}

function selectRole(role) {
  currentRole = role;
  hasCelebrated = false;

  renderRoadmap();

  viewLanding.classList.add("hidden");
  viewRoles.classList.add("hidden");
  viewRoadmap.classList.remove("hidden");

  backBtnText.textContent = "Roles";
  navBackBtn.classList.remove("hidden");
}

// --- RENDER ROADMAP ---
function renderRoadmap() {
  if (!currentRole) return;

  roadmapDomainTag.textContent = PATHWAYS_DATA[currentCategory].categoryName;
  pathwayTitle.textContent = currentRole.title;
  pathwayDesc.textContent = currentRole.tagline;

  stepsContainer.innerHTML = "";

  currentRole.steps.forEach((step, index) => {
    const isChecked = !!completedMap[step.id];

    const stepCard = document.createElement("div");
    stepCard.className = "relative group flex items-start gap-4 sm:gap-6";

    stepCard.innerHTML = `
      <!-- Node Checkbox -->
      <label class="relative z-10 flex items-center justify-center -ml-[31px] sm:-ml-[39px] mt-4 cursor-pointer">
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
                Step ${index + 1}
              </span>
              <h3 class="text-base sm:text-lg font-bold text-white ${isChecked ? 'line-through text-slate-400' : ''}">
                ${step.title}
              </h3>
            </div>

            <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">${step.summary}</p>

            <div class="flex items-center gap-4 mt-3 text-xs text-slate-400 font-medium">
              <span class="inline-flex items-center gap-1.5 bg-slate-950/50 px-2.5 py-1 rounded-lg border border-slate-800">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-indigo-400"></i> ${step.duration}
              </span>
              <span class="inline-flex items-center gap-1.5 bg-slate-950/50 px-2.5 py-1 rounded-lg border border-slate-800">
                <i data-lucide="book-open" class="w-3.5 h-3.5 text-cyan-400"></i> ${step.resources.length} Courses/Docs
              </span>
            </div>
          </div>

          <!-- Toggle Expand Button -->
          <button 
            data-target="expand-${step.id}" 
            class="toggle-details-btn self-end sm:self-center px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition border border-slate-700/80 hover:border-indigo-500 flex items-center gap-2 whitespace-nowrap shadow-sm group/btn"
          >
            <i data-lucide="book-open-check" class="w-3.5 h-3.5"></i>
            <span class="btn-label">View Course Syllabus</span>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 chevron-icon transition-transform duration-300"></i>
          </button>
        </div>

        <!-- COLLAPSIBLE EXPANDED DETAILS SECTION -->
        <div id="expand-${step.id}" class="hidden mt-5 pt-5 border-t border-slate-800/80 space-y-4 transition-all">
          
          ${step.syllabus && step.syllabus.length ? `
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-1.5">
                <i data-lucide="calendar" class="w-3.5 h-3.5 text-indigo-400"></i> Step-by-Step Curriculum
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

          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-400"></i> Core Competencies
            </h4>
            <div class="flex flex-wrap gap-1.5">
              ${step.concepts.map(c => `<span class="bg-slate-950 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg border border-slate-800 font-medium">${c}</span>`).join('')}
            </div>
          </div>

          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <i data-lucide="graduation-cap" class="w-3.5 h-3.5 text-cyan-400"></i> Direct Free Courses & Documentation
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${step.resources.map(r => `
                <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="bg-slate-950/80 hover:bg-slate-900 p-2.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 text-indigo-400 hover:text-indigo-300 text-xs transition flex items-center justify-between font-medium group/link">
                  <span class="truncate">${r.name}</span>
                  <i data-lucide="external-link" class="w-3.5 h-3.5 shrink-0 group-hover/link:translate-x-0.5 transition"></i>
                </a>
              `).join('')}
            </div>
          </div>

          <div class="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl">
            <h4 class="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <i data-lucide="code" class="w-3.5 h-3.5 text-indigo-400"></i> Milestone Project Challenge
            </h4>
            <p class="text-xs text-slate-300 leading-relaxed">${step.project}</p>
          </div>

        </div>
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
      renderRoadmap();
    });
  });

  document.querySelectorAll(".toggle-details-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const targetId = e.currentTarget.getAttribute("data-target");
      const contentEl = document.getElementById(targetId);
      const chevronIcon = e.currentTarget.querySelector(".chevron-icon");
      const labelEl = e.currentTarget.querySelector(".btn-label");

      if (contentEl.classList.contains("hidden")) {
        contentEl.classList.remove("hidden");
        chevronIcon.style.transform = "rotate(180deg)";
        if (labelEl) labelEl.textContent = "Hide Syllabus";
      } else {
        contentEl.classList.add("hidden");
        chevronIcon.style.transform = "rotate(0deg)";
        if (labelEl) labelEl.textContent = "View Course Syllabus";
      }
    });
  });
}

function updateProgress() {
  const steps = currentRole.steps;
  const completedCount = steps.filter((s) => completedMap[s.id]).length;
  const percentage = Math.round((completedCount / steps.length) * 100) || 0;

  progressBar.style.width = `${percentage}%`;
  progressPercent.textContent = `${percentage}%`;

  if (percentage === 100) {
    trophyContainer.className = "w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center animate-bounce shadow-[0_0_20px_rgba(245,158,11,0.4)]";
    if (!hasCelebrated) {
      if (typeof confetti === "function") {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      }
      hasCelebrated = true;
    }
  } else {
    trophyContainer.className = "w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-600 flex items-center justify-center";
  }
}

function saveProgress() {
  localStorage.setItem("pathforge_completed", JSON.stringify(completedMap));
}

// --- CAREER QUIZ ENGINE ---
function openQuizModal() {
  quizAnswers = [];
  currentQuizStep = 0;
  renderQuizQuestion();

  modal.classList.remove("opacity-0", "pointer-events-none");
  modalBox.classList.add("animate-modal-pop");
}

function renderQuizQuestion() {
  const q = QUIZ_QUESTIONS[currentQuizStep];
  if (!q) {
    calculateQuizResults();
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
      ${q.options.map((opt, i) => `
        <button 
          data-index="${i}"
          class="quiz-opt-btn w-full text-left p-3.5 bg-slate-950/80 hover:bg-indigo-600/20 rounded-xl border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white text-xs font-medium transition flex items-center justify-between group"
        >
          <span>${opt.text}</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-indigo-400"></i>
        </button>
      `).join("")}
    </div>
  `;

  lucide.createIcons();

  document.querySelectorAll(".quiz-opt-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const selectedIndex = parseInt(e.currentTarget.getAttribute("data-index"));
      quizAnswers.push(q.options[selectedIndex]);
      currentQuizStep++;
      renderQuizQuestion();
    });
  });
}

function calculateQuizResults() {
  // Find most frequent role ID or default to Frontend / PM
  const roleVotes = {};
  let bestCategory = "tech";

  quizAnswers.forEach((ans) => {
    roleVotes[ans.roleId] = (roleVotes[ans.roleId] || 0) + 1;
    if (ans.category) bestCategory = ans.category;
  });

  const matchedRoleId = Object.keys(roleVotes).reduce((a, b) => roleVotes[a] > roleVotes[b] ? a : b, "frontend");

  // Lookup role object
  let matchedRole = PATHWAYS_DATA[bestCategory].roles.find(r => r.id === matchedRoleId);
  if (!matchedRole) {
    // fallback search across both categories
    matchedRole = PATHWAYS_DATA["tech"].roles.find(r => r.id === matchedRoleId) || 
                  PATHWAYS_DATA["non-tech"].roles.find(r => r.id === matchedRoleId) ||
                  PATHWAYS_DATA["tech"].roles[0];
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
      <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">${matchedRole.tagline}</p>

      <div class="mt-6">
        <button 
          id="launch-matched-roadmap"
          class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
        >
          <span>Launch ${matchedRole.title} Pathway</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `;

  lucide.createIcons();

  document.getElementById("launch-matched-roadmap").addEventListener("click", () => {
    closeModal();
    currentCategory = bestCategory;
    selectRole(matchedRole);
  });
}

// --- GENERAL MODAL CLOSING ---
function closeModal() {
  modal.classList.add("opacity-0", "pointer-events-none");
  modalBox.classList.remove("animate-modal-pop");
}
