/**
 * data.js
 * ---------------------------------------------------------------------------
 * Static asset registries for the two pickable "extras" in the app:
 *
 *   THEMES        — character frames with a transparent face-hole. Composited
 *                    directly onto each captured photo (see camera.js).
 *   INSPO_STRIPS   — pose-inspiration reference strips shown live next to the
 *                    camera while shooting (see poseInspo.js).
 *
 * This is the ONLY file you need to touch to add, remove, or rename assets.
 * See docs/ADDING_ASSETS.md for the full walkthrough and image requirements.
 * ---------------------------------------------------------------------------
 */

/**
 * Each theme is a PNG/WEBP with a genuinely transparent hole where the face
 * goes (not just a white circle — real alpha transparency). At capture time
 * the frame is drawn on top of the mirrored, center-cropped square video
 * frame, so the camera shows through the hole in the final photo.
 *
 * @typedef {{ id: string, name: string, src: string }} Theme
 * @type {Theme[]}
 */
export const THEMES = [
  { id: 'friedchicken', name: 'Fried Chicken',   src: 'assets/frames/friedchicken.webp' },
  { id: 'boba',         name: 'Boba Bunny',      src: 'assets/frames/boba.webp' },
  { id: 'bear',         name: 'Cloud Bear',      src: 'assets/frames/bear.webp' },
  { id: 'monster',      name: 'Minty Monster',   src: 'assets/frames/monster.webp' },
  { id: 'fish',         name: 'Blossom Fish',    src: 'assets/frames/fish.webp' },
];

/**
 * Each pose-inspo strip is ONE flattened image containing 4 poses stacked
 * edge-to-edge with EQUAL heights and no header/footer branding baked in.
 * The live highlight box is a plain 25%-height band (see poseInspo.js
 * `updateInspoHighlight`), so it only lines up correctly if the source image
 * is cropped exactly that way.
 *
 * @typedef {{ id: string, name: string, src: string }} InspoStrip
 * @type {InspoStrip[]}
 */
export const INSPO_STRIPS = [
  { id: 'puppets',       name: 'Puppet Pals',         src: 'assets/inspo/puppets.webp' },
  { id: 'monkey',        name: 'Cheeky Monkey',       src: 'assets/inspo/monkey.webp' },
  { id: 'spongebob',     name: 'SpongeBob & Patrick', src: 'assets/inspo/spongebob.webp' },
  { id: 'melody_kuromi', name: 'My Melody & Kuromi',  src: 'assets/inspo/melody_kuromi.webp' },
  { id: 'hello_kitty',   name: 'Hello Kitty & Friend',src: 'assets/inspo/hello_kitty.webp' },
];
