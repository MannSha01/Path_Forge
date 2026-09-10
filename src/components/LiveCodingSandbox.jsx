import React from "react";
import { Sandpack } from "@codesandbox/sandpack-react";

export default function LiveCodingSandbox({ template = "react", initialCode }) {
  const defaultCode = `export default function App() {
  return (
    <div style={{ padding: '20px', color: '#fff', backgroundColor: '#0f172a', minHeight: '100vh' }}>
      <h2>🚀 Path Forge Live Practice</h2>
      <p>Edit the code here to test your solution in real-time!</p>
    </div>
  );
}`;

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-2xl overflow-hidden">
      <Sandpack
        template={template}
        theme="sandpack-dark"
        options={{
          showNavigator: false,
          showLineNumbers: true,
          showInlineErrors: true,
          editorHeight: 500,
          autorun: true,
        }}
        files={{
          "/App.js": initialCode || defaultCode,
        }}
      />
    </div>
  );
}
