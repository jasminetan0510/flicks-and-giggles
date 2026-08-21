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

  /** @type {number} seconds the countdown runs before each shot (3, 5, or 10) */
  countdownSeconds: 10,

  /** @type {string[]} captured photo dataURLs, up to 8 */
  photos: [],

  /** @type {number} index of the shot currently being taken (0-7) */
  shotIndex: 0,

  /** @type {number|null} setInterval handle for the active countdown */
  countdownTimer: null,

  /** @type {number[]} indices into `photos`, in the order picked for the strip (max 4) */
  selectedOrder: [],

  /** @type {string} email or phone entered in the contact modal */
  contactValue: '',

  /** @type {import('./data.js').InspoStrip|null} chosen pose-inspo strip, or null */
  selectedInspo: null,

  /** @type {string} hex color for the strip card background, e.g. '#ffffff' */
  stripColor: '#ffffff',

  /**
   * Stickers the user has dragged onto their finished strip.
   * xPct/yPct are the sticker's CENTER point, and sizePct is its width, all
   * as a percentage (0-100) of the strip card's full width/height — so the
   * same numbers work whether we're rendering the small on-screen strip
   * preview or the larger download canvas — see js/stickers.js and
   * js/printing.js.
   * @type {{ uid: string, src: string, xPct: number, yPct: number, sizePct: number }[]}
   */
  placedStickers: [],
};
