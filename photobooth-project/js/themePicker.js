/**
 * themePicker.js
 * ---------------------------------------------------------------------------
 * The theme (character frame) picker screen. Renders each theme as a mini
 * 4-slot photostrip preview so people can see roughly what their final strip
 * will look like before shooting. Selection is required (Continue stays
 * disabled) — "No frame" is itself a valid, explicit choice.
 * ---------------------------------------------------------------------------
 */
import { $ } from './dom.js';
import { state } from './state.js';
import { THEMES } from './data.js';

const themeGrid = $('themeGrid');
const themeContinueBtn = $('themeContinueBtn');
const frameOverlaySetup = $('frameOverlaySetup');
const frameOverlayCapture = $('frameOverlayCapture');

export function initThemePicker() {
  buildThemeGrid();
}

function buildThemeGrid() {
  themeGrid.innerHTML = '';

  const noneTile = document.createElement('button');
  noneTile.className = 'theme-tile';
  noneTile.innerHTML = `
    <div class="mini-strip">
      <div class="mini-slot empty">—</div>
      <div class="mini-slot empty">—</div>
      <div class="mini-slot empty">—</div>
      <div class="mini-slot empty">—</div>
    </div>
    <div class="theme-label">No frame</div>`;
  noneTile.addEventListener('click', () => selectTheme(null, noneTile));
  themeGrid.appendChild(noneTile);

  THEMES.forEach((theme) => {
    const tile = document.createElement('button');
    tile.className = 'theme-tile';
    const slots = Array.from({ length: 4 })
      .map(() => `<div class="mini-slot"><img src="${theme.src}" alt=""></div>`)
      .join('');
    tile.innerHTML = `<div class="mini-strip">${slots}</div><div class="theme-label">${theme.name}</div>`;
    tile.addEventListener('click', () => selectTheme(theme, tile));
    themeGrid.appendChild(tile);
  });
}

/**
 * @param {import('./data.js').Theme|null} theme
 * @param {HTMLElement} tileEl
 */
function selectTheme(theme, tileEl) {
  state.selectedTheme = theme;
  Array.from(themeGrid.children).forEach((c) => c.classList.remove('selected'));
  tileEl.classList.add('selected');
  themeContinueBtn.disabled = false;
}

/**
 * Push the currently selected theme onto both live overlay <img> elements
 * (setup screen + capture screen). Called once, right before leaving the
 * theme screen — see main.js.
 */
export function applyThemeToOverlays() {
  [frameOverlaySetup, frameOverlayCapture].forEach((el) => {
    if (state.selectedTheme) {
      el.src = state.selectedTheme.src;
      el.classList.remove('hidden');
    } else {
      el.src = '';
      el.classList.add('hidden');
    }
  });
}
