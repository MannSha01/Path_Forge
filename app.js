// ==========================================================================



// --- LOADING SCREEN & SCROLL UNLOCK CONTROLLER ---
window.addEventListener("load", () => {
  const loadingScreen = document.getElementById("loading-screen");
  
  // Guarantee body scroll is unlocked immediately on startup
  document.body.style.overflow = "auto";
  
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        loadingScreen.remove();
      }, 700);
    }, 600);
  }
});

// --- DATASET: 15 COMPLETE BEGINNER-FRIENDLY PATHWAYS ---
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
        id: "devops",
        title: "DevOps & Cloud Engineer",
        icon: "cloud",
        tagline: "Automate website deployments, manage cloud servers, and keep apps running 24/7.",
        steps: [
          {
            id: "tech-do-1",
            title: "Terminal Commands & Linux",
            duration: "3 Weeks",
            summary: "Learn how to control computers using text commands instead of clicking with a mouse.",
            whyMatters: "Cloud servers in data centers don't have screen displays—you control them entirely through typed commands!",
            concepts: ["Command Line Basics", "Automated Scripts", "Server Access"],
            syllabus: [
              "Week 1: Navigating folders, creating files, and editing permissions using terminal text commands.",
              "Week 2: Connecting securely to distant cloud computers over the internet.",
              "Week 3: Writing mini auto-scripts to back up files automatically every midnight."
            ],
            resources: [
              { name: "Linux Journey Fundamentals", url: "https://linuxjourney.com/" }
            ],
            project: "Write an automated script that creates a daily backup copy of a folder."
          },
          {
            id: "tech-do-2",
            title: "App Packaging: Docker & Cloud",
            duration: "3 Weeks",
            summary: "Package your app into a clean digital box (container) so it runs on any computer in the world instantly.",
            whyMatters: "Prevents the classic developer headache: 'Well, it worked on my laptop, why doesn't it work on the server?'",
            concepts: ["Digital Boxes (Containers)", "Automatic Deployment", "Cloud Hosting"],
            syllabus: [
              "Week 1: Putting your code into a self-contained Docker container.",
              "Week 2: Running multiple containers together (like web app + database).",
              "Week 3: Setting up GitHub to auto-publish your app every time you save new code."
            ],
            resources: [
              { name: "Docker Getting Started Guide", url: "https://docs.docker.com/get-started/" }
            ],
            project: "Box up a full web application into Docker and deploy it to a live cloud server."
          }
        ]
      },
      {
        id: "mobile-dev",
        title: "Mobile App Developer",
        icon: "smartphone",
        tagline: "Build mobile applications for iPhone (iOS) and Android phones.",
        steps: [
          {
            id: "tech-mob-1",
            title: "Cross-Platform Apps: React Native",
            duration: "4 Weeks",
            summary: "Write code once in JavaScript and turn it into native apps for both iPhone and Android.",
            whyMatters: "Saves you from having to write two completely separate apps for Apple and Android.",
            concepts: ["Mobile UI Screens", "Touch & Swipe Events", "Phone Camera & Storage"],
            syllabus: [
              "Week 1: Understanding mobile screen components, touch buttons, and scroll views.",
              "Week 2: Moving smoothly between screens using swipe or back arrows.",
              "Week 3: Saving app data directly on the phone's local memory.",
              "Week 4: Preparing your app for submission to the Apple App Store and Google Play."
            ],
            resources: [
              { name: "React Native Docs for Beginners", url: "https://reactnative.dev/" }
            ],
            project: "Build a mobile task list app where users can add, cross off, and save daily goals."
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
          },
          {
            id: "tech-da-2",
            title: "Visual Dashboards: Excel & PowerBI",
            duration: "2 - 3 Weeks",
            summary: "Turn raw spreadsheets into beautiful, interactive charts and visual graphs for company leaders.",
            whyMatters: "Executives don't want to look at endless text rows—they want clear visual pie charts and trends.",
            concepts: ["Spreadsheet Magic", "Bar Charts & Pie Charts", "Live Dashboards"],
            syllabus: [
              "Week 1: Advanced spreadsheet formulas (VLOOKUP, SUMIFS, Pivot Tables).",
              "Week 2: Creating clean visual charts that highlight important trends.",
              "Week 3: Building interactive dashboards where users can filter numbers by date."
            ],
            resources: [
              { name: "Microsoft PowerBI Beginner Guide", url: "https://learn.microsoft.com/power-bi/" }
            ],
            project: "Build a visual sales dashboard tracking revenue across different global cities."
          }
        ]
      },
      {
        id: "ai-engineer",
        title: "Data Scientist & AI Specialist",
        icon: "cpu",
        tagline: "Train smart computer algorithms, spot deep patterns, and build AI chatbots.",
        steps: [
          {
            id: "tech-ai-1",
            title: "Python for Data & Math Basics",
            duration: "3 - 4 Weeks",
            summary: "Learn Python—the easiest programming language—to crunch numbers and make predictions.",
            whyMatters: "Python is the undisputed global language of Artificial Intelligence and Machine Learning.",
            concepts: ["Python Basics", "Averages & Probability", "Data Charts"],
            syllabus: [
              "Week 1: Python programming basics (loops, lists, and numbers).",
              "Week 2: Basic math and statistics concepts made easy with visual aids.",
              "Week 3: Loading large data files and plotting graphs in Python."
            ],
            resources: [
              { name: "Kaggle Python for Beginners", url: "https://www.kaggle.com/learn/python" }
            ],
            project: "Write a Python script that calculates housing price predictions based on square footage."
          },
          {
            id: "tech-ai-2",
            title: "AI Tools & Machine Learning",
            duration: "3 Weeks",
            summary: "Learn how modern AI models work and connect your app to OpenAI (ChatGPT) services.",
            whyMatters: "Allows you to add smart AI features like automated summaries, text generation, and image recognition to apps.",
            concepts: ["Machine Learning Basics", "Connecting AI APIs", "Smart Prompts"],
            syllabus: [
              "Week 1: How algorithms 'learn' patterns from old examples.",
              "Week 2: Sending requests to ChatGPT-like AI models through code.",
              "Week 3: Customizing AI responses to suit specific user needs."
            ],
            resources: [
              { name: "DeepLearning.AI Short Courses", url: "https://www.deeplearning.ai/" }
            ],
            project: "Build a mini AI assistant that automatically summarizes long articles into 3 bullet points."
          }
        ]
      },
      {
        id: "cybersecurity",
        title: "Cybersecurity Analyst",
        icon: "shield",
        tagline: "Protect company networks, catch digital security risks, and defend against hackers.",
        steps: [
          {
            id: "tech-sec-1",
            title: "Internet Security & Networks",
            duration: "3 Weeks",
            summary: "Learn how information travels across the internet and how digital firewalls block bad activity.",
            whyMatters: "You can't protect a computer network if you don't know how computers talk to each other!",
            concepts: ["How Internet Works", "Firewalls", "Inspecting Web Traffic"],
            syllabus: [
              "Week 1: How websites send data back and forth securely (HTTP vs HTTPS).",
              "Week 2: Using inspection tools to see network activity in real time.",
              "Week 3: Identifying common hacker traps (phishing links, fake websites)."
            ],
            resources: [
              { name: "Cybrary Free Cybersecurity Guide", url: "https://www.cybrary.it/" }
            ],
            project: "Inspect a sample network log file and identify suspicious unauthorized login attempts."
          }
        ]
      }
    ]
  },
  "non-tech": {
    categoryName: "Design & Business",
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
          },
          {
            id: "nontech-ux-2",
            title: "Visual Design & Figma Prototypes",
            duration: "3 Weeks",
            summary: "Turn rough sketches into glowing, clickable app designs with colors, icons, and interactive buttons.",
            whyMatters: "Clickable prototypes feel like real apps and allow testing before any developer writes code.",
            concepts: ["Figma Design Tool", "Colors & Typography", "Clickable Prototypes"],
            syllabus: [
              "Week 1: Master Figma basics—drawing shapes, choosing color palettes, and picking readable fonts.",
              "Week 2: Designing polished mobile screens with consistent buttons and cards.",
              "Week 3: Linking screens together with click animations so it feels like a real, working app."
            ],
            resources: [
              { name: "Figma Official Beginners Course", url: "https://www.figma.com/resources/learn-design/" }
            ],
            project: "Create a fully clickable 4-screen prototype for a food delivery app in Figma."
          }
        ]
      },
      {
        id: "product-manager",
        title: "Product Manager",
        icon: "kanban",
        tagline: "Guide app vision, set team priorities, and make sure projects finish on schedule.",
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
      },
      {
        id: "digital-marketing",
        title: "Digital Growth Marketer",
        icon: "trending-up",
        tagline: "Attract customers to apps and websites through search engines, content, and ads.",
        steps: [
          {
            id: "nontech-dm-1",
            title: "Search Engine Optimization (SEO)",
            duration: "3 Weeks",
            summary: "Learn how to get websites to show up at the top of Google search results for free.",
            whyMatters: "Google gets billions of searches daily—ranking high brings millions of free visitors to your app.",
            concepts: ["Google Keywords", "On-Page Articles", "Search Ranking"],
            syllabus: [
              "Week 1: Discovering what phrases and questions people search for on Google.",
              "Week 2: Writing articles and organizing web pages so Google ranks them higher.",
              "Week 3: Getting other respectable websites to link back to your content."
            ],
            resources: [
              { name: "Ahrefs SEO Academy", url: "https://ahrefs.com/academy" }
            ],
            project: "Perform a keyword analysis and plan 3 blog article topics for a fitness app."
          }
        ]
      },
      {
        id: "business-analyst",
        title: "Business Analyst",
        icon: "pie-chart",
        tagline: "Bridge business requirements with tech teams to streamline company operations.",
        steps: [
          {
            id: "nontech-ba-1",
            title: "Process Mapping & Requirements",
            duration: "3 Weeks",
            summary: "Study how a company currently operates, find bottlenecks, and design smoother workflows.",
            whyMatters: "Saves companies time and money by fixing inefficient or redundant daily procedures.",
            concepts: ["Flowchart Diagrams", "Finding Bottlenecks", "Clear Step Lists"],
            syllabus: [
              "Week 1: Interviewing employees to understand their current daily task problems.",
              "Week 2: Drawing visual flowcharts that show how work moves through a company.",
              "Week 3: Creating an improved, step-by-step 'Future Process' plan."
            ],
            resources: [
              { name: "IIBA Beginner Guide", url: "https://www.iiba.org/" }
            ],
            project: "Draw a simple flowchart diagram showing how a customer order gets fulfilled from purchase to delivery."
          }
        ]
      },
      {
        id: "scrum-master",
        title: "Scrum Master / Agile Coach",
        icon: "users",
        tagline: "Facilitate team teamwork, run daily standup meetings, and remove project blockers.",
        steps: [
          {
            id: "nontech-sm-1",
            title: "Agile Planning & Team Sprints",
            duration: "2 Weeks",
            summary: "Learn how modern software teams organize work into short 2-week mini-goals called 'Sprints'.",
            whyMatters: "Helps teams build apps iteratively without getting overwhelmed by giant long-term deadlines.",
            concepts: ["2-Week Sprints", "Daily Standup Meetings", "Task Boards"],
            syllabus: [
              "Week 1: Understanding Agile principles and setting up Trello/Jira task boards.",
              "Week 2: Hosting short daily check-in meetings to help team members clear roadblocks."
            ],
            resources: [
              { name: "Official Scrum Guide", url: "https://scrumguides.org/" }
            ],
            project: "Set up a digital Kanban task board (To Do, In Progress, Done) for a 2-week app build."
          }
        ]
      },
      {
        id: "tech-writer",
        title: "Technical Writer & Docs Specialist",
        icon: "file-text",
        tagline: "Write simple, clear help guides, manuals, and developer documentation.",
        steps: [
          {
            id: "nontech-tw-1",
            title: "Writing Easy Tech Guides",
            duration: "2 - 3 Weeks",
            summary: "Translate complex code and tech features into clear, simple instructions anyone can follow.",
            whyMatters: "Great technology is useless if nobody can figure out how to use it!",
            concepts: ["Clear Step-by-Step Writing", "User Guides", "Markdown Docs"],
            syllabus: [
              "Week 1: Writing with direct, simple language and avoiding confusing tech jargon.",
              "Week 2: Formatting clean help articles with headings, code samples, and screenshots.",
              "Week 3: Publishing documentation on web-based help sites."
            ],
            resources: [
              { name: "Write the Docs Community Guides", url: "https://www.writethedocs.org/" }
            ],
            project: "Write a 1-page beginner user guide explaining how to set up two-factor security on a smartphone."
          }
        ]
      },
      {
        id: "solutions-architect",
        title: "Solutions Architect / Tech Sales",
        icon: "layers",
        tagline: "Match client business problems with the perfect technical software solutions.",
        steps: [
          {
            id: "nontech-sa-1",
            title: "Client Discovery & Pitch Proposals",
            duration: "3 Weeks",
            summary: "Listen to business needs, map out software tools that solve their problems, and present pitches.",
            whyMatters: "Helps non-technical business leaders understand what tech tools they need to buy.",
            concepts: ["Client Interviews", "Software Blueprints", "Proposal Pitches"],
            syllabus: [
              "Week 1: Asking effective questions to discover a business's tech pain points.",
              "Week 2: Recommending cloud tools and estimating monthly implementation costs.",
              "Week 3: Writing visual proposals and presenting solutions confidently."
            ],
            resources: [
              { name: "AWS Cloud Practitioner Basics", url: "https://aws.amazon.com/training/" }
            ],
            project: "Create a 3-slide visual pitch proposing cloud software for a local retail store."
          }
        ]
      }
    ]
  }
};

