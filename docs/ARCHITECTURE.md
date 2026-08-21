# Architecture

This is a plain HTML/CSS/JS app — no framework, no bundler, no build step.
JavaScript is organized as native [ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules),
loaded via a single `<script type="module" src="js/main.js">` in
`index.html`. Modules `import`/`export` between each other directly; the
browser resolves and loads the dependency graph itself.

## The four screens

The whole app is one page with four `<section class="screen">` elements in
`index.html`, only one of which is visible (`.active`) at a time:

```
setup  →  capture  →  select (+ decorate)  →  printing
(camera    (8-shot     (pick 4 of 8, then      (contact,
 preview,   countdown   drag stickers onto      animation,
 countdown  loop, tick   the strip preview)      download)
 length,    sound for
 shutter)   last 3s)
```

`js/dom.js` owns this map (`screens`) and the only function allowed to
switch between them, `showScreen(name)`. No module reaches into another
screen's DOM to toggle visibility directly — everything goes through
`showScreen`.

Decorating with stickers isn't a separate screen — it happens directly on
the select screen's existing strip preview, since that's already showing
the finished strip. See "Stickers" below.

## State

`js/state.js` exports one plain object, `state`, imported by reference into
every module that needs it. There's no pub/sub or event bus — a module that
changes `state.selectedInspo` expects other modules to read the fresh value
next time they need it (e.g. `camera.js` reads `state.selectedInspo` at the
start of every countdown). This works because the app is small and
single-threaded; if this project grows a lot, consider a proper state
container, but for four screens and ~10 fields it would be overkill.

## Module responsibilities

| Module | Owns |
|---|---|
| `data.js` | Static asset registries (`STICKERS`, `INSPO_STRIPS`) — the only file most contributors need to edit |
| `state.js` | The shared mutable state object |
| `dom.js` | `$()` element lookup, screen map, `showScreen()` |
| `utils.js` | Stateless formatting helpers (currently just `dateStamp()`) |
| `sound.js` | Web Audio beep generator for the countdown tick |
| `help.js` | The "?" tooltip in the top bar |
| `poseInspo.js` | Pose-inspo modal + live reference panel, including the pose-highlight logic |
| `camera.js` | `getUserMedia` setup, the countdown (preset lengths + tick sound), and the capture loop |
| `selectScreen.js` | The "pick 4 of 8" grid and strip preview |
| `stickers.js` | Sticker tray + drag-to-place/resize/remove logic on the strip preview |
| `stripColor.js` | Strip background color swatches |
| `printing.js` | Contact modal, printing/dispensing animation, and the canvas compositing that produces the downloadable strip PNG |
| `main.js` | Calls every module's `init*()` function and wires the one button that crosses module boundaries ("Start over") |

## Why some wiring lives in `main.js` instead of the module itself

Most buttons are wired inside the module that owns their screen. The one
exception is **"Start over"**, which needs to reset state that several
modules care about (captured photos, picks, placed stickers, contact info)
and then re-request the camera stream — rather than have one module poke at
another's internals, that composition lives in `main.js`, which is allowed
to know about every module.

Everything else — including pose-inspo selection now taking effect
immediately, and stickers being added/dragged/removed — is self-contained
within its own module. This is a deliberate simplification from an earlier
version of this app, which had a dedicated "theme" screen and needed
`main.js` to coordinate a "Continue" button across two modules; removing
that screen removed the need for most of that cross-module wiring.

## The capture pipeline

When a photo is taken (`camera.js` → `takePhoto()`):

1. The live video frame is center-cropped to a square and drawn onto an
   offscreen `<canvas>`, mirrored to match what the user sees in the
   preview (`transform: scaleX(-1)` on the `<video>` is a CSS-only mirror;
   the canvas draw has to mirror it again manually since canvas doesn't
   inherit CSS transforms).
2. The canvas is exported once as a single flat JPEG `dataURL` via
   `canvas.toDataURL(...)`.

That data URL is the *only* representation of the photo from that point on
— `state.photos` is just an array of these strings. Every downstream screen
(selection grid, strip preview, printing screen, PNG download) just renders
whatever image string it's given.

