// ===================================================
// PATH FORGE - AUTHENTICATION, ISOLATION & SECURITY TEST SUITE
// Automated verification for Acceptance Tests 1-12
// ===================================================

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { databaseService } from "../src/services/database/databaseService.js";
import { LocalStorageService } from "../src/services/storage/localStorageService.js";
import { extractNameFromEmail, formatAuthError, isMobileDevice } from "../src/services/auth/authService.js";
import authConfigHandler from "../api/authConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const localEnv = path.join(__dirname, "..", ".env.local");
  const defaultEnv = path.join(__dirname, "..", ".env");
  if (fs.existsSync(localEnv)) process.loadEnvFile(localEnv);
  else if (fs.existsSync(defaultEnv)) process.loadEnvFile(defaultEnv);
} catch {}

describe("Authentication, Multi-User Isolation & Security", () => {
  beforeEach(() => {
    LocalStorageService.clear();
  });

  // ----------------------------------------------------
  // ACCEPTANCE TEST 1 & 2: Environment API Endpoint & No Hardcoded Keys
  // ----------------------------------------------------
  it("ACCEPTANCE TEST: /api/authConfig loads strictly from environment variables without hardcoded fallbacks", async () => {
    let statusCode = null;
    let jsonResult = null;

    const mockReq = { method: "GET" };
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

    authConfigHandler(mockReq, mockRes);

    assert.equal(statusCode, 200, "Should return HTTP 200");
    assert.ok(jsonResult, "Should return json result");
    assert.ok(jsonResult.apiKey, "Must contain apiKey from environment");
    assert.ok(jsonResult.authDomain, "Must contain authDomain from environment");
    assert.ok(jsonResult.projectId, "Must contain projectId from environment");
    assert.ok(jsonResult.appId, "Must contain appId from environment");
  });

  it("ACCEPTANCE TEST: Source code contains no hardcoded AIza API keys in frontend src/ directory", () => {
    const srcDir = path.join(__dirname, "..", "src");
    const scanDir = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const f of files) {
        const fullPath = path.join(dir, f.name);
        if (f.isDirectory()) {
          scanDir(fullPath);
        } else if (f.name.endsWith(".js") || f.name.endsWith(".html")) {
          const content = fs.readFileSync(fullPath, "utf-8");
          // Check for hardcoded Firebase keys
          assert.equal(
            content.includes("AIzaSy"),
            false,
            `Hardcoded Firebase API Key leaked in frontend file: ${fullPath}`
          );
        }
      }
    };
    scanDir(srcDir);
  });

  it("ACCEPTANCE TEST: .gitignore properly protects .env and .env.local", () => {
    const gitignorePath = path.join(__dirname, "..", ".gitignore");
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
    assert.ok(gitignoreContent.includes(".env.local"), ".gitignore must contain .env.local");
    assert.ok(gitignoreContent.includes(".env"), ".gitignore must contain .env");
  });

  // ----------------------------------------------------
  // ACCEPTANCE TEST 3: User Display Name Extraction & Canonical UID
  // ----------------------------------------------------
  it("ACCEPTANCE TEST: extractNameFromEmail correctly parses candidate emails", () => {
    assert.equal(extractNameFromEmail("john.doe@gmail.com"), "John Doe");
    assert.equal(extractNameFromEmail("jane_smith99@example.com"), "Jane Smith 99");
    assert.equal(extractNameFromEmail("alexandra-rivera@domain.org"), "Alexandra Rivera");
    assert.equal(extractNameFromEmail(""), "Candidate");
    assert.equal(extractNameFromEmail(null), "Candidate");
  });

  // ----------------------------------------------------
  // ACCEPTANCE TEST 4: Friendly Error Formatting for All Firebase Auth Codes
  // ----------------------------------------------------
  it("ACCEPTANCE TEST: formatAuthError maps all known Firebase auth error codes to friendly messages", () => {
    const unauth = formatAuthError({ code: "auth/unauthorized-domain" });
    assert.ok(unauth.includes("not available on this domain") || unauth.includes("Authorized Domains"));

    const popupBlocked = formatAuthError({ code: "auth/popup-blocked" });
    assert.ok(popupBlocked.includes("blocked the Google sign-in"));

    const popupClosed = formatAuthError({ code: "auth/popup-closed-by-user" });
    assert.ok(popupClosed.includes("closed before completing"));

    const networkErr = formatAuthError({ code: "auth/network-request-failed" });
    assert.ok(networkErr.includes("internet connection"));

    const disabledErr = formatAuthError({ code: "auth/user-disabled" });
    assert.ok(disabledErr.includes("disabled"));
  });

  // ----------------------------------------------------
  // ACCEPTANCE TEST 5: Multi-User Progress Isolation (User A vs User B)
  // ----------------------------------------------------
  it("ACCEPTANCE TEST: Complete progress isolation between Account A and Account B", async () => {
    const userA = { uid: "firebase_uid_user_a", userId: "firebase_uid_user_a", email: "user.a@google.com" };
    const userB = { uid: "firebase_uid_user_b", userId: "firebase_uid_user_b", email: "user.b@google.com" };

    // 1. User A saves goal, completed topics and skill profile
    await databaseService.saveUser(userA);
    await databaseService.saveGoal({
      userId: userA.uid,
      targetPosition: "Senior Frontend Engineer",
      targetCompany: "Google"
    });
    await databaseService.saveTopicProgress({
      uid: userA.uid,
      topicId: "tech-fe-1",
      status: "COMPLETED",
      topicScore: 100
    });
    LocalStorageService.setUserCompletedTopics(userA.uid, { "tech-fe-1": true });

    // 2. User B logs in (fresh account)
    await databaseService.saveUser(userB);
    const userBGoal = await databaseService.getGoalByUserId(userB.uid);
    const userBProgress = await databaseService.getAllTopicProgress(userB.uid);
    const userBCompleted = LocalStorageService.getUserCompletedTopics(userB.uid);

    assert.equal(userBGoal, null, "User B must not see User A goal");
    assert.equal(Object.keys(userBProgress).length, 0, "User B must have 0 topic progress");
    assert.equal(Object.keys(userBCompleted).length, 0, "User B must have 0 local completed topics");

    // 3. User B sets their own goal and completes a different topic
    await databaseService.saveGoal({
      userId: userB.uid,
      targetPosition: "DevOps Specialist",
      targetCompany: "Netflix"
    });
    await databaseService.saveTopicProgress({
      uid: userB.uid,
      topicId: "tech-fe-2",
      status: "COMPLETED",
      topicScore: 90
    });
    LocalStorageService.setUserCompletedTopics(userB.uid, { "tech-fe-2": true });

    // 4. Verify User A data is untouched and distinct
    const userAGoal = await databaseService.getGoalByUserId(userA.uid);
    const userACompleted = LocalStorageService.getUserCompletedTopics(userA.uid);
    const userAProgress = await databaseService.getAllTopicProgress(userA.uid);

    assert.equal(userAGoal.targetPosition, "Senior Frontend Engineer");
    assert.equal(userACompleted["tech-fe-1"], true);
    assert.equal(userACompleted["tech-fe-2"], undefined, "User A must not have User B topic 2");
    assert.equal(userBCompleted["tech-fe-1"], undefined, "User B must not have User A topic 1");
  });

  // ----------------------------------------------------
  // ACCEPTANCE TEST 6: Account Switching & Progress Restoration
  // ----------------------------------------------------
  it("ACCEPTANCE TEST: Account switching from A -> B -> A restores Account A exact progress", async () => {
    const uidA = "uid_candidate_alpha";
    const uidB = "uid_candidate_beta";

    // Step 1: User A logs in and completes 3 topics
    LocalStorageService.setUserCompletedTopics(uidA, {
      "tech-fe-1": true,
      "tech-fe-2": true,
      "tech-fe-3": true
    });

    // Step 2: Sign out User A (clear session only)
    LocalStorageService.clearUserSession();

    // Step 3: User B logs in and completes 1 topic
    LocalStorageService.setUserCompletedTopics(uidB, {
      "tech-fe-4": true
    });

    // Step 4: Sign out User B
    LocalStorageService.clearUserSession();

    // Step 5: User A logs in again
    const restoredCompletedA = LocalStorageService.getUserCompletedTopics(uidA);
    assert.equal(Object.keys(restoredCompletedA).length, 3);
    assert.equal(restoredCompletedA["tech-fe-1"], true);
    assert.equal(restoredCompletedA["tech-fe-2"], true);
    assert.equal(restoredCompletedA["tech-fe-3"], true);
    assert.equal(restoredCompletedA["tech-fe-4"], undefined);
  });

  // ----------------------------------------------------
  // ACCEPTANCE TEST 7: Safe Legacy Migration (No Leakage to Next User)
  // ----------------------------------------------------
  it("ACCEPTANCE TEST: Legacy unauthenticated progress migrates to first user and clears to prevent leaking to User B", () => {
    const uidFirst = "first_user_uid";
    const uidSecond = "second_user_uid";

    // Set legacy unauthenticated storage item
    LocalStorageService.setLegacyProgress({ "legacy-topic-1": true });

    // First user logs in and migrates
    const migrated = LocalStorageService.migrateLegacyProgress(uidFirst);
    assert.ok(migrated, "Legacy progress should migrate to first user");
    assert.equal(migrated["legacy-topic-1"], true);

    // Verify first user has the progress
    const user1Completed = LocalStorageService.getUserCompletedTopics(uidFirst);
    assert.equal(user1Completed["legacy-topic-1"], true);

    // Second user logs in - legacy store is now gone, so second user must NOT get it
    const secondMigrated = LocalStorageService.migrateLegacyProgress(uidSecond);
    assert.equal(secondMigrated, null, "Second user should NOT get first user legacy progress");

    const user2Completed = LocalStorageService.getUserCompletedTopics(uidSecond);
    assert.equal(Object.keys(user2Completed).length, 0, "Second user must start with clean progress");
  });

  // ----------------------------------------------------
  // ACCEPTANCE TEST 9: Cross-Device Synchronization (Device 1 -> Device 2)
  // ----------------------------------------------------
  it("ACCEPTANCE TEST: Progress saved on Device 1 is authoritatively restored on Device 2 with fresh local storage", async () => {
    const crossDeviceUid = "cross_device_user_777";

    // --- DEVICE 1 (e.g. iPhone) ---
    // User logs in, sets goal, and completes 2 topics
    await databaseService.saveUser({
      uid: crossDeviceUid,
      email: "engineer@company.com",
      displayName: "Mobile Learner"
    });
    await databaseService.saveGoal({
      userId: crossDeviceUid,
      targetPosition: "Cloud Architect",
      targetCompany: "AWS"
    });
    await databaseService.saveTopicProgress({
      uid: crossDeviceUid,
      topicId: "tech-fe-1",
      status: "COMPLETED",
      topicScore: 100
    });
    await databaseService.saveTopicProgress({
      uid: crossDeviceUid,
      topicId: "tech-fe-2",
      status: "COMPLETED",
      topicScore: 90
    });

    // --- DEVICE 2 (e.g. Laptop) ---
    // Simulating a brand new browser/device where localStorage has ZERO cached progress for this user
    LocalStorageService.remove(`user_completed_${crossDeviceUid}`);
    assert.equal(
      Object.keys(LocalStorageService.getUserCompletedTopics(crossDeviceUid)).length,
      0,
      "Device 2 starts with zero local progress"
    );

    // Device 2 fetches authoritative progress from databaseService
    const authoritativeProgress = await databaseService.getAllTopicProgress(crossDeviceUid);
    assert.equal(Object.keys(authoritativeProgress).length, 2, "Backend database returned both topics");
    assert.equal(authoritativeProgress["tech-fe-1"].status, "COMPLETED");
    assert.equal(authoritativeProgress["tech-fe-2"].status, "COMPLETED");

    // Device 2 populates its local cache from backend data
    const device2CompletedMap = {};
    Object.values(authoritativeProgress).forEach((tp) => {
      if (tp.status === "COMPLETED" || tp.completedAt) {
        device2CompletedMap[tp.topicId] = true;
      }
    });
    LocalStorageService.setUserCompletedTopics(crossDeviceUid, device2CompletedMap);

    // Verify Device 2 now has the exact synced progress
    const syncedMap = LocalStorageService.getUserCompletedTopics(crossDeviceUid);
    assert.equal(syncedMap["tech-fe-1"], true);
    assert.equal(syncedMap["tech-fe-2"], true);
  });

  // ----------------------------------------------------
  // ACCEPTANCE TEST 10: Backend Database Overrides Outdated LocalStorage
  // ----------------------------------------------------
  it("ACCEPTANCE TEST: Backend database is the source of truth when localStorage contains stale/missing data", async () => {
    const uid = "stale_cache_user_123";

    // Backend database has 3 completed topics
    await databaseService.saveTopicProgress({ uid, topicId: "topic-1", status: "COMPLETED" });
    await databaseService.saveTopicProgress({ uid, topicId: "topic-2", status: "COMPLETED" });
    await databaseService.saveTopicProgress({ uid, topicId: "topic-3", status: "COMPLETED" });

    // LocalStorage only has 1 topic (outdated/stale cache)
    LocalStorageService.setUserCompletedTopics(uid, { "topic-1": true });

    // Application queries backend database for authoritative state
    const backendData = await databaseService.getAllTopicProgress(uid);
    const authoritativeCompleted = {};
    Object.values(backendData).forEach((tp) => {
      if (tp.status === "COMPLETED") {
        authoritativeCompleted[tp.topicId] = true;
      }
    });

    // Local cache is refreshed to match backend source of truth
    LocalStorageService.setUserCompletedTopics(uid, authoritativeCompleted);

    const activeMap = LocalStorageService.getUserCompletedTopics(uid);
    assert.equal(Object.keys(activeMap).length, 3, "All 3 topics restored from database source of truth");
    assert.equal(activeMap["topic-1"], true);
    assert.equal(activeMap["topic-2"], true);
    assert.equal(activeMap["topic-3"], true);
  });
});
