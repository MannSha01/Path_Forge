// ===================================================
// PATH FORGE - MASTER APPLICATION ORCHESTRATOR
// Adaptive Career Platform state machine, routing & lifecycle
// ===================================================

import { PATHWAYS_DATA } from "./data/pathways.js";
import { getTopicsForRole, CURRICULUM_TOPICS, getTopicById } from "./data/curriculum.js";
import { authService } from "./services/auth/authService.js";
import { databaseService } from "./services/database/databaseService.js";
import { aiService } from "./services/ai/aiService.js";
import { generateSchedule } from "./services/scheduler/scheduler.js";
import { progressService } from "./services/learning/progressService.js";
import { LocalStorageService } from "./services/storage/localStorageService.js";
import { $, $$, show, hide, refreshLucide, on } from "./utils/dom.js";
import { initConstellationCanvas, initCustomCursor } from "./utils/animations.js";

// Components
import { initLoginModal, openLoginModal } from "./components/auth/login.js";
import { initUserMenu } from "./components/auth/userMenu.js";
import { initProfileModal, openProfileModal } from "./components/profile/profile.js";
import { initHomeView, updateHomeHeroCTA } from "./components/home/home.js";
import { initGoalForm } from "./components/goal/goalForm.js";
import { renderGoalSummary } from "./components/goal/goalSummary.js";
import { renderDashboard } from "./components/dashboard/dashboard.js";
import { LearningSessionController } from "./components/learning/learningSession.js";
import { renderAdaptiveRoadmap } from "./components/roadmap/roadmap.js";
import { renderNotesList } from "./components/notes/notesViewer.js";
import { initQuiz, openQuizModal } from "./components/quiz/quiz.js";
import { initAiAdvisor, openAIAdvisor } from "./components/aiAdvisor.js";
import { createPathwayCard } from "./components/pathwayCard.js";
import { renderLivePracticeView } from "./components/practice/livePractice.js"; // <-- LIVE CODING INTEGRATION

// --- GLOBAL APPLICATION STATE ---
let currentUser = null;
let currentGoal = null;
let currentSkillProfile = {};
let currentSchedule = null;
let activeView = "landing";
let learningSession = null;

// --- VIEW STATE MACHINE ---

