/**
 * camera.js
 * ---------------------------------------------------------------------------
 * Everything to do with the webcam: getUserMedia setup, the adjustable
 * countdown, and the 8-shot capture loop. Each captured photo is a single
 * flat JPEG dataURL with the selected frame already drawn on top — nothing
 * downstream (selection screen, strip preview, download) needs to know
 * frames exist at all.
 * ---------------------------------------------------------------------------
 */
import { $, showScreen } from './dom.js';
import { state } from './state.js';
import { updateInspoHighlight } from './poseInspo.js';
import { buildSelectGrid } from './selectScreen.js';

const video = $('video');
const videoCapture = $('videoCapture');
const canvas = $('captureCanvas');
const frameOverlayCapture = $('frameOverlayCapture');

const TOTAL_SHOTS = 8;
const POSES_PER_INSPO_STRIP = 4;
const SHOTS_PER_POSE = TOTAL_SHOTS / POSES_PER_INSPO_STRIP; // 2

export function initCamera() {
  requestCameraStream();
  $('retryCamBtn').addEventListener('click', requestCameraStream);

  const range = $('countdownRange');
  range.addEventListener('input', () => {
    state.countdownSeconds = parseInt(range.value, 10);
    $('countdownReadout').textContent = state.countdownSeconds + 's';
  });

  $('startBtn').addEventListener('click', startCaptureSession);
}

/**
 * (Re)requests the camera stream. Exported so main.js can call it again on
 * "Start over" — the stream is intentionally stopped after all 8 shots are
 * taken (see takePhoto), so a fresh session needs a fresh stream.
 */
export async function requestCameraStream() {
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 960 } },
      audio: false,
    });
    video.srcObject = state.stream;
    videoCapture.srcObject = state.stream;
    $('camError').classList.add('hidden');
    $('startBtn').disabled = false;
  } catch (err) {
    $('camError').classList.remove('hidden');
    $('startBtn').disabled = true;
  }
}

function stopStream() {
  if (state.stream) {
    state.stream.getTracks().forEach((t) => t.stop());
    state.stream = null;
  }
}

function startCaptureSession() {
  if (!state.stream) return;
  state.photos = [];
  state.shotIndex = 0;
  showScreen('capture');
  $('thumbRail').innerHTML = '';
  runCountdownForShot();
}

/** Which of the 4 inspo poses (0-3) the current shot maps to. 2 shots/pose. */
function currentPoseIndex() {
  return Math.min(POSES_PER_INSPO_STRIP - 1, Math.floor(state.shotIndex / SHOTS_PER_POSE));
}

function runCountdownForShot() {
  $('shotCounter').textContent = `SHOT ${state.shotIndex + 1} / ${TOTAL_SHOTS}`;

  if (state.selectedInspo) {
    const poseIdx = currentPoseIndex();
    updateInspoHighlight($('inspoHighlightCapture'), poseIdx);
    $('inspoPoseCaption').textContent = `Pose ${poseIdx + 1} of ${POSES_PER_INSPO_STRIP}`;
  }

  let remaining = state.countdownSeconds;
  $('countdownNum').textContent = remaining;
  clearInterval(state.countdownTimer);
  state.countdownTimer = setInterval(() => {
    remaining -= 1;
    if (remaining > 0) {
      $('countdownNum').textContent = remaining;
    } else {
      clearInterval(state.countdownTimer);
      $('countdownNum').textContent = '';
      takePhoto();
    }
  }, 1000);
}

function takePhoto() {
  triggerFlash();

  const vw = videoCapture.videoWidth || 960;
  const vh = videoCapture.videoHeight || 960;
  const size = Math.min(vw, vh);
  const sx = (vw - size) / 2;
  const sy = (vh - size) / 2;

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Draw a mirrored, center-cropped square video frame (matches the
  // on-screen preview exactly, since the preview is also square + mirrored).
  ctx.save();
  ctx.translate(size, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(videoCapture, sx, sy, size, size, 0, 0, size, size);
  ctx.restore();

  // Composite the selected frame on top (never mirrored — it isn't camera
  // footage), using the same "contain" fit as the CSS overlay on screen.
  if (state.selectedTheme && frameOverlayCapture.complete && frameOverlayCapture.naturalWidth) {
    const nw = frameOverlayCapture.naturalWidth;
    const nh = frameOverlayCapture.naturalHeight;
    const scale = Math.min(size / nw, size / nh);
    const dw = nw * scale;
    const dh = nh * scale;
    const dx = (size - dw) / 2;
    const dy = (size - dh) / 2;
    ctx.drawImage(frameOverlayCapture, dx, dy, dw, dh);
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  state.photos.push(dataUrl);

  const thumb = document.createElement('img');
  thumb.src = dataUrl;
  thumb.className = 'thumb';
  $('thumbRail').appendChild(thumb);

  state.shotIndex++;
  if (state.shotIndex < TOTAL_SHOTS) {
    setTimeout(runCountdownForShot, 900);
  } else {
    setTimeout(() => {
      stopStream();
      buildSelectGrid();
      showScreen('select');
    }, 700);
  }
}

function triggerFlash() {
  const flashEl = $('flashOverlay');
  flashEl.classList.remove('flash-anim');
  void flashEl.offsetWidth; // restart the CSS animation
  flashEl.classList.add('flash-anim');
}
