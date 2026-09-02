# 🛠️ PATH FORGE
> **An Adaptive AI Career Preparation Operating System**

Path Forge is an adaptive AI-powered career preparation platform that continuously determines what a candidate needs to learn, teaches the underlying concepts, evaluates practical understanding, and dynamically reschedules the remaining curriculum based on test performance, skill level, target deadline, and available daily study time.

---

## 🚀 Core Adaptive Learning Loop

```text
                  CAREER GOAL
                       ↓
              RESUME + JOB REQUIREMENTS
                       ↓
               SKILL GAP ANALYSIS
                       ↓
              PERSONALIZED PLAN
                       ↓
                 AI TEACHER
                       ↓
                  PRACTICE
                       ↓
                  QUESTIONS
                       ↓
                  EVALUATION
                       ↓
               SKILL MODEL UPDATE
                       ↓
               PLAN RESCHEDULING
                       ↓
                 NEXT LESSON
                       ↓
                     ...
                       ↓
                   JOB READY
```

---

## 📌 Core Features

- [x] **Goal Setup & AI Gap Analysis**: Target specific positions and companies with job description analysis, deadline countdowns, and resume evaluation.
- [x] **Skill Profile Engine**: Continuously tracks bounded mastery ($0–100$) and confidence based on answer difficulty (easy/medium/hard).
- [x] **Deterministic Adaptive Scheduler**: Calculates calendar dates, lesson durations, and prerequisite chains. Automatically injects reinforcement sessions upon mistakes or accelerates the timeline upon mastery streaks.
- [x] **Continuous AI Teacher**: Interactive lessons with concept explanations, code examples, key principles, common pitfalls, and scenario questions.
- [x] **Study Notes & PDF Export**: Automatically compiles structured notes with definitions and interview questions; download as `.txt` or printable PDF.
- [x] **Personalized Dashboard**: Job Readiness percentage ring, deadline countdown, today's study minutes tracker, live skill gaps, and today's action plan.
- [x] **Adaptive Roadmap**: Visual timeline reflecting live schedule changes with status badges (*Completed*, *Current*, *Next*, *Scheduled*, *Needs Revision*, *Accelerated*).
- [x] **Offline-First & Persistent**: Dual-tier database service with instant local persistent fallback.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** Semantic HTML5, Tailwind CSS, Vanilla JavaScript (ES6+ native modules), HTML5 Canvas constellation animation, Canvas Confetti.
- **Backend / Serverless:** Vercel Serverless Functions (`/api/*` in Node.js) for Gemini 1.5 Flash.
- **Data & Scheduling:** Pure declarative prerequisite graph with deterministic scheduling algorithms ($< 5\text{ms}$ calculation time).
- **Authentication:** Firebase Google Sign-In with safe local development fallback.
- **Security:** Strict separation of server secrets. `GEMINI_API_KEY` is never exposed to browser bundles.

---

## 💻 Local Development Setup

### 1. Clone & Configure Environment
```bash
# 1. Copy the example environment template
cp .env.example .env.local

# 2. Open .env.local and configure credentials if available
# (Platform works out-of-the-box with local deterministic fallbacks if left blank)
```

### 2. Run Local Server
```bash
# Using Node / npx
npx serve -l 3000

# Or using Python 3
python -m http.server 3000
```
Open `http://localhost:3000` in your web browser.

---

## 🔐 Credentials Setup Checklist

| Credential | Config File | Variable Name | How to Obtain |
| :--- | :--- | :--- | :--- |
| **Gemini API Key** | `.env.local` | `GEMINI_API_KEY=` | [Google AI Studio](https://aistudio.google.com/) |
| **Firebase Auth** | `.env.local` | `FIREBASE_API_KEY=`<br>`FIREBASE_AUTH_DOMAIN=`<br>`FIREBASE_PROJECT_ID=`<br>`FIREBASE_STORAGE_BUCKET=`<br>`FIREBASE_MESSAGING_SENDER_ID=`<br>`FIREBASE_APP_ID=` | [Firebase Console](https://console.firebase.google.com/) → Project Settings |
| **Remote Database** | `.env.local` | `DATABASE_URL=` | Optional PostgreSQL / Supabase connection string |
| **AI Model Configuration** | `.env.local` | `AI_PROVIDER=gemini`<br>`AI_MODEL=gemini-1.5-flash`<br>`AI_FAST_MODEL=gemini-1.5-flash` | Configurable per deployment |

---

## 📖 In-Depth Documentation
- [System Architecture](docs/architecture.md)
- [Database Schemas & Persistence](docs/database.md)
- [Learning Engine & Skill Formulas](docs/learning-engine.md)
- [Deterministic Adaptive Scheduler](docs/scheduler.md)
- [AI Subsystem & Task Routing](docs/ai.md)

---

## 👥 Team
- Mann Sharma (25BAI10379)
- Jayant Yadav (25BAI11172)
- Anmol Shrivastva (25BAI10263)
- Apoorva Krishna Tripathi (25BAI11098)
- Divyansh Mishra (25BAI11302)
- Harshvardhan Singh (25BAI11615)

## 📄 License
MIT License
