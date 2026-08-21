/**
 * selectScreen.js
 * ---------------------------------------------------------------------------
 * The "pick 4 of 8" screen. Tap order determines strip order (first tap ->
 * slot 1, etc). Tapping an already-picked photo removes it and re-numbers
 * the rest. The strip preview on the right re-renders on every change.
 * ---------------------------------------------------------------------------
 */
import { $ } from './dom.js';
import { state } from './state.js';
import { dateStamp } from './utils.js';
import { renderPlacedStickers } from './stickers.js';

const grid = $('grid');
const doneBtn = $('doneBtn');
const toast = $('toast');

export function initSelectScreen() {
  $('resetSelBtn').addEventListener('click', () => {
    state.selectedOrder = [];
    state.placedStickers = []; // stickers were positioned relative to the old picks
    refreshGridBadges();
    updateStripPreview();
    renderPlacedStickers();
    updateDoneState();
  });

  doneBtn.addEventListener('click', () => {
    $('contactModal').classList.remove('hidden');
    $('contactInput').focus();
  });
}

/** Rebuild the 8-photo grid from state.photos. Called once, after capture finishes. */
export function buildSelectGrid() {
  grid.innerHTML = '';
  state.selectedOrder = [];
  state.placedStickers = []; // fresh session, fresh strip — clear any leftover stickers
  renderPlacedStickers();
  state.photos.forEach((src, i) => {
    const item = document.createElement('button');
    item.className = 'grid-item';
    item.setAttribute('aria-label', `Photo ${i + 1}`);
    item.innerHTML = `<img src="${src}"><span class="badge"></span>`;
    item.addEventListener('click', () => togglePick(i, item));
    grid.appendChild(item);
  });
  updateStripPreview();
  updateDoneState();
}

function togglePick(i) {
  const pos = state.selectedOrder.indexOf(i);
  if (pos > -1) {
    state.selectedOrder.splice(pos, 1);
  } else {
    if (state.selectedOrder.length >= 4) {
      showToast('You have 4 already — tap one to remove it first');
      return;
    }
    state.selectedOrder.push(i);
  }
  refreshGridBadges();
  updateStripPreview();
  updateDoneState();
}

function refreshGridBadges() {
  Array.from(grid.children).forEach((item, i) => {
    const pos = state.selectedOrder.indexOf(i);
    const badge = item.querySelector('.badge');
    if (pos > -1) {
      item.classList.add('picked');
      badge.textContent = pos + 1;
    } else {
      item.classList.remove('picked');
      badge.textContent = '';
    }
  });
}

function updateStripPreview() {
  const slots = $('stripPreview').querySelectorAll('.strip-slot');
  slots.forEach((slot, i) => {
    if (state.selectedOrder[i] !== undefined) {
      slot.innerHTML = `<img src="${state.photos[state.selectedOrder[i]]}">`;
    } else {
      slot.innerHTML = String(i + 1);
    }
  });
  $('stripDate').textContent = dateStamp();
}

function updateDoneState() {
  doneBtn.disabled = state.selectedOrder.length !== 4;
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1600);
}
