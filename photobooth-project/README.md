# Photobooth

A minimalist, browser-based photobooth. No backend, no build step, no
dependencies — pick a frame, strike a pose, take 8 shots, pick your
favorite 4, and get a real photostrip you can download.

![status](https://img.shields.io/badge/status-in--development-blue)

## Features

- **Countdown capture** — adjustable 3–15s countdown, takes 8 photos back to back
- **Character frames** — pick a themed frame with a transparent face-hole; it's live on the camera feed the whole time and baked into every captured photo
- **Pose inspo** *(optional)* — reference photostrips shown live next to the camera, with a highlight that steps through the 4 poses as your session progresses
- **Pick 4 of 8** — tap photos in the order you want them on the strip; live strip preview as you go
- **Downloadable strip** — composites your 4 photos into a real PNG photostrip
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
│   ├── main.js              Entry point — wires up every module
│   ├── data.js               Frame + pose-inspo asset registry (edit this to add assets)
│   ├── state.js               Shared mutable app state
│   ├── dom.js                  $ helper + screen navigation
│   ├── utils.js                 Small formatting helpers (date stamp)
│   ├── help.js                   "?" tooltip
│   ├── themePicker.js              Frame picker screen
│   ├── poseInspo.js                 Pose-inspo picker + live reference panel
│   ├── camera.js                     Camera access, countdown, capture pipeline
│   ├── selectScreen.js                Pick 4 of 8, strip preview
│   └── printing.js                     Contact modal, printing animation, download
├── assets/
│   ├── frames/               Character frame PNGs/WEBPs (transparent face-hole)
│   └── inspo/                 Pose-inspo reference strip PNGs/WEBPs
└── docs/
    ├── ARCHITECTURE.md       How the screens and modules fit together
    └── ADDING_ASSETS.md      Step-by-step: adding a new frame or pose-inspo strip
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how data flows through
the app, and [`docs/ADDING_ASSETS.md`](docs/ADDING_ASSETS.md) for the most
common thing you'll want to do — adding a new theme or pose-inspo strip.

## Browser support

Needs a browser with ES module support and `getUserMedia` — any current
version of Chrome, Firefox, Safari, or Edge. No IE11, no polyfills.

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
- **No persistence.** Nothing is saved between sessions or across a page
  refresh — captured photos live only in memory for the current session.

## Deploying

This is a fully static site, so any static host works (GitHub Pages,
Netlify, Vercel, Cloudflare Pages, S3, etc.). For GitHub Pages specifically:

1. Push this whole folder to a GitHub repo.
2. Repo → **Settings → Pages** → set Source to "Deploy from a branch" → pick
   your branch and the root folder → Save.
3. Your site will be live at `https://<username>.github.io/<repo-name>/`.

GitHub Pages serves everything over `https://`, which is exactly what the
camera needs — no extra config required.

## License

Add a license of your choice here. The character frame and pose-inspo
images under `assets/` are illustrative placeholders you provided during
development — make sure you have the rights to use them before publishing.
