# Path Forge — Career Pathways Documentation

## 1. Domain Catalog

Path Forge currently offers 12 structured learning pathways split across **Tech & Engineering** and **Non-Tech & Business**.

### Tech & Engineering (`tech`)
| Role ID | Title | Core Focus | Key Milestones |
| :--- | :--- | :--- | :--- |
| `frontend` | Frontend Developer | Client-side web apps with HTML, CSS, JS & React | 4 steps (HTML/CSS, ES6+, Tailwind, React.js) |
| `backend` | Backend Developer | Server runtimes, REST APIs, and relational databases | 3 steps (Node.js/Python, Express APIs, PostgreSQL/Prisma) |
| `fullstack` | Fullstack Engineer | End-to-end web apps connecting UI to backend services | 2 steps (Next.js Framework, Auth & Security) |
| `devops` | DevOps & Cloud Engineer | Linux administration, CI/CD automation & cloud infra | Linux Administration & Bash Scripting |
| `data-analyst` | Data Analyst | SQL queries, data aggregation & dashboard insights | SQL Querying & Data Aggregation |
| `ai-engineer` | Data Scientist & AI Specialist | Applied math, scientific Python & machine learning | Mathematics & Scientific Python |
| `cybersecurity` | Cybersecurity Analyst | Network security, traffic analysis & vulnerability auditing | Computer Networks & Security Fundamentals |

### Non-Tech & Business (`non-tech`)
| Role ID | Title | Core Focus | Key Milestones |
| :--- | :--- | :--- | :--- |
| `product-manager` | Product Manager | Product strategy, feature discovery & roadmapping | Product Discovery & Market Research |
| `uiux-designer` | UI/UX Designer | Human-centered UI design, wireframing & user journeys | UX Research & User Journeys |
| `digital-marketing`| Digital Growth Marketer | SEO, content funnels, paid acquisition & analytics | SEO & Content Marketing Strategy |
| `business-analyst` | Business Analyst | Business process modeling (BPMN) & gap analysis | Business Requirements & Process Modeling |
| `scrum-master` | Scrum Master / Agile Coach | Agile manifesto, Scrum ceremonies & sprint execution | Agile Manifesto & Scrum Ceremonies |
| `solutions-architect`| Solutions Architect / Tech Sales | Technical discovery, enterprise solution scoping & RFPs | Discovery & Solution Scoping |

---

## 2. Pathway Schema Definition

Each pathway step adheres to the following structure in `src/data/pathways.js`:

```javascript
{
  id: "unique-step-identifier",        // String: Unique key used for completion tracking
  title: "Milestone Name",             // String: Title displayed on step card
  duration: "2 - 3 Weeks",             // String: Recommended completion timeframe
  summary: "Brief synopsis of topic",  // String: Concise description
  concepts: [                          // Array<String>: Core competency badges
    "Competency 1",
    "Competency 2"
  ],
  syllabus: [                          // Array<String>: Weekly curriculum bullets
    "Week 1: Foundations",
    "Week 2: Practical Implementation"
  ],
  resources: [                         // Array<{ name, url }>: Curated documentation/courses
    { name: "Resource Title", url: "https://..." }
  ],
  project: "Milestone project prompt"  // String: Real-world portfolio project prompt
}
```

---

## 3. Milestone Completion Tracking

- When a user checks a milestone checkbox, its unique `id` is recorded in `pathforge_completed` within browser `localStorage`.
- Progress percentage is dynamically computed as:
  $$\text{Progress} = \text{round}\left(\frac{\sum \text{Completed Steps}}{\text{Total Steps}} \times 100\right)$$
- Reaching 100% triggers a trophy bounce animation and celebration confetti.
