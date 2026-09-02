# Path Forge — Database Architecture & Entity Schemas

## 1. Overview

Path Forge uses a **dual-tier persistence architecture**:
- **Production Mode:** Remote database integration (PostgreSQL / Supabase / Firebase Firestore) configured via `DATABASE_URL` in `.env.local`.
- **Local / Offline Mode:** High-performance, schema-compatible persistent browser store (IndexedDB / LocalStorage) managed via [`databaseService.js`](file:///c:/Users/MY-PC/Documents/Github_Repo/Path_Forge/src/services/database/databaseService.js).

This ensures complete offline capability and zero setup barriers for local development.

---

## 2. Entity Schemas

### `users`
```typescript
interface User {
  userId: string;          // Primary Key (e.g. usr_12345)
  email: string;           // Candidate email address
  displayName: string;     // Candidate display name
  photoURL: string;        // Avatar image URL
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}
```

### `goals`
```typescript
interface Goal {
  goalId: string;          // Primary Key (e.g. goal_12345)
  userId: string;          // Foreign Key -> users.userId
  targetPosition: string;  // e.g. "Frontend Developer"
  targetCompany: string;   // e.g. "Stripe" or "Industry Standard"
  targetRoleId: string;    // Matching curriculum role slug (e.g. "frontend")
  jobDescription?: string; // Raw text of job description
  jobUrl?: string;         // Link to job posting
  deadline: string;        // Target completion date (YYYY-MM-DD)
  dailyMinutes: number;    // Dedicated study budget per day (e.g. 60)
  resumeText?: string;     // Extracted candidate resume text
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}
```

### `skill_profiles`
```typescript
interface SkillEntry {
  skill: string;             // Skill title (e.g. "React Hooks")
  category: string;          // Category tag (e.g. "frontend", "core")
  mastery: number;           // Integer 0–100 representing demonstrated competence
  confidence: number;        // Integer 0–100 representing consistency
  difficulty: string;        // "easy" | "medium" | "hard" | "interview"
  correctAnswers: number;    // Cumulative correct answers
  wrongAnswers: number;      // Cumulative incorrect answers
  consecutiveCorrect: number;// Current positive streak
  consecutiveWrong: number;  // Current negative streak
  needsRevision: boolean;    // Flagged for scheduler reinforcement
  accelerated: boolean;      // Flagged for accelerated pacing
  lastTested: string | null; // ISO 8601 timestamp
}

interface SkillProfile {
  userId: string;                      // Foreign Key -> users.userId
  skills: Record<string, SkillEntry>;  // Keyed by skill name
  updatedAt: string;                   // ISO 8601 timestamp
}
```

### `study_plans` & `plan_items`
```typescript
interface PlanItem {
  itemId: string;           // Unique item key
  dayIndex: number;         // Day 1, Day 2, etc.
  date: string;             // YYYY-MM-DD
  topicId: string;          // Foreign Key -> curriculum topic
  title: string;            // Task title
  skill: string;            // Primary skill tested
  durationMinutes: number;  // Planned minutes
  type: "lesson" | "practice" | "reinforcement" | "project";
  status: "completed" | "current" | "next" | "scheduled" | "needs_revision" | "accelerated";
}

interface StudyPlan {
  planId: string;           // Primary Key
  userId: string;           // Foreign Key -> users.userId
  goalId: string;           // Foreign Key -> goals.goalId
  schedule: {
    items: PlanItem[];
    totalMinutes: number;
    availableDays: number;
    pacingWarning: boolean;
    suggestedDailyMinutes: number;
  };
  updatedAt: string;
}
```

### `question_attempts`
```typescript
interface QuestionAttempt {
  attemptId: string;        // Primary Key
  userId: string;           // Foreign Key -> users.userId
  questionId: string;       // Foreign Key -> question ID
  skill: string;            // Tested skill
  difficulty: string;       // "easy" | "medium" | "hard" | "interview"
  selectedIndex: number;    // Selected option index
  isCorrect: boolean;       // Outcome
  timestamp: string;        // ISO 8601 timestamp
}
```

### `notes`
```typescript
interface Note {
  noteId: string;           // Primary Key
  userId: string;           // Foreign Key -> users.userId
  lessonId: string;         // Lesson identifier
  title: string;            // Note title
  summary: string;          // High-yield synopsis
  keyConcepts: string[];    // Core principles
  definitions: Array<{ term: string; definition: string }>;
  examples: string[];       // Code or architecture examples
  commonMistakes: string[]; // Antipatterns
  interviewPoints: string[];// Technical interview questions & answers
  createdAt: string;        // ISO 8601 timestamp
}
```

---

## 3. Security & Access Control

- **Data Privacy:** Users may only query and modify records where `record.userId === authenticatedUser.userId`.
- **Credential Storage:** No passwords, OAuth refresh tokens, or service account keys are stored in database records.
- **Migration Guarantee:** Unauthenticated local progress is migrated gracefully into the user's account upon sign-in without deleting historical entries.
