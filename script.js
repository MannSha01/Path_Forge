// Remove splash screen automatically
setTimeout(() => {
  const splash = document.getElementById('splash');
  if (splash) splash.remove();
}, 4200);

const rolesData = {
  tech: [
    { title: "Frontend Developer", desc: "Build UIs using React, HTML/CSS, and JS." },
    { title: "Backend Engineer", desc: "Design APIs and server logic using Node.js/Python." },
    { title: "Data Analyst", desc: "Transform data into business insights using SQL & Tableau." }
  ],
  'non-tech': [
    { title: "Product Manager", desc: "Lead product vision and cross-functional teams." },
    { title: "UI/UX Designer", desc: "Design wireframes and interactive prototypes in Figma." },
    { title: "Digital Marketer", desc: "Drive customer growth through SEO and campaign strategy." }
  ]
};

let historyStack = ['view-landing'];

// Smooth Page Transition Handler
function transitionToView(currentViewId, nextViewId, callback) {
  const currentView = document.getElementById(currentViewId);
  const nextView = document.getElementById(nextViewId);

  if (!currentView || !nextView) return;

  // 1. Play exit transition
  currentView.classList.remove('view-enter');
  currentView.classList.add('view-exit');

  // 2. Wait 200ms then swap view
  setTimeout(() => {
    currentView.classList.add('hidden');
    currentView.classList.remove('view-exit');

    if (callback) callback();

    // 3. Play enter transition
    nextView.classList.remove('hidden');
    nextView.classList.add('view-enter');

    // Toggle back button
    const backBtn = document.getElementById('back-btn');
    if (nextViewId !== 'view-landing') {
      backBtn.classList.remove('hidden');
    } else {
      backBtn.classList.add('hidden');
    }
  }, 200);
}

function handleCategoryClick(category) {
  const currentView = historyStack[historyStack.length - 1];
  historyStack.push('view-roles');

  transitionToView(currentView, 'view-roles', () => {
    populateRoles(category);
  });
}

function populateRoles(category) {
  const grid = document.getElementById('roles-grid');
  const title = document.getElementById('roles-title');
  
  title.innerText = category === 'tech' ? 'Tech & Engineering Roles' : 'Non-Tech & Business Roles';
  grid.innerHTML = '';

  rolesData[category].forEach(role => {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.onclick = () => handleRoleClick(role.title, role.desc, category);
    card.innerHTML = `
      <h3 style="font-size: 20px; font-weight: 800; color: #ffffff;">${role.title}</h3>
      <p style="font-size: 13px; color: #94a3b8; margin-top: 8px;">${role.desc}</p>
      <div style="margin-top: 16px; font-size: 13px; font-weight: 700; color: #818cf8;">View Roadmap →</div>
    `;
    grid.appendChild(card);
  });
}

function handleRoleClick(roleTitle, roleDesc, category) {
  const currentView = historyStack[historyStack.length - 1];
  historyStack.push('view-roadmap');

  transitionToView(currentView, 'view-roadmap', () => {
    populateRoadmap(roleTitle, roleDesc, category);
  });
}

function populateRoadmap(roleTitle, roleDesc, category) {
  document.getElementById('roadmap-title').innerText = roleTitle;
  document.getElementById('roadmap-desc').innerText = roleDesc;
  document.getElementById('roadmap-domain').innerText = category.toUpperCase() + ' PATHWAY';

  const stepsContainer = document.getElementById('roadmap-steps');
  stepsContainer.innerHTML = `
    <div class="glass-card" style="margin-bottom: 12px;">
      <h4 style="color: #38bdf8;">Phase 1: Foundations</h4>
      <p style="font-size: 13px; color: #94a3b8;">Master core concepts and tools.</p>
    </div>
    <div class="glass-card" style="margin-bottom: 12px;">
      <h4 style="color: #818cf8;">Phase 2: Projects</h4>
      <p style="font-size: 13px; color: #94a3b8;">Build hands-on portfolio projects.</p>
    </div>
    <div class="glass-card">
      <h4 style="color: #34d399;">Phase 3: Career Prep</h4>
      <p style="font-size: 13px; color: #94a3b8;">Resume, interviews, and applications.</p>
    </div>
  `;
}

function goBack() {
  if (historyStack.length > 1) {
    const currentView = historyStack.pop();
    const prevView = historyStack[historyStack.length - 1];
    transitionToView(currentView, prevView);
  }
}

function resetToLanding() {
  if (historyStack.length > 1) {
    const currentView = historyStack[historyStack.length - 1];
    historyStack = ['view-landing'];
    transitionToView(currentView, 'view-landing');
  }
}
