# Path Forge — AI Subsystem, Providers & Task Routing

## 1. Architectural Boundary & Security

All interactions with generative models occur through **serverless backend API endpoints** running in a Node.js runtime.

```text
┌──────────────────────────────────────────────┐
│  Browser / Client                            │
│  src/services/ai/aiService.js                │
└──────────────────────┬───────────────────────┘
                       │ Internal POST Requests (JSON)
                       ▼
┌──────────────────────────────────────────────┐
│  Serverless Endpoints (/api/*)               │
│  api/analyzeGoal.js                          │
│  api/generateLesson.js                       │
│  api/evaluateAnswer.js                       │
│  api/generateNotes.js                        │
│  api/generate.js                             │
│  (Reads process.env.GEMINI_API_KEY securely) │
└──────────────────────┬───────────────────────┘
                       │ Google Generative Language API
                       ▼
┌──────────────────────────────────────────────┐
│  Google Gemini 1.5 Flash Model               │
└──────────────────────────────────────────────┘
```

> [!CAUTION]
> **Strict Secret Isolation:** `GEMINI_API_KEY` is **never** bundled into or exposed to browser code. Browser requests never talk directly to `googleapis.com`.

---

## 2. Model Configuration & Environment Variables

Model parameters are dynamically read from environment variables:

```env
# AI Model Selection
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-flash
AI_FAST_MODEL=gemini-1.5-flash
GEMINI_API_KEY=
```

- **Stronger Models (`AI_MODEL`)**: Used for deep multi-skill resume gap extraction (`/api/analyzeGoal`) and structured lesson creation (`/api/generateLesson`).
- **Fast Models (`AI_FAST_MODEL`)**: Used for rapid question misconception evaluation (`/api/evaluateAnswer`) and study note compilation (`/api/generateNotes`).

---

## 3. Task Routing & API Contracts

### 1. `POST /api/analyzeGoal`
- **Purpose:** Extracts skills from job description & resume, computes missing gaps and estimated readiness.
- **Output:**
  ```json
  {
    "analysis": {
      "targetRole": "Frontend Developer",
      "targetCompany": "Stripe",
      "requiredSkills": ["HTML5/CSS3", "JavaScript ES6+", "React", "State Management", "Testing"],
      "currentSkills": ["HTML5/CSS3", "JavaScript ES6+"],
      "skillGaps": ["React", "State Management", "Testing"],
      "strengths": ["Strong foundational programming"],
      "weaknesses": ["Component state lifecycles"],
      "prioritySkills": ["React", "State Management"],
      "estimatedReadiness": 55,
      "recommendedProjects": ["SaaS Dashboard with State Machine"],
      "interviewTopics": ["DOM Reconciliation & Virtual DOM"]
    }
  }
  ```

### 2. `POST /api/generateLesson`
- **Purpose:** Produces structured conceptual lessons with concrete code examples, key principles, common traps, and targeted scenario questions.
- **Output:**
  ```json
  {
    "lesson": {
      "title": "React Hooks & State Architecture",
      "objective": "Understand state immutability and component side-effects.",
      "explanation": "Detailed technical exposition...",
      "examples": ["Code snippet 1", "Code snippet 2"],
      "keyPoints": ["useState triggers re-renders", "Dependencies array controls useEffect"],
      "commonMistakes": ["Mutating state directly", "Omitting variables from dependency arrays"],
      "questions": [{ "id": "q1", "question": "...", "options": [...], "correctIndex": 0 }]
    }
  }
  ```

### 3. `POST /api/evaluateAnswer`
- **Purpose:** Evaluates answer rationale and diagnoses misconceptions.

### 4. `POST /api/generateNotes`
- **Purpose:** Compiles clean, high-yield study summaries, definitions, and technical interview points for permanent persistence and PDF/TXT export.

---

## 4. Graceful Fallback Guarantees

If `GEMINI_API_KEY` is not yet configured or the external network is unreachable:
1. The backend endpoint returns status `503 Service Unavailable` with a descriptive message.
2. The client [`aiService.js`](file:///c:/Users/MY-PC/Documents/Github_Repo/Path_Forge/src/services/ai/aiService.js) catches the failure and immediately provides high-quality **deterministic fallback analysis and lessons** based on [`curriculum.js`](file:///c:/Users/MY-PC/Documents/Github_Repo/Path_Forge/src/data/curriculum.js).
3. The platform remains 100% interactive and functional during offline testing.
