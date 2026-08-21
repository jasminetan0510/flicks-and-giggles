/**
 * state.js
 * ---------------------------------------------------------------------------
 * A single mutable state object shared by every module. Modules import the
 * same `state` reference and mutate its properties directly — there's no
 * framework here, just plain objects, so keeping all mutable app state in
 * one place makes it easy to see what "the current session" actually is.
 * ---------------------------------------------------------------------------
 */
export const state = {
  /** @type {MediaStream|null} active camera stream */
  stream: null,

  /** @type {number} seconds the countdown runs before each shot */
  countdownSeconds: 10,

  /** @type {string[]} captured photo dataURLs (frame already composited in), up to 8 */
  photos: [],

  /** @type {number} index of the shot currently being taken (0-7) */
  shotIndex: 0,

  /** @type {number|null} setInterval handle for the active countdown */
  countdownTimer: null,

  /** @type {number[]} indices into `photos`, in the order picked for the strip (max 4) */
  selectedOrder: [],

  /** @type {string} email or phone entered in the contact modal */
  contactValue: '',

  /** @type {import('./data.js').Theme|null} chosen frame, or null for "no frame" */
  selectedTheme: null,

  /** @type {import('./data.js').InspoStrip|null} chosen pose-inspo strip, or null */
  selectedInspo: null,
};
