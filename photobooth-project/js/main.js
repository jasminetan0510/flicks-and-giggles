/**
 * main.js
 * ---------------------------------------------------------------------------
 * Entry point, loaded from index.html as a module (`<script type="module">`),
 * which means it runs after the DOM is parsed — no DOMContentLoaded wrapper
 * needed. Each screen/feature's own wiring lives in its own module; this
 * file just calls each module's init function and wires the handful of
 * buttons that cross module boundaries (e.g. "Continue" needs both the
 * theme module's and the pose-inspo module's apply-to-DOM step).
 * ---------------------------------------------------------------------------
 */
import { $, showScreen } from './dom.js';
import { state } from './state.js';
import { initHelpTooltip } from './help.js';
import { initThemePicker, applyThemeToOverlays } from './themePicker.js';
import { initPoseInspo, applyInspoToPanels } from './poseInspo.js';
import { initCamera, requestCameraStream } from './camera.js';
import { initSelectScreen } from './selectScreen.js';
import { initPrinting } from './printing.js';

function init() {
  initHelpTooltip();
  initThemePicker();
  initPoseInspo();
  initCamera();
  initSelectScreen();
  initPrinting();

  // Theme screen -> Setup screen: bake the chosen frame + pose-inspo
  // selections into the live camera overlays, then move on.
  $('themeContinueBtn').addEventListener('click', () => {
    applyThemeToOverlays();
    applyInspoToPanels();
    showScreen('setup');
  });

  $('changeThemeBtn').addEventListener('click', () => showScreen('theme'));

  $('restartBtn').addEventListener('click', () => {
    state.photos = [];
    state.selectedOrder = [];
    state.contactValue = '';
    $('contactInput').value = '';
    $('contactInput').style.borderColor = '';
    // selectedTheme / selectedInspo intentionally persist across restarts —
    // most people re-run with the same frame/pose set.
    showScreen('theme');
    requestCameraStream();
  });
}

init();
