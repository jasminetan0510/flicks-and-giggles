/**
 * sound.js
 * ---------------------------------------------------------------------------
 * A short synthesized beep for the last 3 seconds of the countdown. Uses the
 * Web Audio API directly rather than an audio file — one oscillator, one
 * gain envelope, no assets to ship or load.
 *
 * Browsers require a user gesture before audio can play, so `unlockAudio()`
 * must be called from inside a click handler (see camera.js, on the shutter
 * button) before the first `playBeep()` call — creating/resuming the
 * AudioContext there satisfies that requirement.
 * ---------------------------------------------------------------------------
 */

/** @type {AudioContext|null} */
let ctx = null;

/** Call from within a user-gesture event handler (e.g. a click) before any playBeep(). */
export function unlockAudio() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return; // unsupported browser — beeps silently no-op
    ctx = new AudioCtx();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
}

/**
 * Play a short beep.
 * @param {number} freq frequency in Hz
 * @param {number} durationMs how long the tone rings for
 */
export function playBeep(freq = 700, durationMs = 120) {
  if (!ctx) return; // unlockAudio() was never called, or unsupported browser

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;

  const now = ctx.currentTime;
  const end = now + durationMs / 1000;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.32, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(end + 0.02);
}
