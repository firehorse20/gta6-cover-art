// Fixed scenes for screenshots: ?shot=editor shows the editor with a photo loaded,
// ?shot=cover shows the cover alone, ?shot=export shows the cover the app exported.
// `photo` picks the sample (samples/<photo>.jpg), `photo2` the second panel's photo,
// `layout`, `grade`, `size`, `title` and `tagline` set the scene. window.__shotReady
// is set once the scene is painted.
import { drawCover } from './cover.js';

export async function runShot(shot, query, { applyState, loadImage, getState, exportPng }) {
  const photo = await loadImage(`samples/${query.get('photo') ?? 'pier'}.jpg`);
  let photo2 = null;
  if (query.get('photo2')) photo2 = await loadImage(`samples/${query.get('photo2')}.jpg`);
  applyState({
    photo,
    photo2,
    title: query.get('title') ?? 'SUNSET BAY',
    tagline: query.get('tagline') ?? 'HEIST · CHASE · ESCAPE',
    layout: query.get('layout') ?? 'grid',
    grade: query.get('grade') ?? 'sunset',
    size: query.get('size') ?? '1080x1080',
    art: query.get('art') !== '0',
  });
  if (shot === 'cover') {
    // The cover alone fills the viewport for the screenshot.
    document.body.classList.add('shot-cover');
    const canvas = document.getElementById('cover');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawCover(canvas, getState());
  }
  if (shot === 'export') {
    const blob = await exportPng();
    const img = document.getElementById('export-image');
    img.src = URL.createObjectURL(blob);
    img.hidden = false;
    document.body.classList.add('shot-export');
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
