# Path Forge — Deterministic Adaptive Scheduler

## 1. Design Rationale

> **Core Rule:** Never ask an LLM to rewrite the entire calendar schedule after every question attempt.

Calling an LLM for calendar arithmetic introduces:
- High latency (2–5 seconds per question evaluation).
- Unpredictable date hallucinations (e.g. invalid dates, skipped days).
- High API cost.
- Fragile scheduling consistency.

Path Forge separates **AI content generation** from **deterministic calendar budgeting**:
- **AI** handles teaching, reasoning, concept explanations, and misconception diagnoses.
- The **Deterministic Scheduler** ([`scheduler.js`](file:///c:/Users/MY-PC/Documents/Github_Repo/Path_Forge/src/services/scheduler/scheduler.js)) executes mathematical scheduling in **< 5 milliseconds**.

---

## 2. Scheduling Algorithm & Pipeline

```text
               ┌──────────────────────────────┐
               │         INPUT DATA           │
               │ • Curriculum Topics Graph    │
               │ • Live Skill Profile         │
               │ • Goal Deadline              │
               │ • Daily Minutes Budget       │
               │ • Completed Topic IDs        │
               └──────────────┬───────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │ 1. FILTER REMAINING TOPICS   │
               │ Exclude completed topics     │
               └──────────────┬───────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │ 2. REINFORCEMENT INJECTION   │
               │ Check needsRevision flags;   │
               │ inject 30m reinforcement     │
               │ sessions at priority index 0 │
               └──────────────┬───────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │ 3. PREREQUISITE SEQUENCING   │
               │ Order topics by dependency   │
               └──────────────┬───────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │ 4. DAILY BUCKET ASSIGNMENT   │
               │ Accumulate tasks up to daily │
               │ minute budget; rollover days │
               └──────────────┬───────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │ 5. FEASIBILITY & PACING      │
               │ Total Required > Capacity?   │
               │ Flag pacingWarning & suggest │
               │ higher daily minutes budget  │
               └──────────────────────────────┘
```

---

## 3. Dynamic Scheduling Behaviors

### When the User Struggles (Mistake on Topic A):
1. Skill profile marks `needsRevision: true`.
2. Scheduler inserts an immediate **Reinforcement & Targeted Practice** session for Topic A.
3. Subsequent downstream topics automatically shift forward by 1 calendar day.
4. The timeline updates with a high-visibility `Needs Revision ⚠️` badge.

### When the User Excels (3+ Correct on Topic A):
1. Skill profile marks `accelerated: true`.
2. Estimated duration for Topic A shrinks from 45 min down to 25 min.
3. Downstream prerequisite-safe topics advance earlier on the calendar.
4. Saved days prior to the deadline are automatically dedicated to Capstone Portfolio Projects and Mock Technical Interview sprints.

### Pacing Safety Guard:
If the total required minutes exceed the remaining capacity:
$$\sum \text{Task Minutes} > \text{Days Remaining} \times \text{Daily Minutes}$$
The scheduler sets `pacingWarning: true` and calculates the exact adjusted daily minutes needed:
$$\text{SuggestedDailyMinutes} = \left\lceil \frac{\sum \text{Task Minutes}}{\text{Days Remaining}} \right\rceil$$
