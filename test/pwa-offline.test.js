// ===================================================
// PATH FORGE - PWA & OFFLINE TEST SUITE
// Automated verification for Feature 10: Progressive Web App
// ===================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

describe("Feature 10: Progressive Web App & Offline Capabilities", () => {
  it("manifest.json exists and satisfies PWA requirements", () => {
    const manifestPath = path.join(rootDir, "manifest.json");
    assert.ok(fs.existsSync(manifestPath), "manifest.json must exist in project root");

    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);

    assert.ok(manifest.name, "Manifest must have a full name");
    assert.ok(manifest.short_name, "Manifest must have a short_name");
    assert.equal(manifest.display, "standalone", "Display mode must be standalone");
    assert.ok(manifest.start_url, "Manifest must define start_url");
    assert.ok(manifest.theme_color, "Manifest must define theme_color");
    assert.ok(manifest.background_color, "Manifest must define background_color");
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, "Manifest must include icons");
  });

  it("sw.js exists and contains cache configuration", () => {
    const swPath = path.join(rootDir, "sw.js");
    assert.ok(fs.existsSync(swPath), "sw.js must exist in project root");

    const swContent = fs.readFileSync(swPath, "utf-8");
    assert.ok(swContent.includes("CACHE_NAME"), "Service Worker must define CACHE_NAME");
    assert.ok(swContent.includes("addEventListener(\"install\""), "Service Worker must handle install event");
    assert.ok(swContent.includes("addEventListener(\"fetch\""), "Service Worker must handle fetch event");
    assert.ok(swContent.includes("addEventListener(\"activate\""), "Service Worker must handle activate event");
  });

  it("index.html references manifest and PWA install elements", () => {
    const indexPath = path.join(rootDir, "index.html");
    const indexContent = fs.readFileSync(indexPath, "utf-8");

    assert.ok(indexContent.includes('rel="manifest"'), "index.html must reference manifest.json");
    assert.ok(indexContent.includes('name="theme-color"'), "index.html must define theme-color meta tag");
    assert.ok(indexContent.includes('id="pwa-install-btn"'), "index.html must include PWA install button");
  });

  it("icons/icon.svg exists and is valid SVG", () => {
    const iconPath = path.join(rootDir, "icons", "icon.svg");
    assert.ok(fs.existsSync(iconPath), "icons/icon.svg must exist");

    const iconContent = fs.readFileSync(iconPath, "utf-8");
    assert.ok(iconContent.includes("<svg"), "Must be valid SVG file");
  });
});
