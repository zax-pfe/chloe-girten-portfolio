import { gsap } from "gsap";
import { MOVEMENTS, getInitialMovement, readStoredPanel } from "./index";

/** @typedef {import("./types").Piece} Piece */

// Longest frame step: a hiccup (tab switch, GC) never makes pieces jump.
const MAX_DT = 0.05;

export const GLOBAL_DEFAULTS = { speedMultiplier: 1, paused: false, seed: 1, overlay: false };

// Live settings, read every frame and edited by the debug panel. No React state: no re-render.
export const settings = { variant: null, ...GLOBAL_DEFAULTS, fps: 0 };

// Live params of each variant, created from its defaults.
const variantParams = {};

export function getVariantParams(name) {
  variantParams[name] ??= { ...MOVEMENTS[name].defaults };
  return variantParams[name];
}

export function resetVariantParams(name) {
  Object.assign(getVariantParams(name), MOVEMENTS[name].defaults);
}

// Copies known values of a panel save (gui.save() format) into the live settings and params.
export function applyPanelValues(saved) {
  const variant = saved?.controllers?.variant;
  const global = saved?.folders?.Global?.controllers ?? {};
  Object.keys(GLOBAL_DEFAULTS).forEach((key) => {
    if (key in global) settings[key] = global[key];
  });
  if (!MOVEMENTS[variant]) return;
  const params = getVariantParams(variant);
  const values = saved.folders?.[variant]?.controllers ?? {};
  Object.keys(params).forEach((key) => {
    if (key in values) params[key] = values[key];
  });
}

/**
 * Drives the pieces with the active variant and renders them with gsap.
 * @param {{ pieces: Piece[], stage: HTMLElement, timeScale: { speed: number } }} options
 *   timeScale.speed is eased by the component (slow down while a piece is selected).
 */
export function createMovementRuntime({ pieces, stage, timeScale }) {
  const bounds = { width: 0, height: 0, seed: settings.seed };
  const pointer = { x: 0, y: 0, active: false };
  let strategy = null;
  let states = [];
  let time = 0;
  let setters = [];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const onPointerMove = (event) => {
    pointer.x = event.clientX - bounds.width / 2;
    pointer.y = event.clientY - bounds.height / 2;
    pointer.active = true;
  };
  const onPointerLeave = () => {
    pointer.active = false;
  };
  window.addEventListener("pointermove", onPointerMove);
  document.documentElement.addEventListener("pointerleave", onPointerLeave);

  function render() {
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      if (piece.held) continue;
      const state = states[i];
      const set = setters[i];
      set.x(state.x);
      set.y(state.y);
      set.rotation(state.rotation);
      set.scale(state.scale);
      set.opacity(state.opacity);
      // Last rendered transform: where a selected piece goes back to.
      const rendered = piece.rendered;
      rendered.x = state.x;
      rendered.y = state.y;
      rendered.rotation = state.rotation;
      rendered.scale = state.scale;
      rendered.opacity = state.opacity;
    }
  }

  const runtime = {
    pieces,
    pointer,
    bounds,
    // Set by the debug overlay: called after each render with the states and the frame step.
    onFrame: null,

    get strategy() {
      return strategy;
    },

    // Sizes of the stage and pieces. Call on mount and on resize.
    measure() {
      bounds.width = stage.offsetWidth;
      bounds.height = stage.offsetHeight;
      pieces.forEach((piece) => {
        const { offsetWidth, offsetHeight } = piece.element;
        piece.width = offsetWidth;
        piece.height = offsetHeight;
        piece.radius = piece.data.radius
          ? (piece.data.radius * window.innerHeight) / 100
          : (offsetWidth + offsetHeight) / 4;
      });
      strategy?.resize?.(bounds);
    },

    // (Re)starts a variant from its init.
    setVariant(name) {
      const key = MOVEMENTS[name] ? name : getInitialMovement();
      settings.variant = key;
      strategy = MOVEMENTS[key];
      bounds.seed = settings.seed;
      setters = pieces.map(({ element }) => ({
        x: gsap.quickSetter(element, "x", "px"),
        y: gsap.quickSetter(element, "y", "px"),
        rotation: gsap.quickSetter(element, "rotation", "deg"),
        scale: gsap.quickSetter(element, "scale"),
        opacity: gsap.quickSetter(element, "opacity"),
      }));
      strategy.init(pieces, bounds, getVariantParams(key));
      states = strategy.update(0, time, pointer);
      render();
    },

    reseed(seed = Math.floor(Math.random() * 9999) + 1) {
      settings.seed = seed;
      runtime.setVariant(settings.variant);
    },

    // One frame. `delta` in seconds.
    tick(delta) {
      if (!strategy) return;
      if (delta > 0) settings.fps += (1 / delta - settings.fps) * 0.05;
      const frozen = settings.paused || reducedMotion.matches;
      const dt = frozen ? 0 : Math.min(delta, MAX_DT) * settings.speedMultiplier * timeScale.speed;
      time += dt;
      states = strategy.update(dt, time, pointer);
      render();
      runtime.onFrame?.(states, dt);
    },

    destroy() {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      runtime.onFrame = null;
    },
  };

  // Development: restore the panel's last values before the first frame.
  if (!settings.variant) applyPanelValues(readStoredPanel());
  return runtime;
}

// Normalized piece from an imageList.js entry; sizes are measured by the runtime.
export function createPiece(data, index) {
  return {
    index,
    data,
    element: null,
    width: 0,
    height: 0,
    radius: 0,
    z: data.z ?? 0.5,
    anchor: data.anchor ?? data.basePosition,
    seed: data.seed ?? data.id,
    speed: 1,
    held: false,
    rendered: { x: 0, y: 0, rotation: data.rotation, scale: 1, opacity: 1 },
  };
}