export function switchView(viewName) {
  activeView = viewName;

  const views = {
    landing: $("#view-landing"),
    goal: $("#view-goal"),
    dashboard: $("#view-dashboard"),
    learning: $("#view-learning"),
    notes: $("#view-notes"),
    roles: $("#view-roles"),
    roadmap: $("#view-roadmap"),
    practice: $("#view-practice") // <-- LIVE PRACTICE VIEW REGISTERED
  };

  Object.entries(views).forEach(([name, el]) => {
    if (el) {
      if (name === viewName) {
        show(el);
      } else {
        hide(el);
      }
    }
  });

  // Update back button
  const backBtn = $("#nav-back-btn");
  const backText = $("#back-btn-text");

  if (viewName === "landing") {
    hide(backBtn);
  } else {
    show(backBtn);
    if (backText) {
      backText.textContent = (viewName === "learning" || viewName === "practice") ? "Dashboard" : "Home";
    }
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  refreshLucide();
}

// --- CORE WORKFLOW ACTIONS ---

async function refreshActiveSchedule() {
  if (!currentGoal) return;

  const roleId = currentGoal.targetRoleId || "frontend";
  let candidateTopics = getTopicsForRole(roleId);

  // Fallback to all curriculum topics if role is custom
  if (candidateTopics.length === 0) {
    candidateTopics = Object.values(CURRICULUM_TOPICS).slice(0, 8);
  }

  // Fetch authoritative completed topics from backend database
  let completedMap = {};
  if (currentUser?.userId) {
    const backendProgress = await databaseService.getAllTopicProgress(currentUser.userId);
    Object.values(backendProgress).forEach((tp) => {
      if (tp.status === "COMPLETED" || tp.completedAt) {
        completedMap[tp.topicId] = true;
      }
    });
    // Merge with any offline cached topics
    const cachedMap = LocalStorageService.getUserCompletedTopics(currentUser.userId);
    completedMap = { ...cachedMap, ...completedMap };
    LocalStorageService.setUserCompletedTopics(currentUser.userId, completedMap);
  }

  const adaptations = currentUser?.userId ? await databaseService.getAdaptations(currentUser.userId) : [];

  currentSchedule = generateSchedule({
    topics: candidateTopics,
    skillProfile: currentSkillProfile,
    deadline: currentGoal.deadline,
    dailyMinutes: currentGoal.dailyMinutes || 60,
    completedMap,
    adaptations
  });

  if (currentUser?.userId) {
    await databaseService.saveStudyPlan({
      userId: currentUser.userId,
      goalId: currentGoal.goalId,
      schedule: currentSchedule
    });
  }
}

export async function handleGoalSubmission(payload) {
  // Ensure user is authenticated
  if (!currentUser) {
    openLoginModal();
    return;
  }

  // 1. Analyze goal with AI
  const analysis = await aiService.analyzeGoal(payload);

  // 2. Map target role to matching baseline pathway if available
  let matchedRoleId = "frontend";
  const posLower = payload.targetPosition.toLowerCase();
  Object.values(PATHWAYS_DATA).forEach((cat) => {
    cat.roles.forEach((r) => {
      if (posLower.includes(r.id) || posLower.includes(r.title.toLowerCase())) {
        matchedRoleId = r.id;
      }
    });
  });

  // 3. Persist goal and initialize skill profile
  currentGoal = await databaseService.saveGoal({
    userId: currentUser.userId,
    targetPosition: payload.targetPosition,
    targetCompany: payload.targetCompany,
    targetRoleId: matchedRoleId,
    jobDescription: payload.jobDescription,
    jobUrl: payload.jobUrl,
    deadline: payload.deadline,
    dailyMinutes: payload.dailyMinutes,
    resumeText: payload.resumeText
  });

  currentSkillProfile = {};
  (analysis.requiredSkills || []).forEach((skill) => {
    const isCurrent = (analysis.currentSkills || []).includes(skill);
    currentSkillProfile[skill] = {
      skill,
      category: "core",
      mastery: isCurrent ? 55 : 20,
      confidence: isCurrent ? 50 : 15,
      difficulty: "easy",
      correctAnswers: 0,
      wrongAnswers: 0,
      needsRevision: false,
      accelerated: false
    };
  });

  await databaseService.saveSkillProfile(currentUser.userId, currentSkillProfile);

  // 4. Generate initial adaptive schedule
  await refreshActiveSchedule();

  // 5. Render summary card
  renderGoalSummary(analysis, () => {
    switchView("dashboard");
    loadDashboard();
  });
}

async function loadDashboard() {
  if (!currentUser) {
    openLoginModal();
    return;
  }

  const todayMinutesSpent = await progressService.getTodayMinutes(currentUser.userId);

  renderDashboard({
    user: currentUser,
    goal: currentGoal,
    skillProfile: currentSkillProfile,
    schedule: currentSchedule,
    todayMinutesSpent,
    onContinueLearning: () => startNextLearningSession(),
    onStartPractice: (topicId) => loadPracticeView(topicId) // <-- Trigger live practice from dashboard
  });
}

function startNextLearningSession(topicId = null) {
  if (!currentUser) {
    openLoginModal();
    return;
  }

  // Pick first incomplete task from schedule if not specified
  let targetId = topicId;
  const items = currentSchedule?.items || [];
  if (!targetId) {
    const nextItem = items.find((i) => i.status === "current" || i.status === "next" || i.status === "adapted" || i.status === "needs_revision");
    targetId = nextItem ? nextItem.topicId : "tech-fe-1";
  }

  // Determine next topic ID in sequence
  let nextTopicId = null;
  const currentIdx = items.findIndex((i) => (i.topicId || i.id) === targetId);
  if (currentIdx !== -1) {
    const remaining = items.slice(currentIdx + 1).find((i) => (i.topicId || i.id) !== targetId);
    if (remaining) {
      nextTopicId = remaining.topicId || remaining.id;
    }
  }

  switchView("learning");

  learningSession.startSession({
    user: currentUser,
    topicId: targetId,
    skillProfile: currentSkillProfile,
    goal: currentGoal,
    nextTopicId
  });
}

// --- LIVE PRACTICE & SANDBOX CONTROLLER ---

export function loadPracticeView(topicId = null) {
  if (!currentUser) {
    openLoginModal();
    return;
  }

  switchView("practice");

  renderLivePracticeView({
    containerId: "#view-practice",
    user: currentUser,
    topicId: topicId || "tech-fe-1",
    onComplete: async (completedTopicId) => {
      if (currentUser?.userId) {
        await databaseService.saveTopicProgress({
          uid: currentUser.userId,
          topicId: completedTopicId,
          status: "COMPLETED"
        });
        await refreshActiveSchedule();
      }
      switchView("dashboard");
      await loadDashboard();
    }
  });
}

function loadRoadmapView() {
  const roleId = currentGoal?.targetRoleId || "frontend";
  let items = currentSchedule?.items;

  if (!items || items.length === 0) {
    items = getTopicsForRole(roleId);
  }

  const completedMap = currentUser?.userId
    ? LocalStorageService.getUserCompletedTopics(currentUser.userId)
    : {};

  renderAdaptiveRoadmap({
    title: currentGoal?.targetPosition || "Full Stack Pathway",
    categoryName: currentGoal?.targetCompany || "Adaptive Preparation",
    items,
    completedMap,
    onToggleCheck: async (item, checked) => {
      if (currentUser?.userId) {
        completedMap[item.topicId || item.id] = checked;
        LocalStorageService.setUserCompletedTopics(currentUser.userId, completedMap);
        await databaseService.saveTopicProgress({
          uid: currentUser.userId,
          topicId: item.topicId || item.id,
          status: checked ? "COMPLETED" : "AVAILABLE"
        });
        await refreshActiveSchedule();
        loadRoadmapView();
      }
    },
    onLaunchLesson: (item) => {
      startNextLearningSession(item.topicId || item.id);
    },
    onLaunchPractice: (item) => {
      loadPracticeView(item.topicId || item.id);
    }
  });
}

// --- ROLES SELECTION (FOR EXPLORATION) ---

function showCategoryRoles(categoryKey) {
  const categoryData = PATHWAYS_DATA[categoryKey];
  if (!categoryData) return;

  const roleCategoryBadge = $("#role-category-badge");
  const roleCategoryTitle = $("#role-category-title");
  const rolesGrid = $("#roles-grid");

  if (roleCategoryBadge) roleCategoryBadge.textContent = categoryData.categoryName;
  if (roleCategoryTitle) roleCategoryTitle.textContent = `Explore ${categoryData.categoryName} Tracks`;

  if (rolesGrid) {
    rolesGrid.innerHTML = "";
    categoryData.roles.forEach((role) => {
      const card = createPathwayCard(role, (selectedRole) => {
        // Pre-fill goal form with this role
        const posInput = $("#goal-position");
        if (posInput) posInput.value = selectedRole.title;
        switchView("goal");
      });
      rolesGrid.appendChild(card);
    });
  }

  switchView("roles");
}

// --- BOOTSTRAP INITIALIZATION ---

document.addEventListener("DOMContentLoaded", async () => {
  // Expose legacy globals for external buttons
  window.openAIAdvisor = openAIAdvisor;
  window.selectCategory = (cat) => showCategoryRoles(cat);

  // Initialize visual systems
  initConstellationCanvas("fx-canvas");
  initCustomCursor();

  // Initialize Learning Session Controller
  learningSession = new LearningSessionController({
    containerId: "#learning-session-container",
    onSessionComplete: async ({ nextTopicId, skillProfile }) => {
      currentSkillProfile = skillProfile;
      await refreshActiveSchedule();
      if (nextTopicId) {
        startNextLearningSession(nextTopicId);
      } else {
        switchView("dashboard");
        await loadDashboard();
      }
    }
  });

  function refreshHomeHero(journey = null) {
    const activeTopic = journey?.currentTopicId ? getTopicById(journey.currentTopicId) : null;
    updateHomeHeroCTA({
      authUser: currentUser,
      goal: currentGoal,
      journey,
      activeTopic,
      onResumeLearning: () => {
        startNextLearningSession(journey?.currentTopicId);
      },
      onStartLearning: () => {
        startNextLearningSession();
      },
      onSetGoal: () => switchView("goal"),
      onTakeQuiz: () => openQuizModal(),
      onViewDashboard: () => {
        switchView("dashboard");
        loadDashboard();
      },
      onViewRoadmap: () => {
        switchView("roadmap");
        loadRoadmapView();
      }
    });
  }

  // Auth State Listener
  authService.onAuthStateChanged(async (user) => {
    currentUser = user;
    const uid = user ? (user.uid || user.userId) : null;
    if (uid) {
      currentGoal = await databaseService.getGoalByUserId(uid);
      currentSkillProfile = await databaseService.getSkillProfile(uid);
      const journey = await databaseService.getJourneyState(uid);
      const topicProgressMap = await databaseService.getAllTopicProgress(uid);
      const completedMap = {};
      Object.values(topicProgressMap).forEach((tp) => {
        if (tp.status === "COMPLETED" || tp.completedAt) {
          completedMap[tp.topicId] = true;
        }
      });
      LocalStorageService.setUserCompletedTopics(uid, completedMap);

      if (currentGoal) {
        await refreshActiveSchedule();
      }
      refreshHomeHero(journey);
    } else {
      currentGoal = null;
      currentSkillProfile = {};
      refreshHomeHero(null);
    }
  });

  // Top Nav Items
  on($("#logo-btn"), "click", () => switchView("landing"));
  on($("#nav-goal-btn"), "click", () => switchView("goal"));
  on($("#nav-dashboard-btn"), "click", () => {
    if (!currentUser) {
      openLoginModal();
    } else {
      switchView("dashboard");
      loadDashboard();
    }
  });
  on($("#nav-roadmap-btn"), "click", () => {
    switchView("roadmap");
    loadRoadmapView();
  });
  on($("#nav-practice-btn"), "click", () => { // <-- Live Practice Navigation Button
    if (!currentUser) {
      openLoginModal();
    } else {
      loadPracticeView();
    }
  });
  on($("#nav-notes-btn"), "click", () => {
    if (!currentUser) {
      openLoginModal();
    } else {
      switchView("notes");
      $("#notes-detail-view")?.classList.add("hidden");
      $("#notes-list-view")?.classList.remove("hidden");
      renderNotesList(currentUser.userId);
    }
  });

  // Header login button
  on($("#header-login-btn"), "click", () => openLoginModal());

  // Back Button
  on($("#nav-back-btn"), "click", () => {
    if (activeView === "learning" || activeView === "practice") {
      switchView("dashboard");
      loadDashboard();
    } else {
      switchView("landing");
    }
  });

  // Initialize Modals & Features
  initLoginModal({
    onLoginSuccess: async (user) => {
      currentUser = user;
      const uid = user ? (user.uid || user.userId) : null;
      currentGoal = await databaseService.getGoalByUserId(uid);
      currentSkillProfile = await databaseService.getSkillProfile(uid);
      const journey = await databaseService.getJourneyState(uid);
      const topicProgressMap = await databaseService.getAllTopicProgress(uid);
      const completedMap = {};
      Object.values(topicProgressMap).forEach((tp) => {
        if (tp.status === "COMPLETED" || tp.completedAt) {
          completedMap[tp.topicId] = true;
        }
      });
      LocalStorageService.setUserCompletedTopics(uid, completedMap);

      if (currentGoal) {
        await refreshActiveSchedule();
        if (journey && journey.currentTopicId) {
          switchView("landing");
          refreshHomeHero(journey);
        } else {
          switchView("dashboard");
          await loadDashboard();
        }
      } else {
        switchView("goal");
      }
    }
  });

  initUserMenu({
    onSignOut: () => {
      currentUser = null;
      currentGoal = null;
      currentSkillProfile = {};
      currentSchedule = null;
      switchView("landing");
      refreshHomeHero(null);
    },
    onOpenProfile: () => openProfileModal(currentUser, currentGoal, Object.keys(currentSkillProfile).length)
  });

  initProfileModal({
    onResetData: async () => {
      if (currentUser?.userId) {
        LocalStorageService.setUserCompletedTopics(currentUser.userId, {});
      }
      currentGoal = null;
      currentSkillProfile = {};
      currentSchedule = null;
      switchView("landing");
      refreshHomeHero(null);
    }
  });

  initHomeView({
    onSetGoal: () => switchView("goal"),
    onTakeQuiz: () => openQuizModal(),
    onExploreTech: () => showCategoryRoles("tech"),
    onExploreNonTech: () => showCategoryRoles("non-tech")
  });

  initGoalForm({
    onGoalSubmit: (data) => handleGoalSubmission(data)
  });

  initQuiz({
    pathwaysData: PATHWAYS_DATA,
    onLaunchRole: (role) => {
      const posInput = $("#goal-position");
      if (posInput) posInput.value = role.title;
      switchView("goal");
    }
  });

  initAiAdvisor();

  // Floating AI advisor button & Nav AI button
  on($("#fab-ai-btn"), "click", openAIAdvisor);
  on($("#nav-ai-btn"), "click", openAIAdvisor);

  // Credits Modal
  const creditsBtn = $("#trigger-credits-btn");
  const creditsModal = $("#credits-modal");
  const closeCreditsBtn = $("#close-credits-modal");

  if (creditsBtn && creditsModal) {
    on(creditsBtn, "click", () => creditsModal.classList.remove("opacity-0", "pointer-events-none"));
    on(closeCreditsBtn, "click", () => creditsModal.classList.add("opacity-0", "pointer-events-none"));
    on(creditsModal, "click", (e) => {
      if (e.target === creditsModal) creditsModal.classList.add("opacity-0", "pointer-events-none");
    });
  }

  // Start on Landing View
  switchView("landing");
});
