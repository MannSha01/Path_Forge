// ===================================================
// PATH FORGE - CAREER QUIZ QUESTIONS
// Role-mapping questionnaire dataset
// ===================================================

export const QUIZ_QUESTIONS = [
  {
    question: "1. What sounds like the most fun thing to build or work on?",
    options: [
      { text: "🎨 Designing clean visual interfaces and mobile app layouts", category: "non-tech", roleId: "uiux-designer" },
      { text: "💻 Writing code to make websites interactive and responsive", category: "tech", roleId: "frontend" },
      { text: "📊 Finding hidden patterns, trends, and charts in raw data", category: "tech", roleId: "data-analyst" },
      { text: "🚀 Planning a new app idea, user strategy, and feature list", category: "non-tech", roleId: "product-manager" }
    ]
  },
  {
    question: "2. How do you prefer to solve problems day-to-day?",
    options: [
      { text: "🎧 Deep focus mode: Writing logic, fixing bugs, or building tools", category: "tech", roleId: "backend" },
      { text: "✏️ Creative mode: Sketching ideas, choosing colors, and user testing", category: "non-tech", roleId: "uiux-designer" },
      { text: "💬 People mode: Helping team members, running catch-ups, and organizing tasks", category: "non-tech", roleId: "product-manager" },
      { text: "📊 Analyst mode: Finding trends in spreadsheet data", category: "tech", roleId: "data-analyst" }
    ]
  },
  {
    question: "3. How do you feel about coding vs. visual creativity?",
    options: [
      { text: "I want code to be my main superpower (HTML, JavaScript, React)", category: "tech", roleId: "frontend" },
      { text: "I prefer zero code — give me visual design tools like Figma", category: "non-tech", roleId: "uiux-designer" },
      { text: "I prefer fullstack engineering across frontend & backend", category: "tech", roleId: "fullstack" },
      { text: "I prefer business strategy, user requirements, and product roadmaps", category: "non-tech", roleId: "product-manager" }
    ]
  },
  {
    question: "4. What kind of topics get you most excited?",
    options: [
      { text: "Building cool full-stack web applications", category: "tech", roleId: "fullstack" },
      { text: "Crafting beautiful design systems and smooth animations", category: "non-tech", roleId: "uiux-designer" },
      { text: "Analyzing data insights to increase business profits", category: "tech", roleId: "data-analyst" },
      { text: "Launching new digital software products", category: "non-tech", roleId: "product-manager" }
    ]
  },
  {
    question: "5. What is your primary career goal right now?",
    options: [
      { text: "Become a Web Developer or Software Engineer", category: "tech", roleId: "frontend" },
      { text: "Become a Product UI/UX Designer", category: "non-tech", roleId: "uiux-designer" },
      { text: "Become a Product Manager", category: "non-tech", roleId: "product-manager" },
      { text: "Become a Data Analyst", category: "tech", roleId: "data-analyst" }
    ]
  }
];
