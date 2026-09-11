// ===================================================
// PATH FORGE - ADMIN CMS & AUTHORIZATION TEST SUITE
// End-to-end unit & integration verification
// ===================================================

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// Server-side auth module
import adminAuthHandler, {
  isAuthorizedAdmin,
  generateAdminSessionToken,
  verifyAdminToken,
  getAuthorizedAdminEmails
} from "../api/adminAuth.js";

// Database service & ContentRenderer
import { databaseService } from "../src/services/database/databaseService.js";
import { ContentRenderer, formatInlineText, escapeHTML } from "../src/components/content/contentRenderer.js";
import { registerDynamicTopic, CURRICULUM_TOPICS } from "../src/data/curriculum.js";
import { LocalStorageService } from "../src/services/storage/localStorageService.js";

describe("Admin CMS: Server-Side Authorization & Security", () => {
  beforeEach(() => {
    LocalStorageService.clear();
  });

  it("TEST 1: isAuthorizedAdmin allows authorized emails and rejects unauthorized users", () => {
    // Default authorized list includes admin@pathforge.dev
    assert.strictEqual(isAuthorizedAdmin("admin@pathforge.dev"), true);
    assert.strictEqual(isAuthorizedAdmin("ADMIN@PATHFORGE.DEV"), true); // Case insensitive

    // Normal student or random user is strictly denied
    assert.strictEqual(isAuthorizedAdmin("student@example.com"), false);
    assert.strictEqual(isAuthorizedAdmin("hacker@malicious.org"), false);
    assert.strictEqual(isAuthorizedAdmin(""), false);
    assert.strictEqual(isAuthorizedAdmin(null), false);
  });

  it("TEST 2: generateAdminSessionToken and verifyAdminToken properly enforce tamper-resistance and permissions", () => {
    const validToken = generateAdminSessionToken("admin@pathforge.dev");
    assert.ok(validToken.startsWith("pf_admin_"));

    const verification = verifyAdminToken(validToken);
    assert.strictEqual(verification.valid, true);
    assert.strictEqual(verification.email, "admin@pathforge.dev");

    // Invalid / forged token
    const forgedToken = "pf_admin_invalid_base64_payload";
    assert.strictEqual(verifyAdminToken(forgedToken).valid, false);

    // Token for non-admin email
    const nonAdminToken = `pf_admin_${Buffer.from(JSON.stringify({ email: "random@user.com", timestamp: Date.now() })).toString("base64")}`;
    assert.strictEqual(verifyAdminToken(nonAdminToken).valid, false);
  });

  it("TEST 3: /api/adminAuth serverless handler returns 403 for unauthorized login attempts", async () => {
    let statusCode = 0;
    let jsonResult = {};

    const mockReq = {
      method: "POST",
      body: { action: "login", email: "unauthorized_user@domain.com" }
    };

    const mockRes = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      }
    };

    await adminAuthHandler(mockReq, mockRes);
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(jsonResult.authorized, false);
    assert.match(jsonResult.error, /Access Denied/i);
  });

  it("TEST 4: /api/adminAuth serverless handler returns 200 with session token for authorized admin", async () => {
    let statusCode = 0;
    let jsonResult = {};

    const mockReq = {
      method: "POST",
      body: { action: "login", email: "admin@pathforge.dev" }
    };

    const mockRes = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      }
    };

    await adminAuthHandler(mockReq, mockRes);
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(jsonResult.authorized, true);
    assert.strictEqual(jsonResult.role, "admin");
    assert.ok(jsonResult.token.startsWith("pf_admin_"));
  });
});

