/**
 * HERO 3D PORTRAIT: ANGLES
 * ---------------------------------------------------------------
 * The hero portrait can be rotated by visitors (drag / swipe / arrow keys / view buttons).
 * Each angle needs its own photo, because a single front photo cannot show your sides or top.
 *
 * How to unlock an angle:
 *   1. Take the photo (same spot, same lighting, same distance, same outfit as the front shot):
 *        left  → turn your body ~90° so your LEFT shoulder faces the camera
 *        right → turn ~90° so your RIGHT shoulder faces the camera
 *        top   → camera held above you, angled down at your head and shoulders
 *   2. Remove the background (remove.bg, Photoshop, or Canva) and export a transparent PNG
 *      with the same framing as the front image (head near the top, cropped at the same height).
 *   3. Save it in /public (e.g. public/illias-left.webp) and set the path below.
 *
 * Any angle left as `undefined` stays locked: visitors can only tilt slightly towards it,
 * and its view button is hidden.
 */

export interface HeroViews {
  front: string;
  left?: string;
  right?: string;
  top?: string;
}

export const heroViews: HeroViews = {
  front: "/illias-hero.webp",
  left: undefined,
  right: undefined,
  top: undefined,
};
