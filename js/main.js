/**
 * main.js
 * ---------------------------------------------------------------------------
 * Entry point, loaded from index.html as a module (`<script type="module">`),
 * which means it runs after the DOM is parsed — no DOMContentLoaded wrapper
 * needed. Each screen/feature's own wiring lives in its own module; this
 * file just calls each module's init function and wires the one button that
 * crosses module boundaries ("Start over").
 * ---------------------------------------------------------------------------
 */
import { $, showScreen } from './dom.js';
import { state } from './state.js';
import { initHelpTooltip } from './help.js';
import { initPoseInspo } from './poseInspo.js';
import { initCamera, requestCameraStream } from './camera.js';
import { initSelectScreen } from './selectScreen.js';
import { initStickers, renderPlacedStickers } from './stickers.js';
import { initStripColor } from './stripColor.js';
import { initPrinting } from './printing.js';

function init() {
  initHelpTooltip();
  initPoseInspo();
  initCamera();
  initSelectScreen();
  initStickers();
  initStripColor();
  initPrinting();

  $('restartBtn').addEventListener('click', () => {
    state.photos = [];
    state.selectedOrder = [];
    state.placedStickers = [];
    state.contactValue = '';
    $('contactInput').value = '';
    $('contactInput').style.borderColor = '';
    renderPlacedStickers();
    // selectedInspo and stripColor intentionally persist across restarts —
    // most people re-run with the same pose set and strip styling.
    showScreen('setup');
    requestCameraStream();
  });
}

init();
