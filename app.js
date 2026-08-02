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
            resources: [
              { name: "Auth0 Docs & Security Guides", url: "https://auth0.com/docs" }
            ],
            project: "Implement secure login/signup with NextAuth or Clerk."
          },
          {
            id: "tech-fs-3",
            title: "Payment Gateways & Deployment",
            duration: "3 Weeks",
            summary: "Integrating Stripe webhooks, deploying to Vercel, and CI/CD triggers.",
            concepts: ["Stripe Webhooks", "Vercel Deployment", "Environment Variables", "Serverless Functions"],
            resources: [
              { name: "Stripe API Reference", url: "https://stripe.com/docs/api" }
            ],
            project: "Build a SaaS subscription application with paid tier access."
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
            resources: [
              { name: "Linux Journey Fundamentals", url: "https://linuxjourney.com/" }
            ],
            project: "Write a shell script to automate server log rotation and backup."
          },
          {
            id: "tech-do-2",
            title: "Containerization with Docker & Kubernetes",
            duration: "4 Weeks",
            summary: "Packaging software into containers and orchestrating cluster deployments.",
            concepts: ["Dockerfiles", "Docker Compose", "Pods & Services", "Helm Charts"],
            resources: [
              { name: "Docker Official Docs & Getting Started", url: "https://docs.docker.com/get-started/" }
            ],
            project: "Containerize a multi-container app with frontend, backend, and Redis."
          },
          {
            id: "tech-do-3",
            title: "CI/CD & Infrastructure as Code (IaC)",
            duration: "4 Weeks",
            summary: "Automating deployments with GitHub Actions and provisioning cloud via Terraform.",
            concepts: ["GitHub Actions Workflows", "Terraform State", "AWS EC2/S3", "CloudWatch"],
            resources: [
              { name: "HashiCorp Terraform Tutorials", url: "https://developer.hashicorp.com/terraform/tutorials" }
            ],
            project: "Build a CI/CD pipeline that automatically provisions AWS resources and deploys code."
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
            resources: [
              { name: "Mode Analytics SQL Tutorial", url: "https://mode.com/sql-tutorial/" }
            ],
            project: "Solve business analytics questions on an e-commerce database."
          },
          {
            id: "tech-da-2",
            title: "Python Data Wrangling (Pandas/NumPy)",
            duration: "4 Weeks",
            summary: "Cleaning, transforming, and aggregating datasets programmatically.",
            concepts: ["DataFrames", "Missing Value Cleanup", "Data Aggregation", "Seaborn Visuals"],
            resources: [
              { name: "Pandas Documentation & Tutorials", url: "https://pandas.pydata.org/" }
            ],
            project: "Perform Exploratory Data Analysis (EDA) on a Kaggle dataset."
          },
          {
            id: "tech-da-3",
            title: "Business Dashboards (Power BI / Tableau)",
            duration: "2 - 3 Weeks",
            summary: "Building interactive dashboards for executive stakeholders.",
            concepts: ["Dashboard UX", "Calculated Measures", "Filters & Slicers", "Storytelling"],
            resources: [
              { name: "Tableau Public Learning Resources", url: "https://public.tableau.com" }
            ],
            project: "Create an executive sales KPI dashboard."
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
            resources: [
              { name: "Khan Academy Linear Algebra & Stats", url: "https://www.khanacademy.org/math" }
            ],
            project: "Build a statistical analysis notebook for housing market predictions."
          },
          {
            id: "tech-ai-2",
            title: "Machine Learning with Scikit-Learn",
            duration: "4 Weeks",
            summary: "Supervised and unsupervised learning, regression, classification, and evaluation.",
            concepts: ["Decision Trees", "Random Forests", "Overfitting vs Underfitting", "Cross-Validation"],
            resources: [
              { name: "Scikit-Learn Official User Guide", url: "https://scikit-learn.org/stable/user_guide.html" }
            ],
            project: "Train a customer churn prediction model with high accuracy."
          },
          {
            id: "tech-ai-3",
            title: "LLMs, RAG & Vector Databases",
            duration: "3 - 4 Weeks",
            summary: "Building generative AI applications using LangChain, OpenAI API, and Pinecone.",
            concepts: ["Embeddings", "Vector Databases", "Prompt Engineering", "RAG Pipelines"],
            resources: [
              { name: "DeepLearning.AI Short Courses", url: "https://www.deeplearning.ai/short-courses/" }
            ],
            project: "Build a Custom Q&A Chatbot over your own PDF documents."
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
            resources: [
              { name: "Cybrary Free Cybersecurity Fundamentals", url: "https://www.cybrary.it/" }
            ],
            project: "Analyze network traffic logs to detect suspicious activity."
          },
          {
            id: "tech-sec-2",
            title: "Vulnerability Scanning & Penetration Testing",
            duration: "4 Weeks",
            summary: "Identifying software flaws using tools like Nmap, Burp Suite, and Metasploit.",
            concepts: ["Port Scanning", "OWASP Top 10", "SQL Injection", "XSS Vulnerabilities"],
            resources: [
              { name: "TryHackMe Interactive Rooms", url: "https://tryhackme.com/" }
            ],
            project: "Perform an OWASP security audit on an intentionally vulnerable web app."
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
            resources: [
              { name: "Product School Free PM Resources", url: "https://productschool.com/free-product-management-resources" }
            ],
            project: "Create a product opportunity document for a new app idea."
          },
          {
            id: "nontech-pm-2",
            title: "Agile, Scrum & Spec Writing (PRDs)",
            duration: "3 Weeks",
            summary: "Writing Product Requirement Documents (PRDs), user stories, and managing sprint backlogs.",
            concepts: ["PRD Structure", "User Stories & Acceptance Criteria", "Jira / Linear Backlogs", "Sprint Ceremonies"],
            resources: [
              { name: "Atlassian Agile Coach Guide", url: "https://www.atlassian.com/agile" }
            ],
            project: "Write a complete PRD with user stories for a mobile feature."
          },
          {
            id: "nontech-pm-3",
            title: "Product Analytics & Metrics",
            duration: "2 Weeks",
            summary: "Tracking user retention, funnel conversion, activation metrics, and A/B testing.",
            concepts: ["North Star Metric", "AARRR Funnel", "Conversion Funnels", "Mixpanel / Amplitude"],
            resources: [
              { name: "Mixpanel Analytics Guide", url: "https://mixpanel.com/blog/" }
            ],
            project: "Set up a product analytics tracking plan for an e-commerce funnel."
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
            resources: [
              { name: "Nielsen Norman Group UX Articles", url: "https://www.nngroup.com/" }
            ],
            project: "Conduct interviews and create 2 user personas for a concept app."
          },
          {
            id: "nontech-ux-2",
            title: "Figma Prototyping & Design Systems",
            duration: "3 - 4 Weeks",
            summary: "Wireframing, Auto Layout, component variants, and micro-interactions.",
            concepts: ["Auto Layout", "Component Variants", "Design Systems", "Interactive Prototypes"],
            resources: [
              { name: "Figma Official Learn Hub", url: "https://www.figma.com/resources/learn/" }
            ],
            project: "Design an interactive mobile app prototype in Figma."
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
            resources: [
              { name: "Ahrefs SEO Learning Center", url: "https://ahrefs.com/academy" }
            ],
            project: "Perform an SEO audit and keyword strategy for a SaaS blog."
          },
          {
            id: "nontech-dm-2",
            title: "Performance Marketing (Meta & Google Ads)",
            duration: "3 Weeks",
            summary: "Structuring paid ad campaigns, copywriting, conversion rate optimization (CRO), and ROAS.",
            concepts: ["Ad Copywriting", "Audience Targeting", "ROAS Optimization", "A/B Testing"],
            resources: [
              { name: "Google Skillshop Ads Certification", url: "https://skillshop.exceedlms.com/" }
            ],
            project: "Design a $1,000 ad budget campaign strategy and creative copy."
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
            resources: [
              { name: "IIBA Business Analysis Guide", url: "https://www.iiba.org/" }
            ],
            project: "Document and model an AS-IS vs TO-BE workflow for a business process."
          },
          {
            id: "nontech-ba-2",
            title: "Data Analysis with Excel & PowerBI",
            duration: "3 Weeks",
            summary: "Advanced PivotTables, VLOOKUP/XLOOKUP, DAX formulas, and stakeholder reports.",
            concepts: ["PivotTables", "XLOOKUP", "DAX Formulas", "Executive Summaries"],
            resources: [
              { name: "Microsoft Excel Learning Center", url: "https://support.microsoft.com/en-us/excel" }
            ],
            project: "Build an operational efficiency report in Excel for a logistics startup."
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
            resources: [
              { name: "Official Scrum Guide", url: "https://scrumguides.org/" }
            ],
            project: "Set up a Jira project workspace with complete sprint board workflow rules."
          },
          {
            id: "nontech-sm-2",
            title: "Coaching & Conflict Resolution",
            duration: "2 Weeks",
            summary: "Servant leadership, removing team impedance, velocity tracking, and continuous improvement.",
            concepts: ["Servant Leadership", "Team Velocity", "Story Point Estimation", "Impediment Removal"],
            resources: [
              { name: "Scrum.org Open Assessments", url: "https://www.scrum.org/open-assessments" }
            ],
            project: "Design an actionable Retrospective template for an underperforming sprint team."
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
            resources: [
              { name: "AWS Cloud Practitioner Essentials", url: "https://aws.amazon.com/training/" }
            ],
            project: "Create a technical proposal and architecture outline responding to a sample RFP."
          },
          {
            id: "nontech-sa-2",
            title: "Technical Demos & Objection Handling",
            duration: "2 - 3 Weeks",
            summary: "Conducting engaging software live demos and handling technical enterprise objections.",
            concepts: ["Live Demos", "Security & Compliance Objections", "ROI Pitching", "Value Selling"],
            resources: [
              { name: "HubSpot Sales Enablement Guides", url: "https://academy.hubspot.com/" }
            ],
            project: "Record a 5-minute sales demo video presenting an enterprise cloud software product."
          }
        ]
      }
    ]
  }
};

