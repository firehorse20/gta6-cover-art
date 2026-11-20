[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/firehorse20/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/firehorse20/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Vice Cover Studio

Turn any photo and caption into GTA-style multi-panel cover art, exported as a PNG to share — for [make.fun's Make GTA 6 Cover Art bounty](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **Four layouts**: Hero + two panels, Split duo, Triptych, and Full poster.
- **Four colour grades**: Sunset, Neon nights, Noir, Pastel.
- **Any photo**: upload your own, or use the two bundled sample photos (Boulevard, Pier). A second photo fills the side panels.
- **Crop by dragging**: drag the cover to pan the hero photo; a zoom slider tightens the crop.
- **Your own lettering**: editable title and tagline, drawn in bold outlined capitals with a sun, rays and palm silhouettes — all original vector art drawn with the canvas 2D API. No Rockstar artwork, logos or fonts.
- **Export**: PNG in 1080×1080, 1080×1350 or 1920×1080, plus a preview of the exported file.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Everything is static files under `app/`; the app works offline in a desktop browser and makes no network requests. Photos never leave the machine.

## Build the entry

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json` (built with the vendored `vendor/makefun-app.ts`, byte-identical to what the scorer computes).

## Layout

- `main.ts` — the entry program (Node 22, standard library only).
- `app/index.html`, `app/style.css`, `app/src/main.js` — the editor.
- `app/src/cover.js` — the cover renderer (layouts, grades, sun, palms, lettering).
- `app/src/shots.js` — fixed scenes for screenshots (`?shot=editor|cover|export`).
- `app/samples/` — two sample photos, made for make.fun with an image model, free to use.
- `screenshots/` — 3–4 renders of the app (the first by name is the cover).
- `vendor/makefun-app.ts` — make.fun's dossier library, copied from the kit unchanged.

## License

MIT — see `LICENSE`.
