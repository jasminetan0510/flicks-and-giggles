/**
 * stripColor.js
 * ---------------------------------------------------------------------------
 * Basic solid background colors for the strip card — a simple first version
 * of a "frames" feature. Picked on the select screen, alongside stickers.
 * The chosen color is carried through to the printing screen's strip and
 * baked into the downloaded PNG (see printing.js).
 * ---------------------------------------------------------------------------
 */
import { $ } from './dom.js';
import { state } from './state.js';
import { STRIP_COLORS } from './data.js';

export function initStripColor() {
  buildSwatches();
  applyStripColor(); // reflect state.stripColor (persisted across restarts) right away
}

function buildSwatches() {
  const row = $('stripColorRow');
  row.innerHTML = '';
  STRIP_COLORS.forEach((color) => {
    const btn = document.createElement('button');
    btn.className = 'color-swatch' + (state.stripColor === color.hex ? ' selected' : '');
    btn.style.background = color.hex;
    btn.title = color.name;
    btn.setAttribute('aria-label', color.name);
    btn.addEventListener('click', () => {
      state.stripColor = color.hex;
      Array.from(row.children).forEach((c) => c.classList.remove('selected'));
      btn.classList.add('selected');
      applyStripColor();
    });
    row.appendChild(btn);
  });
}

/** Push state.stripColor onto the select screen's live strip preview. */
export function applyStripColor() {
  const preview = $('stripPreview');
  if (preview) preview.style.background = state.stripColor;
}
