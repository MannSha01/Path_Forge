// ===================================================
// PATH FORGE - SRS & CALENDAR TEST SUITE
// Automated verification for Feature 1 (Spaced Repetition) & Feature 2 (Calendar Sync)
// ===================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { srsEngine } from "../src/services/learning/srsEngine.js";
import { calendarService } from "../src/services/calendar/calendarService.js";

describe("Feature 1: Spaced Repetition (SM-2 Algorithm)", () => {
  it("SM-2: Quality < 3 resets repetitions and sets 1-day interval", () => {
    const card = { repetitions: 4, intervalDays: 14, easeFactor: 2.5 };
    const updated = srsEngine.calculateSM2(card, 1);

    assert.equal(updated.repetitions, 0, "Repetitions must reset on blackout");
    assert.equal(updated.intervalDays, 1, "Interval must reset to 1 day on blackout");
    assert.ok(updated.easeFactor < 2.5, "Ease factor should drop on failure");
    assert.ok(updated.easeFactor >= 1.3, "Ease factor must not drop below 1.3");
  });

  it("SM-2: Quality >= 3 successfully increments repetitions and expands interval", () => {
    // First review
    const card0 = { repetitions: 0, intervalDays: 1, easeFactor: 2.5 };
    const step1 = srsEngine.calculateSM2(card0, 4);
    assert.equal(step1.repetitions, 1);
    assert.equal(step1.intervalDays, 1);

    // Second review
    const step2 = srsEngine.calculateSM2(step1, 4);
    assert.equal(step2.repetitions, 2);
    assert.ok(step2.intervalDays >= 4);

    // Third review
    const step3 = srsEngine.calculateSM2(step2, 5);
    assert.equal(step3.repetitions, 3);
    assert.ok(step3.intervalDays > step2.intervalDays);
  });

  it("srsEngine returns baseline cards for new candidates", () => {
    const cards = srsEngine.getCards("test_user_srs");
    assert.ok(Array.isArray(cards));
    assert.ok(cards.length >= 4, "Must load baseline cards");
    assert.ok(cards[0].front && cards[0].back);
  });
});

describe("Feature 2: Calendar Integration (.ics & Google Calendar)", () => {
  const mockTasks = [
    { title: "React Architecture", date: "2026-10-01", durationMinutes: 45, status: "current" },
    { title: "Node.js Streams", date: "2026-10-02", durationMinutes: 30, status: "scheduled" }
  ];
  const mockGoal = { targetPosition: "Frontend Engineer" };

  it("Generates valid RFC 5545 iCalendar content", () => {
    const ics = calendarService.generateICSContent(mockTasks, mockGoal);

    assert.ok(ics.includes("BEGIN:VCALENDAR"), "Must start with BEGIN:VCALENDAR");
    assert.ok(ics.includes("VERSION:2.0"), "Must specify VERSION:2.0");
    assert.ok(ics.includes("BEGIN:VEVENT"), "Must contain at least one VEVENT");
    assert.ok(ics.includes("SUMMARY:Path Forge: React Architecture"), "Must format task titles");
    assert.ok(ics.includes("END:VCALENDAR"), "Must close with END:VCALENDAR");
  });

  it("Generates a valid 1-click Google Calendar URL", () => {
    const url = calendarService.getGoogleCalendarUrl(mockTasks[0], mockGoal);

    assert.ok(url.startsWith("https://calendar.google.com/calendar/render?action=TEMPLATE"));
    assert.ok(url.includes("Path%20Forge%3A%20React%20Architecture"));
    assert.ok(url.includes("dates="));
  });
});
