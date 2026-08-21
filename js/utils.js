/**
 * utils.js
 * ---------------------------------------------------------------------------
 * Small formatting helpers with no dependency on app state, used by a couple
 * of different screens.
 * ---------------------------------------------------------------------------
 */

/** Today's date as MM.DD.YY, used as the little stamp on the strip. */
export function dateStamp() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}.${dd}.${yy}`;
}
