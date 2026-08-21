# Photobooth

A minimalist, browser-based photobooth. No backend, no build step, no
dependencies — pick a countdown length, strike a pose, take 8 shots, pick
your favorite 4, decorate with stickers, and get a real photostrip you can
download.

![status](https://img.shields.io/badge/status-in--development-blue)

## Features

- **Countdown capture** — pick 3s, 5s, or 10s; takes 8 photos back to back, with a tick sound for the last 3 seconds of every countdown
- **Pose inspo** *(optional)* — reference photostrips shown live next to the camera, with a highlight that steps through the 4 poses every shot
- **Pick 4 of 8** — tap photos in the order you want them on the strip; live strip preview as you go
- **Sticker decoration** — drag stickers from a tray onto your finished strip; resize with the corner handle, reposition, or remove them freely before printing
- **Strip background colors** — pick from a handful of basic solid colors for the strip card itself
- **Downloadable strip** — composites your 4 photos, any placed stickers, and your chosen strip color into a real PNG photostrip
- **No scrolling, single viewport** — designed to run full-screen on a laptop, like a real booth

## Quick start

Because `index.html` loads its scripts as ES modules (`<script type="module">`),
opening the file directly (`file://...`) won't work in most browsers — modules
are blocked by CORS on the `file://` protocol. You need a local server:

```bash
cd photobooth
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works fine (`npx serve`, VS Code's "Live Server" extension,
etc.) — there's nothing to install or build.

Camera access (`getUserMedia`) also requires a "secure context": `localhost`
is fine for local dev, and any real deployment needs to be served over
**https** (see [Deploying](#deploying)).

## Project structure

```
photobooth/
├── index.html              Markup only — no inline styles or scripts
├── css/
│   └── styles.css          All styling
├── js/
│   ├── main.js               Entry point — wires up every module
│   ├── data.js                 Sticker + pose-inspo asset registry (edit this to add assets)
│   ├── state.js                  Shared mutable app state
│   ├── dom.js                      $ helper + screen navigation
│   ├── utils.js                     Small formatting helpers (date stamp)
│   ├── sound.js                       Countdown tick beep (Web Audio, no audio files)
│   ├── help.js                          "?" tooltip
│   ├── poseInspo.js                       Pose-inspo picker + live reference panel
│   ├── camera.js                            Camera access, countdown, capture pipeline
│   ├── selectScreen.js                        Pick 4 of 8, strip preview
│   ├── stickers.js                              Sticker tray + drag/resize/remove on the strip
│   ├── stripColor.js                              Strip background color picker
│   └── printing.js                                  Contact modal, printing animation, download
├── assets/
│   ├── stickers/              Decorative sticker PNGs/WEBPs
│   └── inspo/                   Pose-inspo reference strip PNGs/WEBPs
└── docs/
    ├── ARCHITECTURE.md       How the screens and modules fit together
    └── ADDING_ASSETS.md      Step-by-step: adding a new sticker or pose-inspo strip
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how data flows through
the app, and [`docs/ADDING_ASSETS.md`](docs/ADDING_ASSETS.md) for the most
common thing you'll want to do — adding a new sticker or pose-inspo strip.
Adding a new strip background color is even simpler — it's a one-line
addition to the `STRIP_COLORS` array in `js/data.js`, no image involved.

## Browser support

Needs a browser with ES module support, `getUserMedia`, Pointer Events, and
the Web Audio API — any current version of Chrome, Firefox, Safari, or
Edge. No IE11, no polyfills.

## Known limitations

- **"Send my photos" doesn't actually send anything.** There's no backend.
  The printing screen is honest about this in its copy ("demo — download
  below to keep it"). If you want real delivery, that's the one piece of
  server-side work this project doesn't do for you — see the note at the
  top of `js/printing.js` for where that call would go.
- **Pose-inspo highlighting assumes a specific image shape.** See
  `docs/ADDING_ASSETS.md` — strips need to be 4 equal-height poses stacked
  edge-to-edge with no header/footer branding, or the highlight band will
  be off.
- **Sticker placement isn't pixel-perfect between preview and download.**
  Position and size are stored as percentages of the whole strip card, so
  they carry over closely but not exactly between the on-screen preview and
  the downloaded PNG (their header/footer proportions differ slightly). See
  the "Stickers" section of `docs/ARCHITECTURE.md` if you need exact
  parity.
- **Strip colors are solid colors only, for now.** No gradients, patterns,
  or images — `STRIP_COLORS` in `js/data.js` is a flat list of hex values.
  Extending this to background images would mean changing `stripColor.js`
  and the canvas fill in `printing.js` from a solid `fillStyle` to a drawn
  image.
- **No persistence.** Nothing is saved between sessions or across a page
  refresh — captured photos and placed stickers live only in memory for
  the current session.

## Deploying

This is a fully static site, so any static host works (GitHub Pages,
Netlify, Vercel, Cloudflare Pages, S3, etc.). For GitHub Pages specifically:

1. Push this whole folder to a GitHub repo (make sure `index.html` sits at
   the repo root, alongside `css/`, `js/`, and `assets/` — not nested in a
   subfolder, or your Pages URL will have an extra path segment).
2. Repo → **Settings → Pages** → set Source to "Deploy from a branch" → pick
   your branch and the root folder → Save.
3. Your site will be live at `https://<username>.github.io/<repo-name>/`.

GitHub Pages serves everything over `https://`, which is exactly what the
camera needs — no extra config required.

## License

Add a license of your choice here. The sticker and pose-inspo images under
`assets/` are illustrative placeholders you provided during development —
make sure you have the rights to use them before publishing.
