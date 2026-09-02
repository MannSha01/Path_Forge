// ===================================================
// PATH FORGE - DOM UTILITIES
// Reusable helper methods for DOM access and manipulation
// ===================================================

/**
 * Select a single DOM element.
 * @param {string} selector
 * @param {ParentNode} [parent=document]
 * @returns {HTMLElement | null}
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Select multiple DOM elements as an array.
 * @param {string} selector
 * @param {ParentNode} [parent=document]
 * @returns {HTMLElement[]}
 */
export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Safe event listener attachment.
 * @param {EventTarget | null} element
 * @param {string} event
 * @param {EventListenerOrEventListenerObject} handler
 */
export function on(element, event, handler) {
  if (element && typeof element.addEventListener === "function") {
    element.addEventListener(event, handler);
  }
}

/**
 * Reveal an element by removing the Tailwind 'hidden' class.
 * @param {HTMLElement | null} element
 */
export function show(element) {
  if (element) {
    element.classList.remove("hidden");
  }
}

/**
 * Hide an element by adding the Tailwind 'hidden' class.
 * @param {HTMLElement | null} element
 */
export function hide(element) {
  if (element) {
    element.classList.add("hidden");
  }
}

/**
 * Re-render Lucide icons safely across the DOM.
 */
export function refreshLucide() {
  if (typeof window !== "undefined" && window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}