describe("Admin CMS: Topic & Module CRUD, Reordering, and Versioning", () => {
  beforeEach(() => {
    LocalStorageService.clear();
  });

  it("TEST 5: Topic CRUD: create, retrieve, update, and reorder topics", async () => {
    // Create Topic 1
    const topic1 = await databaseService.saveTopic({
      title: "Digital Logic & Circuit Design",
      description: "Learn Boolean algebra, logic gates and circuit synthesis.",
      status: "draft"
    });
    assert.ok(topic1.id);
    assert.strictEqual(topic1.title, "Digital Logic & Circuit Design");
    assert.strictEqual(topic1.status, "draft");

    // Create Topic 2
    const topic2 = await databaseService.saveTopic({
      title: "Computer Architecture",
      description: "CPUs, memory hierarchy, and instruction sets.",
      status: "published"
    });

    // Retrieve all topics
    let topics = await databaseService.getAdminTopics();
    assert.strictEqual(topics.length, 2);

    // Reorder topics
    await databaseService.reorderTopics([topic2.id, topic1.id]);
    topics = await databaseService.getAdminTopics();
    assert.strictEqual(topics[0].id, topic2.id);
    assert.strictEqual(topics[1].id, topic1.id);

    // Update topic title
    const updated = await databaseService.saveTopic({
      ...topic1,
      title: "Digital Logic 2.0"
    });
    assert.strictEqual(updated.title, "Digital Logic 2.0");
  });

  it("TEST 6: Module CRUD: create, edit, duplicate, and delete with cascade", async () => {
    const topic = await databaseService.saveTopic({
      title: "Python Masterclass",
      status: "published"
    });

    // Create module
    const mod1 = await databaseService.saveModule({
      topicId: topic.id,
      title: "Variables & Data Types",
      description: "Foundational Python types",
      estimatedMinutes: 25,
      difficulty: "Beginner",
      status: "draft",
      draftBlocks: [
        { id: "b1", type: "text", data: { content: "Variables hold values." } }
      ]
    });
    assert.ok(mod1.id);
    assert.strictEqual(mod1.topicId, topic.id);
    assert.strictEqual(mod1.draftBlocks.length, 1);

    // Duplicate module
    const dup = await databaseService.duplicateModule(mod1.id);
    assert.ok(dup.id);
    assert.notStrictEqual(dup.id, mod1.id);
    assert.strictEqual(dup.title, "Variables & Data Types (Copy)");
    assert.strictEqual(dup.draftBlocks.length, 1);
    assert.notStrictEqual(dup.draftBlocks[0].id, "b1"); // New block ID generated

    let modules = await databaseService.getAdminModules(topic.id);
    assert.strictEqual(modules.length, 2);

    // Delete topic should cascade delete its modules
    await databaseService.deleteTopic(topic.id);
    const remainingMods = await databaseService.getAdminModules(topic.id);
    assert.strictEqual(remainingMods.length, 0);
  });

  it("TEST 7: Draft vs. Published Safety: Editing a published module saves to draftBlocks without corrupting publishedBlocks", async () => {
    const topic = await databaseService.saveTopic({ title: "Algorithms", status: "published" });
    
    // Create initial module
    const mod = await databaseService.saveModule({
      topicId: topic.id,
      title: "Binary Search",
      status: "draft",
      draftBlocks: [
        { id: "b1", type: "text", data: { content: "Original Binary Search Concept" } }
      ]
    });

    // Publish module
    const publishedMod = await databaseService.publishModule(mod.id, true);
    assert.strictEqual(publishedMod.status, "published");
    assert.strictEqual(publishedMod.publishedBlocks.length, 1);
    assert.strictEqual(publishedMod.publishedBlocks[0].data.content, "Original Binary Search Concept");

    // Modify draft content while published
    await databaseService.saveModule({
      ...publishedMod,
      draftBlocks: [
        { id: "b1", type: "text", data: { content: "WIP Incomplete Draft Edits..." } },
        { id: "b2", type: "code", data: { code: "let x = 1;" } }
      ]
    });

    const refreshedMod = await databaseService.getModule(mod.id);
    // draftBlocks has 2 blocks, while publishedBlocks safely remains 1 block
    assert.strictEqual(refreshedMod.draftBlocks.length, 2);
    assert.strictEqual(refreshedMod.publishedBlocks.length, 1);
    assert.strictEqual(refreshedMod.publishedBlocks[0].data.content, "Original Binary Search Concept");
  });
});

