// ===================================================
// PATH FORGE - CALENDAR SERVICE
// Generates standard RFC 5545 .ics calendar files & Google Calendar links
// ===================================================

/**
 * Formats a Date object to iCalendar UTC timestamp: YYYYMMDDTHHMMSSZ
 * @param {Date} date
 * @returns {string}
 */
function formatToICSDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

export const calendarService = {
  /**
   * Generates a 1-click Google Calendar event URL for a single task.
   *
   * @param {object} task - Scheduled task item
   * @param {object} [goal] - Active career goal
   * @param {number} [studyHour=19] - Default hour of day (19 = 7:00 PM)
   * @returns {string} Google Calendar URL
   */
  getGoogleCalendarUrl(task, goal = {}, studyHour = 19) {
    if (!task) return "#";

    const baseDate = task.date ? new Date(task.date) : new Date();
    baseDate.setHours(studyHour, 0, 0, 0);

    const endDate = new Date(baseDate.getTime() + (task.durationMinutes || 45) * 60000);

    const startStr = formatToICSDate(baseDate);
    const endStr = formatToICSDate(endDate);

    const title = encodeURIComponent(`Path Forge: ${task.title || "Career Study Session"}`);
    const details = encodeURIComponent(
      `Topic: ${task.title}\nRole: ${goal?.targetPosition || "Career Preparation"}\nDuration: ${task.durationMinutes || 45} mins\nStatus: ${task.status || "Scheduled"}\n\nStart Session: https://pathforge-nine.vercel.app`
    );

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=Path+Forge`;
  },

  /**
   * Generates a complete .ics file string for all tasks in a schedule.
   *
   * @param {object[]} tasks - Array of scheduled items
   * @param {object} [goal] - User's target career goal
   * @param {number} [studyHour=19] - Hour to schedule each day (19 = 7 PM)
   * @returns {string} iCalendar formatted text
   */
  generateICSContent(tasks = [], goal = {}, studyHour = 19) {
    const nowStr = formatToICSDate(new Date());
    const role = goal?.targetPosition || "Adaptive Career Preparation";

    let ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Path Forge//Adaptive Career OS//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:Path Forge - ${role}`,
      "X-WR-TIMEZONE:UTC"
    ];

    tasks.forEach((task, idx) => {
      const taskDate = task.date ? new Date(task.date) : new Date(Date.now() + idx * 86400000);
      taskDate.setHours(studyHour, 0, 0, 0);

      const endDate = new Date(taskDate.getTime() + (task.durationMinutes || 45) * 60000);
      const uid = `pathforge_${task.topicId || idx}_${taskDate.getTime()}@pathforge.dev`;

      const title = `Path Forge: ${task.title || "Learning Session"}`.replace(/,/g, "\\,").replace(/;/g, "\\;");
      const desc = `Target Role: ${role}\\nTopic: ${task.title}\\nDuration: ${task.durationMinutes || 45} mins\\nAdapted: ${task.adapted ? "Yes" : "Standard"}\\nhttps://pathforge-nine.vercel.app`;

      ics.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${nowStr}`,
        `DTSTART:${formatToICSDate(taskDate)}`,
        `DTEND:${formatToICSDate(endDate)}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${desc}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    });

    ics.push("END:VCALENDAR");
    return ics.join("\r\n");
  },

  /**
   * Triggers client-side download of the .ics calendar file.
   *
   * @param {object[]} tasks
   * @param {object} [goal]
   */
  downloadICSFile(tasks = [], goal = {}) {
    const content = this.generateICSContent(tasks, goal);
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const roleSlug = (goal?.targetPosition || "study-plan").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.href = url;
    a.download = `pathforge-${roleSlug}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
