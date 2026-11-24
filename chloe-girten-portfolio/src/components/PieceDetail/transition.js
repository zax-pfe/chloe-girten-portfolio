import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

export { Flip };

// Grid <-> piece page. The panel resize and the image Flip share the same duration and ease:
// the image's edges then follow the panel's and never get clipped.
export const PANEL_DURATION = 1;
export const PANEL_EASE = "power3.inOut";
// Content swaps: the other grid items before opening, the piece page before closing, the grid after.
export const FADE_DURATION = 0.3;
export const FADE_EASE = "power1.inOut";

// Ties a grid item to the piece page's image, for Flip.
export const pieceFlipId = (id) => `piece-${id}`;
// The page panel (Inner), flipped with the image when a piece opens from the grid.
export const PANEL_FLIP_ID = "panel";
export const getPanel = (element) => element.closest(`[data-flip-id="${PANEL_FLIP_ID}"]`);

// No movement when the user asks for reduced motion.
export function motionDuration(duration) {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
}