describe("Admin CMS: Universal Shared Content Renderer & Block System", () => {
  it("TEST 8: ContentRenderer correctly renders Text block with inline formatting", () => {
    const textBlock = {
      id: "tb1",
      type: "text",
      order: 0,
      data: {
        heading: "Core Axioms",
        level: "h2",
        content: "Here is **bold text**, _italic text_, and `const a = 10;` inline code.\n\n- First point\n- Second point"
      }
    };

    const html = ContentRenderer.render([textBlock]);
    assert.ok(html.includes("Core Axioms"));
    assert.ok(html.includes("<strong class=\"font-bold text-white\">bold text</strong>"));
    assert.ok(html.includes("<em class=\"italic text-slate-200\">italic text</em>"));
    assert.ok(html.includes("First point"));
    assert.ok(html.includes("Second point"));
  });

  it("TEST 9: ContentRenderer correctly renders Flowchart block with structured nodes & connections", () => {
    const flowBlock = {
      id: "fb1",
      type: "flowchart",
      order: 1,
      data: {
        title: "Decision Logic Tree",
        nodes: [
          { id: "n1", text: "Start Evaluation", type: "start" },
          { id: "n2", text: "Check Condition", type: "decision" },
          { id: "n3", text: "Execute Action", type: "process" },
          { id: "n4", text: "End Process", type: "end" }
        ],
        connections: [
          { from: "n1", to: "n2", label: "" },
          { from: "n2", to: "n3", label: "Yes" },
          { from: "n3", to: "n4", label: "" }
        ]
      }
    };

    const html = ContentRenderer.render([flowBlock]);
    assert.ok(html.includes("Decision Logic Tree"));
    assert.ok(html.includes("Start Evaluation"));
    assert.ok(html.includes("Check Condition"));
    assert.ok(html.includes("Execute Action"));
    assert.ok(html.includes("Yes"));
  });

  it("TEST 10: ContentRenderer correctly renders Code, Callout, Image, and Table blocks", () => {
    const blocks = [
      {
        id: "img1",
        type: "image",
        order: 0,
        data: { url: "https://example.com/diagram.png", caption: "System Diagram", size: "medium" }
      },
      {
        id: "code1",
        type: "code",
        order: 1,
        data: { filename: "main.py", language: "python", code: "def hello():\n    print('Hello world')" }
      },
      {
        id: "callout1",
        type: "callout",
        order: 2,
        data: { type: "tip", title: "Pro Tip", content: "Use vectorized operations for speed." }
      },
      {
        id: "tbl1",
        type: "table",
        order: 3,
        data: {
          title: "Truth Table",
          headers: ["A", "B", "A AND B"],
          rows: [
            ["0", "0", "0"],
            ["1", "1", "1"]
          ]
        }
      }
    ];

    const html = ContentRenderer.render(blocks);
    assert.ok(html.includes("https://example.com/diagram.png"));
    assert.ok(html.includes("System Diagram"));
    assert.ok(html.includes("main.py"));
    assert.ok(html.includes("def hello():"));
    assert.ok(html.includes("Pro Tip"));
    assert.ok(html.includes("Truth Table"));
    assert.ok(html.includes("A AND B"));
  });
});

