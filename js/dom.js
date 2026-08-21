/**
 * dom.js
 * ---------------------------------------------------------------------------
 * Tiny DOM helper ($) plus the screen-navigation system. The app is a single
 * page with five mutually-exclusive "screens" (see index.html); showScreen()
 * is the only way any module should switch between them, so navigation stays
 * in one place.
 * ---------------------------------------------------------------------------
 */

/** @param {string} id @returns {HTMLElement} */
export const $ = (id) => document.getElementById(id);

/** Screen name -> section element. Keys match the ids in index.html. */
export const screens = {
  theme: $('screen-theme'),
  setup: $('screen-setup'),
  capture: $('screen-capture'),
  select: $('screen-select'),
  printing: $('screen-printing'),
};

/**
 * Show exactly one screen, hiding all others.
 * @param {keyof typeof screens} name
 */
export function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove('active'));
  screens[name].classList.add('active');
}
