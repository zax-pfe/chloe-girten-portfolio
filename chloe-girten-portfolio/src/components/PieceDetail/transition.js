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

// Layer of the panel, under the page, that holds the ghost (see Inner).
export const GHOST_LAYER_SELECTOR = "[data-ghost-layer]";
const getGhostLayer = (element) => getPanel(element)?.querySelector(GHOST_LAYER_SELECTOR);

// Static copy of the page being left (the grid, or a piece page), at the same place.
// The page is replaced as soon as the route changes: the ghost stays in the panel so the old
// content can fade out while the panel resizes and the new content comes in.
// `hiddenChild`: a child left out of the copy (the clicked grid item, which flips instead).
export function createGhost(element, hiddenChild) {
  const layer = getGhostLayer(element);
  if (!layer) return null;
  layer.replaceChildren();

  // Frame at the panel's current size, which doesn't follow it: the copy keeps its size while
  // the panel moves and resizes, the panel just clips it. Also the size the copy's cq units
  // refer to (100cqh = panel height, like in the PageWrapper).
  const layerRect = layer.getBoundingClientRect();
  const frame = document.createElement("div");
  Object.assign(frame.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${layerRect.width}px`,
    height: `${layerRect.height}px`,
    containerType: "size",
  });

  const ghost = element.cloneNode(true);
  if (hiddenChild) ghost.children[[...element.children].indexOf(hiddenChild)].style.visibility = "hidden";
  // Only the real elements may be matched by Flip.
  ghost.querySelectorAll("[data-flip-id]").forEach((child) => child.removeAttribute("data-flip-id"));

  // Same place and width as the original (scrolled position included).
  const rect = element.getBoundingClientRect();
  Object.assign(ghost.style, {
    position: "absolute",
    left: `${rect.left - layerRect.left}px`,
    top: `${rect.top - layerRect.top}px`,
    width: `${rect.width}px`,
  });
  frame.append(ghost);
  layer.append(frame);
  return frame;
}

// Fades the ghost out, then removes it.
export function fadeOutGhost(ghost) {
  return gsap.to(ghost, {
    autoAlpha: 0,
    duration: motionDuration(FADE_DURATION),
    ease: FADE_EASE,
    onComplete: () => ghost.remove(),
  });
}

// No movement when the user asks for reduced motion.
export function motionDuration(duration) {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
}
