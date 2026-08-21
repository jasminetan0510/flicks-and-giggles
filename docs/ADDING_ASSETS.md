# Adding a new sticker or pose-inspo strip

This is the thing you'll do most often. Both asset types are registered in
one place: **`js/data.js`**. You never need to touch any other JS file to
add, rename, or remove one.

## Adding a sticker

Stickers are decorative images people drag onto their finished 4-photo
strip on the select screen. Unlike the old character-frame feature, there's
no alignment or transparency requirement to get right — any image with a
transparent background looks good; a plain rectangular photo works too, it
just won't blend in as nicely.

1. **Prepare the image.** PNG or WEBP, transparent background recommended.
   Roughly square works best since it's displayed at a fixed width and
   scales height automatically — very tall or very wide images will look
   odd at sticker size.
2. **Optimize it** (optional but recommended):
   ```bash
   # Requires Pillow: pip install pillow
   python3 -c "
   from PIL import Image
   im = Image.open('my-new-sticker.png').convert('RGBA')
   im.thumbnail((480, 480))
   im.save('assets/stickers/my-new-sticker.webp', 'WEBP', quality=82, method=6)
   "
   ```
3. **Drop the file** into `assets/stickers/`.
4. **Register it** in `js/data.js`:
   ```js
   export const STICKERS = [
     // ...existing stickers...
     { id: 'my-new-sticker', name: 'My New Sticker', src: 'assets/stickers/my-new-sticker.webp' },
   ];
   ```
5. Refresh the page. It'll show up automatically in the sticker tray next to
   the strip preview on the select screen.

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
6. Refresh the page. It'll appear in the "Pose inspo" modal on the setup
   screen. Note that the highlight now advances **every single shot** (not
   every other shot), cycling through all 4 poses twice over an 8-shot
   session.

## Removing an asset

Delete its entry from the `STICKERS` or `INSPO_STRIPS` array in `js/data.js`
(and the file from `assets/`, if you want to clean up). Nothing else
references assets by id outside that array.
