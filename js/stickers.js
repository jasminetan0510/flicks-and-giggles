/**
 * stickers.js
 * ---------------------------------------------------------------------------
 * Lets people decorate their finished 4-photo strip. A tray of sticker
 * thumbnails sits next to the strip preview on the select screen; clicking
 * one drops a copy onto the strip at a slightly randomized spot. Each placed
 * sticker can then be:
 *   - dragged anywhere on the strip (pointer events, so it works with
 *     mouse, touch, and pen alike) by dragging its body,
 *   - resized by dragging the small handle at its bottom-right corner,
 *   - removed with its × badge.
 *
 * Placement AND size are stored as percentages of the strip card's full
 * width/height (state.placedStickers[].xPct/yPct/sizePct), not pixels — see
 * the note in state.js. That's what lets the exact same values be
 * re-rendered onto the printing screen's strip and the downloaded PNG,
 * which are both much bigger than the on-screen preview.
 * ---------------------------------------------------------------------------
 */
import { $ } from './dom.js';
import { state } from './state.js';
import { STICKERS } from './data.js';

const DEFAULT_STICKER_WIDTH_PCT = 26;
const MIN_STICKER_WIDTH_PCT = 8;
const MAX_STICKER_WIDTH_PCT = 55;

export function initStickers() {
  buildTray();
  $('stickerResetBtn').addEventListener('click', () => {
    state.placedStickers = [];
    renderPlacedStickers();
  });
}

function buildTray() {
  const tray = $('stickerTray');
  tray.innerHTML = '';
  STICKERS.forEach((sticker) => {
    const btn = document.createElement('button');
    btn.className = 'sticker-tray-item';
    btn.title = `Add ${sticker.name}`;
    btn.innerHTML = `<img src="${sticker.src}" alt="${sticker.name}">`;
    btn.addEventListener('click', () => addSticker(sticker));
    tray.appendChild(btn);
  });
}

/** @param {import('./data.js').Sticker} sticker */
function addSticker(sticker) {
  state.placedStickers.push({
    uid: makeId(),
    src: sticker.src,
    xPct: 35 + Math.random() * 30, // land somewhere near the middle, not stacked exactly center
    yPct: 25 + Math.random() * 50,
    sizePct: DEFAULT_STICKER_WIDTH_PCT,
  });
  renderPlacedStickers();
}

function makeId() {
  return (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Re-render every placed sticker onto the interactive layer inside the
 * select screen's strip preview. Also called (with an empty list) whenever
 * a fresh 8-shot session starts, to clear leftover stickers from a prior
 * strip — see selectScreen.js.
 */
export function renderPlacedStickers() {
  const layer = $('stickerLayer');
  if (!layer) return;
  layer.innerHTML = '';

  state.placedStickers.forEach((placed) => {
    const el = document.createElement('div');
    el.className = 'placed-sticker';
    el.style.left = placed.xPct + '%';
    el.style.top = placed.yPct + '%';
    el.style.width = placed.sizePct + '%';
    el.innerHTML = `
      <img src="${placed.src}" alt="" draggable="false">
      <button class="sticker-delete" aria-label="Remove sticker">×</button>
      <button class="sticker-resize" aria-label="Resize sticker"></button>
    `;

    wireDrag(el, placed, layer);
    wireResize(el, placed, layer);

    el.querySelector('.sticker-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      state.placedStickers = state.placedStickers.filter((s) => s.uid !== placed.uid);
      renderPlacedStickers();
    });

    layer.appendChild(el);
  });
}

/**
 * Pointer-based drag: works for mouse, touch, and pen with one code path.
 * @param {HTMLElement} el
 * @param {{xPct:number,yPct:number}} placed mutated in place as the user drags
 * @param {HTMLElement} layer the bounding container coordinates are relative to
 */
function wireDrag(el, placed, layer) {
  el.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.sticker-delete') || e.target.closest('.sticker-resize')) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    el.classList.add('dragging');

    const onMove = (ev) => {
      const rect = layer.getBoundingClientRect();
      const xPct = clamp(((ev.clientX - rect.left) / rect.width) * 100, 0, 100);
      const yPct = clamp(((ev.clientY - rect.top) / rect.height) * 100, 0, 100);
      placed.xPct = xPct;
      placed.yPct = yPct;
      el.style.left = xPct + '%';
      el.style.top = yPct + '%';
    };
    const onUp = () => {
      el.classList.remove('dragging');
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
  });
}

/**
 * Drag the bottom-right handle to resize. The sticker is centered on
 * (xPct, yPct) via CSS transform:translate(-50%,-50%), so its right edge
 * sits `width/2` to the right of center — dragging the handle just measures
 * the live horizontal distance from center to pointer and doubles it to get
 * the new full width.
 * @param {HTMLElement} el
 * @param {{sizePct:number}} placed mutated in place as the user resizes
 * @param {HTMLElement} layer
 */
function wireResize(el, placed, layer) {
  const handle = el.querySelector('.sticker-resize');
  handle.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handle.setPointerCapture(e.pointerId);
    el.classList.add('dragging');

    const onMove = (ev) => {
      const rect = layer.getBoundingClientRect();
      const centerX = rect.left + (placed.xPct / 100) * rect.width;
      const halfWidthPx = Math.max(4, ev.clientX - centerX);
      const widthPct = clamp((halfWidthPx * 2 * 100) / rect.width, MIN_STICKER_WIDTH_PCT, MAX_STICKER_WIDTH_PCT);
      placed.sizePct = widthPct;
      el.style.width = widthPct + '%';
    };
    const onUp = () => {
      el.classList.remove('dragging');
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
    };

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
  });
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
