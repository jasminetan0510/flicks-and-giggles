/**
 * data.js
 * ---------------------------------------------------------------------------
 * Static asset registries for the two pickable "extras" in the app:
 *
 *   STICKERS       — decorative images users can drag onto their finished
 *                    photostrip (see stickers.js). Purely cosmetic, added
 *                    after the 4 photos are picked.
 *   INSPO_STRIPS   — pose-inspiration reference strips shown live next to the
 *                    camera while shooting (see poseInspo.js).
 *
 * This is the ONLY file you need to touch to add, remove, or rename assets.
 * See docs/ADDING_ASSETS.md for the full walkthrough and image requirements.
 * ---------------------------------------------------------------------------
 */

/**
 * Any PNG/WEBP with a transparent background works well as a sticker —
 * unlike the old frame feature, there's no hole/alignment requirement here,
 * since stickers are placed freely by the user rather than lined up with a
 * face. Displayed small in the tray, and at ~26% of the strip's width when
 * placed.
 *
 * @typedef {{ id: string, name: string, src: string }} Sticker
 * @type {Sticker[]}
 */
export const STICKERS = [
  { id: 'friedchicken', name: 'Fried Chicken', src: 'assets/stickers/friedchicken.webp' },
  { id: 'boba',         name: 'Boba Bunny',    src: 'assets/stickers/boba.webp' },
  { id: 'bear',         name: 'Cloud Bear',    src: 'assets/stickers/bear.webp' },
  { id: 'monster',      name: 'Minty Monster', src: 'assets/stickers/monster.webp' },
  { id: 'fish',         name: 'Blossom Fish',  src: 'assets/stickers/fish.webp' },
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

/**
 * Strip background color options — basic solid colors for now. Picked after
 * the 4 photos are selected, alongside stickers. Any valid CSS color string
 * works as `hex` (named colors, hex, rgb() all fine); the field is named
 * `hex` because that's what every current entry happens to be.
 *
 * @typedef {{ id: string, name: string, hex: string }} StripColor
 * @type {StripColor[]}
 */
export const STRIP_COLORS = [
  { id: 'white',    name: 'White',    hex: '#ffffff' },
  { id: 'blush',    name: 'Blush',    hex: '#f7dfe4' },
  { id: 'butter',   name: 'Butter',   hex: '#fbf0d0' },
  { id: 'mint',     name: 'Mint',     hex: '#dcf3e6' },
  { id: 'sky',      name: 'Sky',      hex: '#dcedfb' },
  { id: 'lavender', name: 'Lavender', hex: '#e6e1f7' },
];
