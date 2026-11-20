// Renders a GTA-style multi-panel cover onto any canvas, at any size, offline.
// Everything is drawn with the canvas 2D API: panels, colour grades, sun, rays, palm
// silhouettes and lettering are all original vector art — no Rockstar artwork, logos
// or fonts. Photos come from the user or the bundled samples; with no photo yet, a
// procedural sunset scene stands in so the cover is never blank.

/** The layouts the editor offers, in the order the page lists them. */
export const LAYOUTS = ['grid', 'duo', 'triptych', 'poster'];

/** The colour grades the editor offers. */
export const GRADES = ['sunset', 'neon', 'noir', 'pastel'];

/** The export sizes the editor offers, as [width, height]. */
export const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

/** A canvas filter string for a grade (empty for none). */
function gradeFilter(grade) {
  if (grade === 'sunset') return 'saturate(1.35) contrast(1.12) sepia(0.18)';
  if (grade === 'neon') return 'saturate(1.8) contrast(1.25) hue-rotate(-12deg)';
  if (grade === 'noir') return 'grayscale(1) contrast(1.3) brightness(1.05)';
  if (grade === 'pastel') return 'saturate(0.75) contrast(0.9) brightness(1.12)';
  return '';
}

/** The tint a grade washes over a photo: [top colour, bottom colour]. */
function gradeTint(grade) {
  if (grade === 'sunset') return ['rgba(255, 122, 60, 0.16)', 'rgba(190, 30, 110, 0.30)'];
  if (grade === 'neon') return ['rgba(0, 220, 255, 0.12)', 'rgba(255, 0, 150, 0.28)'];
  if (grade === 'noir') return ['rgba(0, 0, 0, 0.10)', 'rgba(0, 0, 0, 0.35)'];
  if (grade === 'pastel') return ['rgba(255, 200, 220, 0.14)', 'rgba(140, 180, 255, 0.16)'];
  return ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)'];
}

/** Draws `img` to cover (x, y, w, h), zoomed around the centre and panned by fractions of the panel. */
function drawImageCover(ctx, img, x, y, w, h, zoom, panX, panY) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  const ox = (w - pw) / 2 + panX * w * 0.2;
  const oy = (h - ph) / 2 + panY * h * 0.2;
  ctx.drawImage(img, x + ox, y + oy, pw, ph);
}

/** A procedural sunset scene for when no photo is loaded yet. */
function drawProceduralScene(ctx, x, y, w, h, grade) {
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, '#2b1055');
  sky.addColorStop(0.45, '#ff7e5f');
  sky.addColorStop(0.75, '#feb47b');
  sky.addColorStop(1, '#1a0b2e');
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  drawSun(ctx, x + w * 0.5, y + h * 0.42, Math.min(w, h) * 0.16);
  // A skyline silhouette along the foot (seeded, so the same scene draws the same way).
  ctx.fillStyle = '#160a24';
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + h * 0.78);
  let bx = x;
  let seed = 1234567;
  const next = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  while (bx < x + w) {
    const bw = w * (0.06 + next() * 0.05);
    const bh = h * (0.08 + next() * 0.14);
    ctx.lineTo(bx, y + h * 0.78 - bh);
    ctx.lineTo(bx + bw, y + h * 0.78 - bh);
    ctx.lineTo(bx + bw, y + h * 0.78);
    bx += bw + w * 0.02;
  }
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
  const [top, bottom] = gradeTint(grade);
  const tint = ctx.createLinearGradient(0, y, 0, y + h);
  tint.addColorStop(0, top);
  tint.addColorStop(1, bottom);
  ctx.fillStyle = tint;
  ctx.fillRect(x, y, w, h);
}

/** A sun disc with rays, centred at (cx, cy) with radius r. */
function drawSun(ctx, cx, cy, r) {
  ctx.save();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.55)';
  ctx.lineWidth = Math.max(2, r * 0.06);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r * 1.25, cy + Math.sin(a) * r * 1.25);
    ctx.lineTo(cx + Math.cos(a) * r * 1.7, cy + Math.sin(a) * r * 1.7);
    ctx.stroke();
  }
  ctx.restore();
}

