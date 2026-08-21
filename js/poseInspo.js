/**
 * poseInspo.js
 * ---------------------------------------------------------------------------
 * Optional "pose inspo" feature: pick a reference photostrip to shoot
 * alongside. When one is selected, a panel appears next to the camera on
 * both the setup and capture screens, with a highlighted band that steps
 * through the 4 poses as the 8-shot session progresses (every single shot —
 * see `currentPoseIndex` in camera.js).
 * ---------------------------------------------------------------------------
 */
import { $ } from './dom.js';
import { state } from './state.js';
import { INSPO_STRIPS } from './data.js';

const inspoBtn = $('inspoBtn');
const inspoBtnLabel = $('inspoBtnLabel');
const inspoModal = $('inspoModal');
const inspoGrid = $('inspoGrid');
const inspoEmptyNote = $('inspoEmptyNote');

export function initPoseInspo() {
  inspoBtn.addEventListener('click', () => {
    buildInspoGrid();
    inspoModal.classList.remove('hidden');
  });
  $('inspoModalCloseBtn').addEventListener('click', () => inspoModal.classList.add('hidden'));
  $('inspoDoneBtn').addEventListener('click', () => inspoModal.classList.add('hidden'));

  // Reflects any selection carried over from a previous session (e.g. after
  // "Start over") onto the live panels right away, without waiting for the
  // user to reopen the modal.
  updateInspoButtonLabel();
  applyInspoToPanels();
}

function buildInspoGrid() {
  inspoGrid.innerHTML = '';
  if (INSPO_STRIPS.length === 0) {
    inspoEmptyNote.classList.remove('hidden');
    return;
  }
  inspoEmptyNote.classList.add('hidden');

  const noneTile = document.createElement('button');
  noneTile.className = 'inspo-tile' + (state.selectedInspo === null ? ' selected' : '');
  noneTile.innerHTML = `<div style="width:100%;aspect-ratio:1/1;border-radius:8px;background:var(--surface);border:1px dashed var(--blue-pale-2);display:flex;align-items:center;justify-content:center;color:var(--blue-pale-2);">—</div><div class="inspo-label">None</div>`;
  noneTile.addEventListener('click', () => selectInspo(null, noneTile));
  inspoGrid.appendChild(noneTile);

  INSPO_STRIPS.forEach((strip) => {
    const tile = document.createElement('button');
    tile.className = 'inspo-tile' + (state.selectedInspo && state.selectedInspo.id === strip.id ? ' selected' : '');
    tile.innerHTML = `<img src="${strip.src}" alt="${strip.name}"><div class="inspo-label">${strip.name}</div>`;
    tile.addEventListener('click', () => selectInspo(strip, tile));
    inspoGrid.appendChild(tile);
  });
}

/**
 * @param {import('./data.js').InspoStrip|null} strip
 * @param {HTMLElement} tileEl
 */
function selectInspo(strip, tileEl) {
  state.selectedInspo = strip;
  Array.from(inspoGrid.children).forEach((c) => c.classList.remove('selected'));
  tileEl.classList.add('selected');
  updateInspoButtonLabel();
  applyInspoToPanels(); // live update — no separate "continue" step anymore
}

function updateInspoButtonLabel() {
  inspoBtnLabel.textContent = state.selectedInspo
    ? `Pose inspo: ${state.selectedInspo.name}`
    : '+ Add pose inspo (optional)';
}

/**
 * Push the currently selected inspo strip onto both live panels (setup +
 * capture screens), or hide them if none is selected.
 */
function applyInspoToPanels() {
  const setupPanel = $('inspoPanelSetup');
  const capturePanel = $('inspoPanelCapture');
  if (state.selectedInspo) {
    $('inspoImgSetup').src = state.selectedInspo.src;
    $('inspoImgCapture').src = state.selectedInspo.src;
    setupPanel.classList.remove('hidden');
    capturePanel.classList.remove('hidden');
    updateInspoHighlight($('inspoHighlightSetup'), 0);
    updateInspoHighlight($('inspoHighlightCapture'), 0);
  } else {
    setupPanel.classList.add('hidden');
    capturePanel.classList.add('hidden');
  }
}

/**
 * Move a highlight band to the given pose (0-3), expressed as a 25%-height
 * band. Requires the source strip to be 4 equal-height poses stacked
 * edge-to-edge — see docs/ADDING_ASSETS.md.
 * @param {HTMLElement} highlightEl
 * @param {number} poseIndex 0-3
 */
export function updateInspoHighlight(highlightEl, poseIndex) {
  highlightEl.style.top = poseIndex * 25 + '%';
}
