/**
 * printing.js
 * ---------------------------------------------------------------------------
 * The tail end of the flow: contact modal -> printing/dispensing animation
 * -> downloadable strip. There is no real backend here, so "Send" doesn't
 * actually email or text anyone — the printing screen says so plainly and
 * offers a real PNG download instead. If you wire up a real send (e.g. a
 * serverless function or form endpoint), that call belongs in
 * `handleSend()` below.
 * ---------------------------------------------------------------------------
 */
import { $, showScreen } from './dom.js';
import { state } from './state.js';
import { dateStamp } from './utils.js';

export function initPrinting() {
  $('modalCloseBtn').addEventListener('click', () => $('contactModal').classList.add('hidden'));
  $('skipBtn').addEventListener('click', handleSkip);
  $('sendBtn').addEventListener('click', handleSend);
  $('downloadBtn').addEventListener('click', downloadStripImage);
}

function handleSkip() {
  state.contactValue = '';
  $('contactModal').classList.add('hidden');
  goToPrinting();
}

function handleSend() {
  const val = $('contactInput').value.trim();
  if (!val) {
    $('contactInput').style.borderColor = '#c96b6b';
    return;
  }
  state.contactValue = val;
  $('contactModal').classList.add('hidden');
  goToPrinting();
}

function goToPrinting() {
  const slots = document.querySelectorAll('#printStrip .strip-slot');
  slots.forEach((slot, i) => {
    slot.innerHTML =
      state.selectedOrder[i] !== undefined ? `<img src="${state.photos[state.selectedOrder[i]]}">` : '';
  });
  $('printDate').textContent = dateStamp();
  $('printCaption').innerHTML =
    'Developing your photos <span class="dots"><span></span><span></span><span></span></span>';
  $('printActions').classList.remove('show');

  const strip = $('printStrip');
  strip.classList.remove('out');
  void strip.offsetWidth; // restart the CSS transition

  showScreen('printing');

  setTimeout(() => strip.classList.add('out'), 150);
  setTimeout(() => {
    const dest = state.contactValue || 'you';
    $('printCaption').textContent = state.contactValue
      ? `Sent to ${dest} ✓ (demo — download below to keep it)`
      : `Ready ✓ — download your strip below`;
    $('printActions').classList.add('show');
  }, 2300);
}

/** Composite the 4 selected photos into a single downloadable strip PNG. */
function downloadStripImage() {
  const W = 500,
    PAD = 28,
    GAP = 16;
  const photoH = W - PAD * 2; // photos are square
  const headerH = 62;
  const footerH = 46;
  const H = headerH + (photoH + GAP) * 4 + footerH;

  const out = document.createElement('canvas');
  out.width = W;
  out.height = H;
  const ctx = out.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f6f7fc';
  ctx.fillRect(0, 0, W, headerH);

  ctx.fillStyle = '#5f72b5';
  ctx.textAlign = 'center';
  ctx.font = "600 24px 'Poppins', sans-serif";
  ctx.fillText('Photobooth', W / 2, 40);

  function drawSlot(img, x, y, w, h) {
    const ir = img.width / img.height;
    const sr = w / h;
    let sx, sy, sw, sh;
    if (ir > sr) {
      sh = img.height;
      sw = sh * sr;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = sw / sr;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    const r = 14;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    ctx.restore();
    ctx.strokeStyle = '#e2e6f3';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  const imgs = state.selectedOrder.map((i) => {
    const im = new Image();
    im.src = state.photos[i];
    return im;
  });

  let loaded = 0;
  imgs.forEach((im) => {
    if (im.complete) loaded++;
    im.onload = () => {
      loaded++;
      maybeFinish();
    };
  });
  maybeFinish();

  function maybeFinish() {
    if (loaded < imgs.length) return;
    imgs.forEach((im, i) => {
      const y = headerH + i * (photoH + GAP);
      drawSlot(im, PAD, y, W - PAD * 2, photoH);
    });
    ctx.fillStyle = '#b7bdd6';
    ctx.font = "12px 'Inter', sans-serif";
    ctx.fillText(dateStamp() + '  ·  made in the booth', W / 2, H - 18);

    const link = document.createElement('a');
    link.download = 'photo-strip.png';
    link.href = out.toDataURL('image/png');
    link.click();
  }
}