/** A palm-tree silhouette rooted at (x, y), scaled by s. */
function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, s * 0.05);
  ctx.lineCap = 'round';
  // Trunk, leaning slightly.
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.08, y - s * 0.55, x + s * 0.22, y - s * 0.95);
  ctx.stroke();
  const topX = x + s * 0.22;
  const topY = y - s * 0.95;
  // Fronds fanning out from the crown.
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.95 + i * 0.17);
    const ex = topX + Math.cos(a) * s * 0.55;
    const ey = topY + Math.sin(a) * s * 0.32 + s * 0.18;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + Math.cos(a) * s * 0.3, topY + Math.sin(a) * s * 0.12 - s * 0.12, ex, ey);
    ctx.stroke();
  }
  ctx.restore();
}

/** Fits `text` in bold capitals into width `w`, stroked and filled, with a slight lean. */
function drawTitle(ctx, text, cx, baselineY, w, maxSize) {
  const words = text.trim().toUpperCase();
  if (!words) return;
  let size = maxSize;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  for (;;) {
    ctx.font = `900 ${size}px 'Arial Black', Impact, 'DejaVu Sans', sans-serif`;
    try { ctx.letterSpacing = `${Math.round(size * 0.04)}px`; } catch { /* older canvas: no letterSpacing */ }
    if (ctx.measureText(words).width <= w || size <= 10) break;
    size -= 2;
  }
  ctx.transform(1, 0, -0.06, 1, 0, 0);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#160a24';
  ctx.lineWidth = Math.max(2, size * 0.14);
  ctx.strokeText(words, cx, baselineY);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(words, cx, baselineY);
  ctx.restore();
}

/** A small letter-spaced tagline, centred. */
function drawTagline(ctx, text, cx, baselineY, w, size) {
  const words = text.trim().toUpperCase();
  if (!words) return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let s = size;
  for (;;) {
    ctx.font = `700 ${s}px 'Arial Black', Impact, 'DejaVu Sans', sans-serif`;
    try { ctx.letterSpacing = `${Math.round(s * 0.28)}px`; } catch { /* no letterSpacing */ }
    if (ctx.measureText(words).width <= w || s <= 8) break;
    s -= 1;
  }
  ctx.fillStyle = '#ffd166';
  ctx.fillText(words, cx, baselineY);
  ctx.restore();
}

/** One photo panel: photo (or procedural scene), grade filter and tint, clipped to its rect. */
function drawPanel(ctx, img, fallback, x, y, w, h, grade, zoom, panX, panY) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (img) {
    ctx.filter = gradeFilter(grade);
    drawImageCover(ctx, img, x, y, w, h, zoom, panX, panY);
    ctx.filter = 'none';
  } else if (fallback) {
    drawImageCover(ctx, fallback, x, y, w, h, 1.15, 0, 0);
  } else {
    drawProceduralScene(ctx, x, y, w, h, grade);
  }
  const [top, bottom] = gradeTint(grade);
  const tint = ctx.createLinearGradient(0, y, 0, y + h);
  tint.addColorStop(0, top);
  tint.addColorStop(1, bottom);
  ctx.fillStyle = tint;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** The title band across the foot: sunset gradient, sun, palms and the lettering. */
function drawTitleBand(ctx, opts, x, y, w, h) {
  const band = ctx.createLinearGradient(x, y, x + w, y);
  band.addColorStop(0, '#ff7e5f');
  band.addColorStop(0.5, '#e84393');
  band.addColorStop(1, '#6c3483');
  ctx.fillStyle = band;
  ctx.fillRect(x, y, w, h);
  if (opts.art) {
    drawSun(ctx, x + w * 0.88, y + h * 0.5, h * 0.32);
    drawPalm(ctx, x + w * 0.06, y + h * 0.98, h * 0.85, 'rgba(22, 10, 36, 0.85)');
    drawPalm(ctx, x + w * 0.12, y + h * 0.98, h * 0.6, 'rgba(22, 10, 36, 0.7)');
  }
  drawTitle(ctx, opts.title, x + w * 0.5, y + h * 0.62, w * 0.86, h * 0.52);
  drawTagline(ctx, opts.tagline, x + w * 0.5, y + h * 0.88, w * 0.8, h * 0.16);
}

