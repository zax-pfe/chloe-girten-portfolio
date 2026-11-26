import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

export { Flip };

// Grid -> piece page: the image flips from its grid item while the panel resizes, slow enough
// to follow the image with the eye. Same duration and ease for both: the image's edges then
// follow the panel's and never get clipped.
export const PANEL_DURATION = 0.7;
export const PANEL_EASE = "power3.inOut";
// The panel moving alone (back to the grid, back/forward, navbar): there is nothing to follow
// with the eye, so it's shorter, starting fast and settling into place.
export const RESIZE_DURATION = 0.6;
export const RESIZE_EASE = "power3.out";
// Content swaps: the other grid items before opening, the piece page before closing, the grid after.
export const FADE_DURATION = 0.4;
export const FADE_EASE = "power1.inOut";
// Closing a scrolled piece page: it scrolls back up to its image first, for the image to go
// back into the grid from where it was opened.
export const REWIND_DURATION = 0.3;
export const REWIND_EASE = "power3.inOut";
// Back on the grid, the other items come back around the piece, one ring of cells after
// another: delay per cell of distance, up to RIPPLE_MAX_CELLS cells away.
// They start once the panel is well on its way (RIPPLE_START, share of PANEL_DURATION).
export const RIPPLE_STEP = 0.07;
export const RIPPLE_MAX_CELLS = 4;
export const RIPPLE_START = 0.35;

// Scrolling element of a page (PageWrapper).
export const PAGE_SCROLL_SELECTOR = "[data-page-scroll]";
export const getPageScroll = (element) => element.closest(PAGE_SCROLL_SELECTOR);

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

// GSAP's clock only moves on its ticks (one per frame). An animation created at the end of a
// long task, like React putting a new page in place, starts from a late clock and counts that
// task as already played: it starts with a jump. Created paused (its starting state already
// applied), it is started on the next tick instead, from its first frame.
export function playOnNextTick(animation) {
  const listener = gsap.ticker.add(() => animation.play(), true);
  // Killed before that tick: it must not be started.
  animation.eventCallback("onInterrupt", () => gsap.ticker.remove(listener));
  return animation;
}

// No movement when the user asks for reduced motion.
export function motionDuration(duration) {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
}
