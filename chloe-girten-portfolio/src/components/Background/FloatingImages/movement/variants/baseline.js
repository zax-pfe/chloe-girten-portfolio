import { DEG, wrap } from "../utils";

/** @typedef {import("../types").MovementStrategy} MovementStrategy */

let pieces = [];
let params = null;
let states = [];
// Per piece values, preallocated so update() never allocates.
let times = new Float64Array(0);
let wrapWidths = new Float64Array(0);
let wrapHeights = new Float64Array(0);

// Each piece wraps on the stage extended by its diagonal (covers any rotation),
// so it reappears as soon as it has fully left the screen.
function measureWrap(bounds) {
  pieces.forEach((piece, i) => {
    const diagonal = Math.hypot(piece.width, piece.height);
    wrapWidths[i] = bounds.width + diagonal;
    wrapHeights[i] = bounds.height + diagonal;
  });
}

/**
 * Reference: the original motion algorithm. Straight drift along `direction`, sine wobble
 * on each axis, and a modulo that brings pieces back on the opposite side.
 * Its traits (start, direction, wobble...) are generated from the seed (../traits.js).
 * @type {MovementStrategy}
 */
export const baseline = {
  name: "baseline",
  defaults: {
    // Drift speed of a piece at speed 1, in px/s.
    driftSpeed: 55,
    // Rotation sway while floating, in degrees.
    rotationAmplitude: 4,
  },
  ranges: {
    driftSpeed: [0, 200, 1],
    rotationAmplitude: [0, 20, 0.1],
  },

  init(nextPieces, bounds, nextParams) {
    pieces = nextPieces;
    params = nextParams;
    times = new Float64Array(pieces.length);
    wrapWidths = new Float64Array(pieces.length);
    wrapHeights = new Float64Array(pieces.length);
    measureWrap(bounds);
    // Start positions spread over the visible screen.
    states = pieces.map((piece) => ({
      x: piece.traits.basePosition[0] * bounds.width,
      y: piece.traits.basePosition[1] * bounds.height,
      rotation: piece.traits.rotation,
      scale: 1,
      opacity: 1,
    }));
  },

  resize(bounds) {
    measureWrap(bounds);
  },

  update(dt) {
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      if (piece.held) continue;
      const state = states[i];
      const { direction, amplitude, frequency, phase, rotation } = piece.traits;

      // Advance from the current position so floating resumes smoothly after a selection.
      const pieceDt = dt * piece.activity;
      const distance = pieceDt * piece.speed * params.driftSpeed;
      const previousTime = times[i];
      times[i] += pieceDt;
      const time = times[i];
      const angularFrequency = frequency * Math.PI * 2;
      // Independent waves on each axis.
      const wobbleX =
        amplitude *
        (Math.sin(time * angularFrequency + phase[0]) - Math.sin(previousTime * angularFrequency + phase[0]));
      const wobbleY =
        amplitude *
        (Math.sin(time * angularFrequency * 0.83 + phase[1]) -
          Math.sin(previousTime * angularFrequency * 0.83 + phase[1]));
      const angle = direction * DEG;

      state.x = wrap(state.x + Math.cos(angle) * distance + wobbleX, wrapWidths[i]);
      state.y = wrap(state.y + Math.sin(angle) * distance + wobbleY, wrapHeights[i]);
      // Sway around the base rotation, starting from it at time 0.
      state.rotation =
        rotation +
        params.rotationAmplitude * (Math.sin(time * angularFrequency * 0.6 + phase[0]) - Math.sin(phase[0]));
    }
    return states;
  },
};