/**
 * Draws the cover described by `opts` onto `canvas`:
 *   photo, photo2: loaded images or null; title, tagline: strings;
 *   layout: 'grid' | 'duo' | 'triptych' | 'poster'; grade: one of GRADES;
 *   zoom, panX, panY: hero-photo crop (1, 0, 0 for none); art: draw sun and palms.
 */
export function drawCover(canvas, opts) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const g = Math.max(4, Math.round(W * 0.008)); // white gutter between panels
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  if (opts.layout === 'poster') {
    // Smart fit: a blurred, graded cover of the photo fills the frame, and the
    // whole photo sits on top of it, so a portrait photo never loses its top.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.clip();
    if (opts.photo) {
      ctx.filter = `blur(${Math.max(12, Math.round(W * 0.02))}px) ${gradeFilter(opts.grade)}`;
      drawImageCover(ctx, opts.photo, 0, 0, W, H, 1.05, 0, 0);
      ctx.filter = 'none';
      const s = Math.min(W / opts.photo.naturalWidth, H / opts.photo.naturalHeight);
      const pw = opts.photo.naturalWidth * s;
      const ph = opts.photo.naturalHeight * s;
      ctx.filter = gradeFilter(opts.grade);
      ctx.drawImage(opts.photo, (W - pw) / 2, (H - ph) / 2, pw, ph);
      ctx.filter = 'none';
    } else {
      drawProceduralScene(ctx, 0, 0, W, H, opts.grade);
    }
    const [top, bottom] = gradeTint(opts.grade);
    const tint = ctx.createLinearGradient(0, 0, 0, H);
    tint.addColorStop(0, top);
    tint.addColorStop(1, bottom);
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    if (opts.art) {
      drawSun(ctx, W * 0.12, H * 0.16, Math.min(W, H) * 0.08);
      drawPalm(ctx, W * 0.05, H * 0.98, H * 0.22, 'rgba(22, 10, 36, 0.9)');
    }
    const shade = ctx.createLinearGradient(0, H * 0.55, 0, H);
    shade.addColorStop(0, 'rgba(22, 10, 36, 0)');
    shade.addColorStop(1, 'rgba(22, 10, 36, 0.72)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, W, H);
    drawTitle(ctx, opts.title, W * 0.5, H * 0.88, W * 0.9, H * 0.11);
    drawTagline(ctx, opts.tagline, W * 0.5, H * 0.95, W * 0.8, H * 0.032);
    return;
  }

  const bandH = Math.round(H * 0.17);
  const bodyH = H - bandH;
  if (opts.layout === 'grid') {
    const heroW = Math.round(W * 0.62);
    drawPanel(ctx, opts.photo, null, 0, 0, heroW, bodyH, opts.grade, opts.zoom, opts.panX, opts.panY);
    const rx = heroW + g;
    const rw = W - rx;
    const topH = Math.round(bodyH * 0.55);
    drawPanel(ctx, opts.photo2, opts.photo, rx, 0, rw, topH, opts.grade, 1.15, -0.3, 0.2);
    drawPanel(ctx, opts.photo2, opts.photo, rx, topH + g, rw, bodyH - topH - g, opts.grade, 1.25, 0.35, -0.15);
  } else if (opts.layout === 'duo') {
    const hw = Math.round((W - g) / 2);
    drawPanel(ctx, opts.photo, null, 0, 0, hw, bodyH, opts.grade, opts.zoom, opts.panX, opts.panY);
    drawPanel(ctx, opts.photo2, opts.photo, hw + g, 0, W - hw - g, bodyH, opts.grade, 1.2, 0.3, 0.1);
  } else {
    // triptych: three equal panels; the middle one is the hero.
    const pw = Math.round((W - 2 * g) / 3);
    drawPanel(ctx, opts.photo2, opts.photo, 0, 0, pw, bodyH, opts.grade, 1.2, -0.35, 0);
    drawPanel(ctx, opts.photo, null, pw + g, 0, pw, bodyH, opts.grade, opts.zoom, opts.panX, opts.panY);
    drawPanel(ctx, opts.photo2, opts.photo, 2 * (pw + g), 0, W - 2 * (pw + g), bodyH, opts.grade, 1.2, 0.35, 0);
  }
  drawTitleBand(ctx, opts, 0, bodyH, W, bandH);
}