// --- APP STATE ---
let currentCategory = null; // 'tech' | 'non-tech'
let currentRole = null;     // role object
let completedMap = JSON.parse(localStorage.getItem("pathforge_completed")) || {};
let hasCelebrated = false;

// --- DOM ELEMENTS ---
const viewLanding = document.getElementById("view-landing");
const viewRoles = document.getElementById("view-roles");
const viewRoadmap = document.getElementById("view-roadmap");

const navBackBtn = document.getElementById("nav-back-btn");
const backBtnText = document.getElementById("back-btn-text");
const logoBtn = document.getElementById("logo-btn");
const resetBtn = document.getElementById("reset-btn");

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

// --- NAVIGATION & ROUTING CONTROLS ---
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  logoBtn.addEventListener("click", showLandingView);

  navBackBtn.addEventListener("click", () => {
    if (viewRoadmap.classList.contains("hidden")) {
      showLandingView();
    } else {
      selectCategory(currentCategory);
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

  backBtnText.textContent = "Domains";
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

          <button 
            data-id="${step.id}" 
            class="view-detail-btn self-end sm:self-center px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition border border-slate-700/80 hover:border-indigo-500 flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <i data-lucide="graduation-cap" class="w-3.5 h-3.5"></i> Learn & Courses
          </button>
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

  document.querySelectorAll(".view-detail-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const stepId = e.currentTarget.getAttribute("data-id");
      openModal(stepId);
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

// --- MODAL CONTROLS ---
function openModal(stepId) {
  const step = currentRole.steps.find((s) => s.id === stepId);
  if (!step) return;

  modalContent.innerHTML = `
    <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
      Recommended Courses & Resources
    </span>
    <h3 class="text-xl font-extrabold text-white mt-2">${step.title}</h3>
    <p class="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">${step.summary}</p>

    <div class="mt-4">
      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-400"></i> Core Skills to Learn
      </h4>
      <div class="flex flex-wrap gap-1.5">
        ${step.concepts.map((c) => `<span class="bg-slate-950 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-800 font-medium">${c}</span>`).join("")}
      </div>
    </div>

    <div class="mt-4">
      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
        <i data-lucide="graduation-cap" class="w-3.5 h-3.5 text-cyan-400"></i> Top Free Learning Courses & Docs
      </h4>
      <ul class="space-y-2 text-xs sm:text-sm">
        ${step.resources.map((r) => `
          <li class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300 transition hover:underline inline-flex items-center gap-1.5 font-medium">
              ${r.name} <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </li>
        `).join("")}
      </ul>
    </div>

    <div class="mt-4 p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl">
      <h4 class="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
        <i data-lucide="code" class="w-3.5 h-3.5 text-indigo-400"></i> Milestone Project Challenge
      </h4>
      <p class="text-xs text-slate-300 leading-relaxed">${step.project}</p>
    </div>
  `;

  lucide.createIcons();
  modal.classList.remove("opacity-0", "pointer-events-none");
  modalBox.classList.add("animate-modal-pop");
}

function closeModal() {
  modal.classList.add("opacity-0", "pointer-events-none");
  modalBox.classList.remove("animate-modal-pop");
}