// --- QUIZ QUESTIONS DATASET ---
const QUIZ_QUESTIONS = [
  {
    question: "What kind of daily problem-solving sounds most exciting to you?",
    options: [
      { text: "Designing screen layouts, colors, and visual prototypes", category: "non-tech", roleId: "uiux-designer" },
      { text: "Writing code, building web pages, or creating server systems", category: "tech", roleId: "frontend" },
      { text: "Analyzing numbers, spreadsheets, and visual trends", category: "tech", roleId: "data-analyst" },
      { text: "Leading team strategy, organizing projects, and planning features", category: "non-tech", roleId: "product-manager" }
    ]
  },
  {
    question: "How do you feel about writing programming code?",
    options: [
      { text: "I want to learn step-by-step programming (HTML/JS/Python/SQL)!", category: "tech", roleId: "fullstack" },
      { text: "I prefer visual design software (Figma) and zero coding.", category: "non-tech", roleId: "uiux-designer" },
      { text: "I like business workflows, flowcharts, and clear team communication.", category: "non-tech", roleId: "business-analyst" },
      { text: "I want to work with cloud platforms, servers, or cybersecurity.", category: "tech", roleId: "devops" }
    ]
  },
  {
    question: "What is your main career goal right now?",
    options: [
      { text: "Become a software developer or app builder", category: "tech", roleId: "frontend" },
      { text: "Become a UX designer crafting app screen interfaces", category: "non-tech", roleId: "uiux-designer" },
      { text: "Work in data analytics, AI, or cybersecurity defense", category: "tech", roleId: "ai-engineer" },
      { text: "Guide product strategy, agile teams, or technical sales", category: "non-tech", roleId: "product-manager" }
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
  document.body.style.overflow = "auto";
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
          <span class="text-slate-500 font-medium">${role.steps.length} Milestones</span>
          <span class="text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
            Start Pathway <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
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
  document.body.style.overflow = "auto";
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
  document.body.style.overflow = "auto";
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

// --- BEGINNER PROGRESS TRACKER ---
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

// --- GENERAL MODAL UTILS (WITH SCROLL MANAGEMENT) ---
function openModal() {
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Prevent background scroll when modal is open
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
    document.body.style.overflow = "auto"; // Re-enable scroll when modal is closed
  }, 200);
}
