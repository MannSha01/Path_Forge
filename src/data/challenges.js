export const initialChallengeCode = `import React, { useState } from "react";

export default function CounterChallenge() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: "24px", color: "#e2e8f0", backgroundColor: "#0f172a", minHeight: "100vh" }}>
      <h3>Skill Task: Increment Counter</h3>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}`;
