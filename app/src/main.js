// Wires the page: pick photos, type the lettering, choose a layout and grade, crop the
// hero photo by dragging it, and export the cover as a PNG in a post size.
// A `?shot=` query sets up a fixed scene for a screenshot instead (./shots.js).
import { drawCover, SIZES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const titleInput = document.getElementById('title');
const taglineInput = document.getElementById('tagline');
const exportImage = document.getElementById('export-image');

const state = {
  photo: null,
  photo2: null,
  title: 'SUNSET BAY',
  tagline: 'HEIST · CHASE · ESCAPE',
  layout: 'grid',
  grade: 'sunset',
  zoom: 1,
  panX: 0,
  panY: 0,
  size: '1080x1080',
  art: true,
};

function redraw() {
  const [w, h] = SIZES[state.size];
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  drawCover(canvas, state);
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Applies a full state patch (used by ?shot= scenes) and redraws. */
export function applyState(patch) {
  Object.assign(state, patch);
  titleInput.value = state.title;
  taglineInput.value = state.tagline;
  document.querySelectorAll('input[name=layout]').forEach((r) => { r.checked = r.value === state.layout; });
  document.getElementById('grade').value = state.grade;
  document.getElementById('size').value = state.size;
  document.getElementById('zoom').value = String(state.zoom);
  document.getElementById('art').checked = state.art;
  redraw();
}

export function getState() {
  return { ...state };
}

// --- controls ---------------------------------------------------------------

document.getElementById('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  state.photo = await loadImage(URL.createObjectURL(file));
  state.panX = 0;
  state.panY = 0;
  redraw();
});
document.getElementById('photo2').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  state.photo2 = await loadImage(URL.createObjectURL(file));
  redraw();
});
document.querySelectorAll('[data-sample]').forEach((button) => {
  button.addEventListener('click', async () => {
    const target = button.getAttribute('data-sample');
    const img = await loadImage(`samples/${target}.jpg`);
    if (button.getAttribute('data-slot') === '2') state.photo2 = img;
    else state.photo = img;
    redraw();
  });
});
titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
taglineInput.addEventListener('input', () => { state.tagline = taglineInput.value; redraw(); });
document.querySelectorAll('input[name=layout]').forEach((radio) => {
  radio.addEventListener('change', () => { state.layout = radio.value; redraw(); });
});
document.getElementById('grade').addEventListener('change', (e) => { state.grade = e.target.value; redraw(); });
document.getElementById('size').addEventListener('change', (e) => { state.size = e.target.value; redraw(); });
document.getElementById('zoom').addEventListener('input', (e) => { state.zoom = Number(e.target.value); redraw(); });
document.getElementById('art').addEventListener('change', (e) => { state.art = e.target.checked; redraw(); });

// Drag the preview to pan the hero photo.
let dragging = null;
canvas.addEventListener('pointerdown', (e) => {
  dragging = { x: e.clientX, y: e.clientY, panX: state.panX, panY: state.panY };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  state.panX = Math.max(-1, Math.min(1, dragging.panX + (e.clientX - dragging.x) / rect.width * 2));
  state.panY = Math.max(-1, Math.min(1, dragging.panY + (e.clientY - dragging.y) / rect.height * 2));
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = null; });

// --- export -----------------------------------------------------------------

/** Renders the cover at the chosen size and resolves to its PNG blob. */
export function exportPng() {
  return new Promise((resolve) => {
    const [w, h] = SIZES[state.size];
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    drawCover(off, state);
    off.toBlob((blob) => resolve(blob), 'image/png');
  });
}

document.getElementById('export').addEventListener('click', async () => {
  const blob = await exportPng();
  const [w, h] = SIZES[state.size];
  const name = `cover-${w}x${h}.png`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  // Show the exported PNG itself, so the export can be inspected.
  exportImage.src = a.href;
  exportImage.hidden = false;
  status.textContent = `Saved ${name} (${Math.round(blob.size / 1024)} KiB)`;
});

// --- start ------------------------------------------------------------------

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, { applyState, loadImage, getState, exportPng });
} else {
  redraw();
}
