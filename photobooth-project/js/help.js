/**
 * help.js
 * ---------------------------------------------------------------------------
 * The "?" tooltip in the top bar: click to toggle, click outside to close.
 * ---------------------------------------------------------------------------
 */
import { $ } from './dom.js';

export function initHelpTooltip() {
  const helpBtn = $('helpBtn');
  const helpPanel = $('helpPanel');

  helpBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    helpPanel.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!helpPanel.contains(e.target) && e.target !== helpBtn) {
      helpPanel.classList.add('hidden');
    }
  });
}
