/**
 * printing.js
 * ---------------------------------------------------------------------------
 * The tail end of the flow: contact modal -> printing/dispensing animation
 * -> downloadable strip. There is no real backend here, so "Send" doesn't
 * actually email or text anyone — the printing screen says so plainly and
 * offers a real PNG download instead. If you wire up a real send (e.g. a
 * serverless function or form endpoint), that call belongs in
 * `handleSend()` below.
 *
 * Placed stickers (state.placedStickers, percentages of the strip card's
 * full size — see state.js) are re-rendered here twice: once as plain
 * non-interactive <img> tags on the printing screen's strip, and once
 * drawn directly onto the download canvas. The chosen strip background
 * color (state.stripColor) is applied the same way, in both places.
 * ---------------------------------------------------------------------------
 */
import { $, showScreen } from './dom.js';
import { state } from './state.js';
import { dateStamp } from './utils.js';

const STICKER_WIDTH_PCT_FALLBACK = 26; // used only if an older placedSticker entry lacks sizePct

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
  $('printStrip').style.background = state.stripColor;
  renderPrintStickers();

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

/** Mirrors state.placedStickers as plain (non-draggable) images on the printing screen's strip. */
function renderPrintStickers() {
  const layer = $('printStickerLayer');
  layer.innerHTML = '';
  state.placedStickers.forEach((placed) => {
    const img = document.createElement('img');
    img.src = placed.src;
    img.alt = '';
    img.style.position = 'absolute';
    img.style.left = placed.xPct + '%';
    img.style.top = placed.yPct + '%';
    img.style.width = (placed.sizePct ?? STICKER_WIDTH_PCT_FALLBACK) + '%';
    img.style.transform = 'translate(-50%,-50%)';
    layer.appendChild(img);
  });
}

/** Composite the 4 selected photos (+ any placed stickers) into a downloadable strip PNG. */
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

  ctx.fillStyle = state.stripColor;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#5f72b5';
  ctx.textAlign = 'center';
  ctx.font = "600 24px 'Poppins', sans-serif";
  ctx.fillText('Photobooth', W / 2, 40);

  function drawPhotoSlot(img, x, y, w, h) {
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

  function loadImage(src) {
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.src = src;
    });
  }

  Promise.all(state.selectedOrder.map((i) => loadImage(state.photos[i])))
    .then((photoImgs) => {
      photoImgs.forEach((im, i) => {
        const y = headerH + i * (photoH + GAP);
        drawPhotoSlot(im, PAD, y, W - PAD * 2, photoH);
      });
      return Promise.all(state.placedStickers.map((p) => loadImage(p.src).then((im) => ({ im, p }))));
    })
    .then((stickerEntries) => {
      stickerEntries.forEach(({ im, p }) => {
        const sw = W * ((p.sizePct ?? STICKER_WIDTH_PCT_FALLBACK) / 100);
        const sh = sw * ((im.naturalHeight || im.height) / (im.naturalWidth || im.width) || 1);
        const cx = (p.xPct / 100) * W;
        const cy = (p.yPct / 100) * H;
        ctx.drawImage(im, cx - sw / 2, cy - sh / 2, sw, sh);
      });

      ctx.fillStyle = '#b7bdd6';
      ctx.font = "12px 'Inter', sans-serif";
      ctx.fillText(dateStamp() + '  ·  made in the booth', W / 2, H - 18);

      const link = document.createElement('a');
      link.download = 'photo-strip.png';
      link.href = out.toDataURL('image/png');
      link.click();
    });
}
