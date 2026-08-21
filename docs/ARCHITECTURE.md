# Architecture

This is a plain HTML/CSS/JS app — no framework, no bundler, no build step.
JavaScript is organized as native [ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules),
loaded via a single `<script type="module" src="js/main.js">` in
`index.html`. Modules `import`/`export` between each other directly; the
browser resolves and loads the dependency graph itself.

## The five screens

The whole app is one page with five `<section class="screen">` elements in
`index.html`, only one of which is visible (`.active`) at a time:

```
theme  →  setup  →  capture  →  select  →  printing
(pick     (camera    (8-shot    (pick 4    (contact,
 frame)    preview,   countdown   of 8,      animation,
           shutter)   loop)       strip      download)
                                  preview)
```

`js/dom.js` owns this map (`screens`) and the only function allowed to
switch between them, `showScreen(name)`. No module reaches into another
screen's DOM to toggle visibility directly — everything goes through
`showScreen`.

## State

`js/state.js` exports one plain object, `state`, imported by reference into
every module that needs it. There's no pub/sub or event bus — a module that
changes `state.selectedTheme` expects other modules to read the fresh value
next time they need it (e.g. `camera.js` reads `state.selectedTheme` at the
moment a photo is captured). This works because the app is small and
single-threaded; if this project grows a lot, consider a proper state
container, but for five screens and ~10 fields it would be overkill.

## Module responsibilities

| Module | Owns |
|---|---|
| `data.js` | Static asset registries (`THEMES`, `INSPO_STRIPS`) — the only file most contributors need to edit |
| `state.js` | The shared mutable state object |
| `dom.js` | `$()` element lookup, screen map, `showScreen()` |
| `utils.js` | Stateless formatting helpers (currently just `dateStamp()`) |
| `help.js` | The "?" tooltip in the top bar |
| `themePicker.js` | Frame picker screen: builds the tile grid, tracks selection, pushes the chosen frame onto the live `<img class="frame-overlay">` elements |
| `poseInspo.js` | Pose-inspo modal + live reference panel, including the pose-highlight logic |
| `camera.js` | `getUserMedia` setup, the adjustable countdown, and the capture loop that composites frame + video into each photo |
| `selectScreen.js` | The "pick 4 of 8" grid and strip preview |
| `printing.js` | Contact modal, printing/dispensing animation, and the canvas compositing that produces the downloadable strip PNG |
| `main.js` | Calls every module's `init*()` function and wires the handful of buttons that cross module boundaries |

## Why some wiring lives in `main.js` instead of the module itself

Most buttons are wired inside the module that owns their screen (e.g. the
theme tiles are wired inside `themePicker.js`). A few buttons need to
trigger behavior that spans two modules — for example, clicking
**Continue** on the theme screen needs to:

1. push the selected frame onto the camera overlays (`themePicker.js`)
2. push the selected pose-inspo strip onto its panels (`poseInspo.js`)
3. navigate to the setup screen (`dom.js`)

Rather than have `themePicker.js` import `poseInspo.js` (or vice versa) just
to make this one click work, that composition lives in `main.js`, which is
allowed to know about every module. This keeps `themePicker.js` and
`poseInspo.js` independent of each other — you could delete the pose-inspo
feature entirely by removing its module, its `init`/`apply` calls in
`main.js`, and its markup, without touching `themePicker.js` at all.

## The capture pipeline (why photos already contain their frame)

When a photo is taken (`camera.js` → `takePhoto()`):

1. The live video frame is center-cropped to a square and drawn onto an
   offscreen `<canvas>`, mirrored to match what the user sees in the
   preview (`transform: scaleX(-1)` on the `<video>` is a CSS-only mirror;
   the canvas draw has to mirror it again manually since canvas doesn't
   inherit CSS transforms).
2. If a frame is selected, it's drawn on top of that same canvas, scaled
   with the same "contain" logic as the CSS overlay so it lines up with
   what was on screen.
3. The canvas is exported once as a single flat JPEG `dataURL` via
   `canvas.toDataURL(...)`.

That data URL is the *only* representation of the photo from that point on
— `state.photos` is just an array of these strings. This means every
downstream screen (selection grid, strip preview, printing screen, PNG
download) is completely unaware that frames exist as a feature; they just
render whatever image string they're given. If you add a new kind of
live overlay in the future, as long as you composite it into the canvas
before `toDataURL()` is called, nothing else in the app needs to change.

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

`camera.js` maps the 8 shots onto 4 poses two at a time
(`SHOTS_PER_POSE = TOTAL_SHOTS / POSES_PER_INSPO_STRIP`), so poses 1–4 each
get shots `[0,1] [2,3] [4,5] [6,7]`.