describe("Admin CMS: Media Library & Student Integration", () => {
  beforeEach(() => {
    LocalStorageService.clear();
  });

  it("TEST 11: Media Library saves, queries, and deletes media assets", async () => {
    const asset = await databaseService.saveMedia({
      name: "architecture_v2.png",
      url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      size: 1024,
      type: "image/png"
    });
    assert.ok(asset.id);

    let library = await databaseService.getMediaLibrary();
    assert.strictEqual(library.length, 1);
    assert.strictEqual(library[0].name, "architecture_v2.png");

    await databaseService.deleteMedia(asset.id);
    library = await databaseService.getMediaLibrary();
    assert.strictEqual(library.length, 0);
  });

  it("TEST 12: Student Curriculum Integration: Published CMS topics dynamically appear in curriculum", async () => {
    // Create and publish a topic
    const topic = await databaseService.saveTopic({
      title: "Quantum Computing & Qubits",
      description: "Superposition, entanglement, and quantum gates.",
      category: "Emerging Tech",
      status: "published"
    });

    await databaseService.saveModule({
      topicId: topic.id,
      title: "Qubits and Superposition",
      estimatedMinutes: 30,
      status: "published",
      publishedBlocks: [
        { id: "b1", type: "text", data: { content: "Quantum bits can exist in multiple states." } }
      ]
    });

    const publishedTopics = await databaseService.getPublishedCurriculumTopics();
    assert.strictEqual(publishedTopics.length, 1);
    assert.strictEqual(publishedTopics[0].title, "Quantum Computing & Qubits");
    assert.strictEqual(publishedTopics[0].modules.length, 1);

    // Register into runtime curriculum
    registerDynamicTopic(publishedTopics[0]);
    assert.ok(CURRICULUM_TOPICS[topic.id]);
    assert.strictEqual(CURRICULUM_TOPICS[topic.id].title, "Quantum Computing & Qubits");
  });

  it("TEST 13: Google Admin Auth validates eligibility against ADMIN_EMAILS", async () => {
    process.env.ADMIN_EMAILS = "anmolshri.30@gmail.com,admin@pathforge.dev";
    let statusCode = 0;
    let jsonResult = {};

    const mockRes = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      }
    };

    // Authorized email check
    await adminAuthHandler(
      { method: "POST", body: { action: "login", email: "anmolshri.30@gmail.com" } },
      mockRes
    );
    assert.strictEqual(statusCode, 200);
    assert.strictEqual(jsonResult.authorized, true);
    assert.strictEqual(jsonResult.email, "anmolshri.30@gmail.com");
    assert.ok(jsonResult.token.startsWith("pf_admin_"));

    // Unauthorized email check
    await adminAuthHandler(
      { method: "POST", body: { action: "login", email: "unauthorized_hacker@domain.com" } },
      mockRes
    );
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(jsonResult.authorized, false);
    assert.match(jsonResult.error, /Access Denied/i);
  });

  it("TEST 14: Admin topic title and content notes trigger Gemini AI analysis", async () => {
    let statusCode = 0;
    let jsonResult = {};

    const mockRes = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      }
    };

    const adminToken = generateAdminSessionToken("admin@pathforge.dev");
    const mockReq = {
      method: "POST",
      headers: { authorization: `Bearer ${adminToken}` },
      body: {
        action: "analyze",
        title: "Advanced System Design & Scalability",
        content: "Load balancers, sharding, replication, and CAP theorem trade-offs."
      }
    };

    const adminTopicsHandler = (await import("../api/adminTopics.js")).default;
    await adminTopicsHandler(mockReq, mockRes);

    assert.strictEqual(statusCode, 200);
    assert.strictEqual(jsonResult.success, true);
    assert.ok(jsonResult.analysis);
    assert.strictEqual(jsonResult.analysis.topicTitle, "Advanced System Design & Scalability");
    assert.ok(Array.isArray(jsonResult.analysis.keywords));
  });

  it("TEST 15: Goal Analysis evaluates importance of published Admin Topics for user goals", async () => {
    const aiService = (await import("../src/services/ai/aiService.js")).aiService;
    const goalData = {
      targetPosition: "Senior Frontend Engineer",
      targetCompany: "Google",
      jobDescription: "Expertise in React, Web Performance, and Architecture.",
      resumeText: "Experienced with HTML, CSS, JavaScript.",
      deadline: "2026-11-01",
      dailyMinutes: 60
    };

    const analysis = await aiService.analyzeGoal(goalData);
    assert.ok(analysis);
    assert.strictEqual(analysis.targetRole, "Senior Frontend Engineer");
    assert.ok(Array.isArray(analysis.requiredSkills));
  });

  it("TEST 16: aiService.generateLesson teaches directly from published Admin Module notes", async () => {
    const topicId = "adm_topic_test_101";

    // Save published module with notes
    await databaseService.saveModule({
      id: "mod_test_101",
      topicId,
      title: "Mastering Distributed Caching",
      description: "Admin notes covering Redis, Memcached, and eviction policies.",
      status: "published",
      publishedBlocks: [
        {
          id: "b1",
          type: "text",
          data: {
            heading: "Cache Invalidation Strategies",
            content: "Write-through, write-behind, and cache-aside patterns."
          }
        },
        {
          id: "b2",
          type: "code",
          data: {
            code: "const cache = new RedisClient(); await cache.set(key, val, 'EX', 3600);",
            language: "javascript"
          }
        }
      ]
    });

    const aiService = (await import("../src/services/ai/aiService.js")).aiService;
    const lesson = await aiService.generateLesson(topicId, { userMastery: 50, targetRole: "Backend Engineer" });

    assert.ok(lesson);
    assert.strictEqual(lesson.title, "Mastering Distributed Caching");
    assert.strictEqual(lesson.objective, "Admin notes covering Redis, Memcached, and eviction policies.");
    assert.strictEqual(lesson.sections.length, 2);
    assert.strictEqual(lesson.sections[0].heading, "Cache Invalidation Strategies");
    assert.ok(lesson.sections[0].content.includes("Write-through"));
  });
});
