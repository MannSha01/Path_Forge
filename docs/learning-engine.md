# Path Forge — Adaptive Learning Engine & Skill Mathematics

## 1. Skill Profile Model

Every skill within Path Forge is represented as a living competency record:

$$\text{SkillState} = \{ \text{Mastery}, \text{Confidence}, \text{Difficulty}, \text{Streaks}, \text{Flags} \}$$

Values for $\text{Mastery}$ and $\text{Confidence}$ are bounded strictly between $0$ and $100$:

$$0 \le \text{Mastery} \le 100, \quad 0 \le \text{Confidence} \le 100$$

---

## 2. Difficulty-Weighted Update Formulas

A candidate's mastery adjustment depends on the difficulty of the question tested. Correct answers on harder questions provide greater validation; mistakes on easy questions signal fundamental gaps:

### Positive Adjustments (Correct Answers)
$$\Delta \text{Mastery} = \begin{cases}
+4 & \text{Difficulty = Easy} \\
+8 & \text{Difficulty = Medium} \\
+12 & \text{Difficulty = Hard / Interview}
\end{cases}$$

$$\Delta \text{Confidence} = \begin{cases}
+5 & \text{Difficulty = Easy} \\
+8 & \text{Difficulty = Medium} \\
+12 & \text{Difficulty = Hard / Interview}
\end{cases}$$

### Negative Adjustments (Incorrect Answers)
$$\Delta \text{Mastery} = \begin{cases}
-10 & \text{Difficulty = Easy (Severe basic misconception)} \\
-7 & \text{Difficulty = Medium} \\
-3 & \text{Difficulty = Hard / Interview (Forgivable advanced edge case)}
\end{cases}$$

$$\Delta \text{Confidence} = \begin{cases}
-12 & \text{Difficulty = Easy} \\
-8 & \text{Difficulty = Medium} \\
-4 & \text{Difficulty = Hard}
\end{cases}$$

---

## 3. Streak Amplification & Flagging Rules

Repeated mistakes or successes compound non-linearly:

1. **Needs Revision Flag (`needsRevision: true`)**:
   - Triggered when $\text{ConsecutiveWrong} \ge 2$.
   - Applies an additional penalty: $\Delta \text{Mastery} \mathrel{-}= 4$.
   - Informs the **Deterministic Scheduler** to immediately insert a 30-minute targeted reinforcement session for this skill into tomorrow's plan.

2. **Accelerated Flag (`accelerated: true`)**:
   - Triggered when $\text{ConsecutiveCorrect} \ge 3$.
   - Grants a streak bonus: $\Delta \text{Mastery} \mathrel{+}= 3$.
   - Clears any previous revision flags.
   - Informs the **Deterministic Scheduler** that downstream prerequisite-safe modules can be advanced ahead of schedule.

---

## 4. Aggregate Job Readiness Percentage

The aggregate Readiness Score displayed on the dashboard reflects the weighted average across all required role skills:

$$\text{Readiness \%} = \operatorname{clamp}\left( \operatorname{round}\left(\frac{\sum_{i=1}^{N} \text{Mastery}(s_i)}{N}\right), 0, 100 \right)$$

Where $N$ is the count of required skills identified during AI Goal Analysis.
