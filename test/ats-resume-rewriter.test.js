// ===================================================
// PATH FORGE - ATS RESUME REWRITER TEST SUITE
// Automated verification for Feature 8: ATS Resume Bullet Point Rewriter
// ===================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { aiService } from "../src/services/ai/aiService.js";
import rewriteHandler from "../api/rewriteResumeBullet.js";

describe("Feature 8: ATS Resume Bullet Point Rewriter", () => {
  it("Endpoint returns 405 for non-POST requests", async () => {
    let statusCode = 0;
    let jsonResult = null;
    const req = { method: "GET" };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      }
    };

    await rewriteHandler(req, res);
    assert.equal(statusCode, 405);
    assert.deepEqual(jsonResult, { error: "Method not allowed" });
  });

  it("Endpoint returns 400 when bulletPoint is missing", async () => {
    let statusCode = 0;
    let jsonResult = null;
    const req = { method: "POST", body: {} };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      }
    };

    await rewriteHandler(req, res);
    assert.equal(statusCode, 400);
    assert.deepEqual(jsonResult, { error: "bulletPoint is required." });
  });

  it("aiService.rewriteResumeBullet transforms a weak bullet using Google XYZ formula", async () => {
    const rawBullet = "Worked on frontend components using React and fixed several layout bugs";
    const result = await aiService.rewriteResumeBullet({
      bulletPoint: rawBullet,
      targetRole: "Frontend Developer",
      targetCompany: "Google",
      jobDescription: "Requires React, TypeScript, Next.js, and CI/CD"
    });

    assert.ok(result, "Result should exist");
    assert.equal(result.original, rawBullet);
    assert.ok(typeof result.optimized === "string" && result.optimized.length > 20);
    assert.ok(Array.isArray(result.keywordsAdded) && result.keywordsAdded.length > 0);
    assert.ok(typeof result.scoreBefore === "number");
    assert.ok(typeof result.scoreAfter === "number");
    assert.ok(result.scoreAfter > result.scoreBefore, "Optimized score should be higher than initial score");
  });
});