Decoration (stickers) is applied later and separately — see below — rather
than baked into the photo itself, since it's chosen *after* the 4 photos
are picked, not before shooting.

## Pose-inspo highlight math

Pose-inspo strips are assumed to be one image containing 4 equal-height
poses stacked edge-to-edge (see `docs/ADDING_ASSETS.md`). The highlight
box in `poseInspo.js` (`updateInspoHighlight`) is just:

```js
highlightEl.style.top = poseIndex * 25 + '%';
```

...where `highlightEl` is absolutely positioned inside a container that
wraps the reference `<img>` tightly (the container has no explicit height,
so it sizes to the image). This only works because the image has no
baked-in header or footer — if it did, the 25%-bands would drift from the
actual pose boundaries.

`camera.js` advances the highlighted pose on **every shot**
(`state.shotIndex % 4`), so across 8 shots the 4 poses are each highlighted
twice, in order: `0,1,2,3,0,1,2,3`. (An earlier version advanced every
*other* shot, which made the panel look stuck for long stretches — this was
reported as a bug and fixed by advancing every shot instead.)

## Stickers

Stickers are placed by the user on the select screen, after their 4 photos
are chosen — see `stickers.js`. Each placed sticker is stored as:

```js
{ uid, src, xPct, yPct, sizePct }
```

`xPct`/`yPct` are the sticker's **center point**, and `sizePct` is its
**width**, all as a percentage (0–100) of the strip card's full
width/height — not pixels. That's the key design choice that makes the
same `state.placedStickers` array renderable in three different-sized
places without any conversion:

1. **The interactive layer** on the select screen's `#stripPreview`
   (`stickers.js` → `renderPlacedStickers()`), where stickers can be
   dragged (via Pointer Events — one code path for mouse, touch, and pen)
   by their body, resized by dragging the small handle at their
   bottom-right corner, or removed with their × badge.
2. **A static layer** on the printing screen's `#printStrip`
   (`printing.js` → `renderPrintStickers()`) — same percentages, plain
   `<img>` tags, no interactivity.
3. **The download canvas** (`printing.js` → `downloadStripImage()`), where
   each sticker is drawn at `(xPct/100 * canvasWidth, yPct/100 *
   canvasHeight)` with a width of `sizePct/100 * canvasWidth`.

Resizing (`wireResize` in `stickers.js`) works by measuring the live
horizontal distance from the sticker's center to the pointer and doubling
it — since the sticker is centered on its (x, y) via
`transform: translate(-50%, -50%)`, its right edge always sits at
`center + width / 2`, so that distance *is* half the width. Clamped between
`MIN_STICKER_WIDTH_PCT` (8%) and `MAX_STICKER_WIDTH_PCT` (55%) so a sticker
can't be shrunk to invisible or blown up past the strip itself.

Because the percentages are relative to the *entire* strip card (title bar
and date stamp included, not just the photo area), placement carries over
closely but not pixel-perfectly between the on-screen preview and the
downloaded PNG, since the two have slightly different header/footer
proportions. Good enough for a decorative feature; if you need exact
parity, the fix is to make both the on-screen card and the canvas use
identical padding ratios.

Stickers are cleared automatically whenever a fresh 8-shot session starts
(`selectScreen.js` → `buildSelectGrid()`) or the photo selection is reset
(`resetSelBtn`), since a placement only makes sense relative to the strip it
was drawn on.

## Strip background color

The simplest of the three decoration features: `state.stripColor` is just a
hex string, defaulted to white. `stripColor.js` renders one swatch button
per entry in `data.js`'s `STRIP_COLORS` and, on click, sets
`state.stripColor` and applies it as an inline `background` style on
`#stripPreview`. `printing.js` reapplies the same value to `#printStrip`
when the printing screen appears, and uses it as the canvas `fillStyle` for
the entire card in `downloadStripImage()`. There's no per-instance state
beyond that one hex string — swap it out at any point and every rendering
of the strip (preview, printing screen, download) picks it up next time it
re-renders.

This is intentionally the most basic possible version of a "frames"
feature — solid colors only. See the "Known limitations" section of the
README for what extending it to backgrounds/patterns/images would involve.
