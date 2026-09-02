// ===================================================
// PATH FORGE - CAREER PATHWAYS DATASET
// Complete Tech & Non-Tech Roles, Syllabi & Resources
// ===================================================

export const PATHWAYS_DATA = {
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
