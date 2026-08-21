# Adding a new frame or pose-inspo strip

This is the thing you'll do most often. Both asset types are registered in
one place: **`js/data.js`**. You never need to touch any other JS file to
add, rename, or remove one.

## Adding a character frame

A frame is a single image with **real alpha transparency** in the hole
where the face goes — not a white circle, an actual transparent PNG/WEBP.
The rest of the character can be any shape; the app draws the frame on top
of the camera feed and lets the transparent hole show the video through.

1. **Prepare the image.** Export as PNG (or WEBP — smaller file size, same
   transparency support) with a transparent background and a transparent
   hole. Tools like remove.bg work well for cutting out product photos.
   Roughly square, ~500×500px is plenty — this is displayed small.
2. **Optimize it** (optional but recommended — keeps the repo and page
   weight small):
   ```bash
   # Requires Pillow: pip install pillow
   python3 -c "
   from PIL import Image
   im = Image.open('my-new-frame.png').convert('RGBA')
   im.thumbnail((480, 480))
   im.save('assets/frames/my-new-frame.webp', 'WEBP', quality=82, method=6)
   "
   ```
3. **Drop the file** into `assets/frames/`.
4. **Register it** in `js/data.js`:
   ```js
   export const THEMES = [
     // ...existing themes...
     { id: 'my-new-frame', name: 'My New Frame', src: 'assets/frames/my-new-frame.webp' },
   ];
   ```
5. Refresh the page. It'll show up automatically as a new tile on the frame
   picker screen, previewed as a mini 4-slot photostrip, and will be baked
   into captured photos the same way the built-in frames are.

That's it — no other file needs to change. `id` just needs to be unique;
it's not shown anywhere.

## Adding a pose-inspo strip

A pose-inspo strip is **one flattened image containing 4 poses**, stacked
vertically. This is the important part: **the app assumes the 4 poses are
equal-height and stacked edge-to-edge, with no header, footer, logo, or
border baked into the image.** The live highlight box that steps through
poses during capture is just a plain 25%-height band — if your image has
padding or branding at the top/bottom, the highlight will drift out of
alignment with the actual poses.

1. **Crop the source strip** so it's *only* the 4 photos, top to bottom, no
   extra chrome. If you're pulling from a meme template or reference strip
   that has a logo bar, crop that off first.
2. **Check your crop** — a quick way to sanity-check before adding it:
   ```bash
   python3 -c "
   from PIL import Image
   im = Image.open('my-strip.png')
   w, h = im.size
   print(f'{w}x{h}, each pose should be about {h/4:.0f}px tall')
   "
   ```
   If the visible pose boundaries in the image don't land near multiples of
   `h/4`, re-crop.
3. **Optimize and convert** (recommended):
   ```bash
   python3 -c "
   from PIL import Image
   im = Image.open('my-strip.png').convert('RGB')
   w, h = im.size
   target_w = 300
   im2 = im.resize((target_w, round(h * target_w / w)))
   im2.save('assets/inspo/my-strip.webp', 'WEBP', quality=78, method=6)
   "
   ```
4. **Drop the file** into `assets/inspo/`.
5. **Register it** in `js/data.js`:
   ```js
   export const INSPO_STRIPS = [
     // ...existing strips...
     { id: 'my-strip', name: 'My Strip', src: 'assets/inspo/my-strip.webp' },
   ];
   ```
6. Refresh the page. It'll appear in the "Pose inspo" modal on the theme
   screen.

## Removing an asset

Delete its entry from the `THEMES` or `INSPO_STRIPS` array in `js/data.js`
(and the file from `assets/`, if you want to clean up). Nothing else
references assets by id outside that array.
