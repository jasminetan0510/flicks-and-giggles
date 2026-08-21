/**
 * camera.js
 * ---------------------------------------------------------------------------
 * Everything to do with the webcam: getUserMedia setup, the countdown
 * (preset lengths + a tick sound for the last 3 seconds), and the 8-shot
 * capture loop. Each captured photo is a single flat JPEG dataURL — nothing
 * downstream (selection screen, strip preview, download) does any further
 * image processing on it.
 * ---------------------------------------------------------------------------
 */
import { $, showScreen } from './dom.js';
import { state } from './state.js';
import { updateInspoHighlight } from './poseInspo.js';
import { buildSelectGrid } from './selectScreen.js';
import { unlockAudio, playBeep } from './sound.js';

const video = $('video');
const videoCapture = $('videoCapture');
const canvas = $('captureCanvas');

const TOTAL_SHOTS = 8;
const POSES_PER_INSPO_STRIP = 4;
const BEEP_STARTS_AT = 3; // seconds remaining when the countdown tick sound starts

export function initCamera() {
  requestCameraStream();
  $('retryCamBtn').addEventListener('click', requestCameraStream);

  document.querySelectorAll('.countdown-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.countdownSeconds = parseInt(btn.dataset.secs, 10);
      document.querySelectorAll('.countdown-option').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
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
  unlockAudio(); // must happen inside a user-gesture handler, so it lives here
  state.photos = [];
  state.shotIndex = 0;
  showScreen('capture');
  $('thumbRail').innerHTML = '';
  runCountdownForShot();
}

/**
 * Which of the 4 inspo poses (0-3) the current shot maps to. Advances every
 * single shot (not every-other-shot) so the highlighted pose is always
 * visibly moving during an 8-shot session — cycling through all 4 poses
 * twice over.
 */
function currentPoseIndex() {
  return state.shotIndex % POSES_PER_INSPO_STRIP;
}

function runCountdownForShot() {
  $('shotCounter').textContent = `SHOT ${state.shotIndex + 1} / ${TOTAL_SHOTS}`;

  if (state.selectedInspo) {
    const poseIdx = currentPoseIndex();
    updateInspoHighlight($('inspoHighlightCapture'), poseIdx);
    $('inspoPoseCaption').textContent = `Pose ${poseIdx + 1} of ${POSES_PER_INSPO_STRIP}`;
  }

  let remaining = state.countdownSeconds;
  showCountdownTick(remaining);
  clearInterval(state.countdownTimer);
  state.countdownTimer = setInterval(() => {
    remaining -= 1;
    if (remaining > 0) {
      showCountdownTick(remaining);
    } else {
      clearInterval(state.countdownTimer);
      $('countdownNum').textContent = '';
      takePhoto();
    }
  }, 1000);
}

/** Updates the big countdown number and plays the tick beep for the last 3 seconds. */
function showCountdownTick(remaining) {
  $('countdownNum').textContent = remaining;
  if (remaining <= BEEP_STARTS_AT && remaining >= 1) {
    // pitch rises slightly as it counts down, for a little anticipation
    const freq = 550 + (BEEP_STARTS_AT - remaining) * 150;
    playBeep(freq);
  }
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
