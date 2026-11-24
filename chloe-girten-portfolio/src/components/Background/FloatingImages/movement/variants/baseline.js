import { createNoise2D } from "simplex-noise";
import { DEG, createRandom, wrap } from "../utils";

/** @typedef {import("../types").MovementStrategy} MovementStrategy */

let pieces = [];
let params = null;
let states = [];
let noise = () => 0;
// Per piece values, preallocated so update() never allocates.
let times = new Float64Array(0);
let rotationPhases = new Float64Array(0);
// Base heading of each piece, in radians: starts at `direction`, turned by the edges and the center pull.
let headings = new Float64Array(0);
let halfWidth = 0;
let halfHeight = 0;
let wrapWidths = new Float64Array(0);
let wrapHeights = new Float64Array(0);

// Each piece wraps on the stage extended by its diagonal (covers any rotation),
// so it reappears as soon as it has fully left the screen.
function measureWrap(bounds) {
  halfWidth = bounds.width / 2;
  halfHeight = bounds.height / 2;
  pieces.forEach((piece, i) => {
    const diagonal = Math.hypot(piece.width, piece.height);
    wrapWidths[i] = bounds.width + diagonal;
    wrapHeights[i] = bounds.height + diagonal;
  });
}

// How far `value` has entered the margin before `limit` (0 outside it, 1 at the limit, more beyond).
function intoMargin(value, limit, margin) {
  const depth = (value - (limit - margin)) / margin;
  return depth > 0 ? depth : 0;
}

/**
 * From the original motion algorithm: drift along `direction` and sine wobble on each axis. Noise
 * bends the heading and varies the speed so the path curves, and each piece swings back and forth
 * within the global amplitude. Near the edges pieces turn back inside (or, with softEdges off, wrap
 * to the opposite side), and a light pull bends their heading toward the center.
 * Its traits (start, direction, wobble...) are generated from the seed (../traits.js).
 * @type {MovementStrategy}
 */
export const baseline = {
  name: "baseline",
  defaults: {
    // Travel speed of a piece at speed 1, in px/s.
    moveSpeed: 55,
    // How far the noise bends the heading, in degrees either side of `direction`.
    curve: 158,
    // How fast the noise changes: higher = tighter, more frequent curves.
    curveFrequency: 0.08,
    // Speed variation from the noise: 0 = steady, 1 = from stopped to twice as fast.
    speedVariation: 0.02,
    // Multiplies the sine wobble of every piece.
    wobble: 4.5,
    // Pieces turn back before the edges instead of wrapping to the opposite side.
    softEdges: true,
    // Distance from the screen edge where pieces start turning back, in px.
    edgeMargin: 200,
    // How sharply they turn back.
    edgeTurn: 2,
    // How much headings bend toward the center: 0 = not at all.
    centerPull: 0.3,
  },
  ranges: {
    moveSpeed: [0, 200, 1],
    curve: [0, 180, 1],
    curveFrequency: [0, 0.5, 0.005],
    speedVariation: [0, 1, 0.01],
    wobble: [0, 5, 0.05],
    edgeMargin: [0, 500, 5],
    edgeTurn: [0, 10, 0.1],
    centerPull: [0, 2, 0.01],
  },
  descriptions: {
    moveSpeed: "Vitesse à laquelle les images traversent l'écran, en pixels par seconde.",
    curve: "Combien les trajectoires se courbent, en degrés de chaque côté de la direction de l'image. 0 = tout droit.",
    curveFrequency:
      "À quelle fréquence la trajectoire change de courbe. Plus haut = virages plus serrés et plus fréquents.",
    speedVariation: "Les images accélèrent et ralentissent. 0 = vitesse constante, 1 = de l'arrêt au double.",
    wobble: "Petite ondulation de chaque image autour de sa trajectoire. 0 = aucune, 1 = normale.",
    softEdges:
      "Coché : les images font demi-tour avant de sortir de l'écran, toutes restent visibles. Décoché : elles sortent et réapparaissent de l'autre côté.",
    edgeMargin: "Distance au bord de l'écran à partir de laquelle les images commencent à faire demi-tour, en pixels.",
    edgeTurn: "Vitesse à laquelle elles font demi-tour près des bords. Plus haut = virage plus serré.",
    centerPull:
      "Attire les trajectoires vers le centre de l'écran. 0 = aucune attraction, plus haut = plus d'images au centre.",
  },

  init(nextPieces, bounds, nextParams) {
    pieces = nextPieces;
    params = nextParams;
    noise = createNoise2D(createRandom(bounds.seed * 31337));
    times = new Float64Array(pieces.length);
    rotationPhases = new Float64Array(pieces.length);
    headings = new Float64Array(pieces.length);
    wrapWidths = new Float64Array(pieces.length);
    wrapHeights = new Float64Array(pieces.length);
    measureWrap(bounds);
    pieces.forEach((piece, i) => {
      rotationPhases[i] = piece.traits.rotationPhase;
      headings[i] = piece.traits.direction * DEG;
    });
    // Start positions spread over the visible screen.
    states = pieces.map((piece) => ({
      x: piece.traits.basePosition[0] * bounds.width,
      y: piece.traits.basePosition[1] * bounds.height,
      rotation: piece.rotationAmplitude * Math.sin(piece.traits.rotationPhase),
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
      const { amplitude, frequency, phase, noiseOffset } = piece.traits;

      // Advance from the current position so floating resumes smoothly after a selection.
      const pieceDt = dt * piece.activity;
      const previousTime = times[i];
      times[i] += pieceDt;
      const time = times[i];

      // Steering: turn the base heading toward the inside near the edges, and toward the center.
      let steerX = (-state.x / halfWidth) * params.centerPull;
      let steerY = (-state.y / halfHeight) * params.centerPull;
      if (params.softEdges && params.edgeMargin > 0) {
        steerX +=
          (intoMargin(-state.x, halfWidth, params.edgeMargin) - intoMargin(state.x, halfWidth, params.edgeMargin)) *
          params.edgeTurn;
        steerY +=
          (intoMargin(-state.y, halfHeight, params.edgeMargin) - intoMargin(state.y, halfHeight, params.edgeMargin)) *
          params.edgeTurn;
      }
      const steer = Math.hypot(steerX, steerY);
      if (steer > 0) {
        const turn = wrap(Math.atan2(steerY, steerX) - headings[i], Math.PI * 2);
        headings[i] += turn * (1 - Math.exp(-steer * pieceDt));
      }

      // Noise: the heading wanders around the base heading and the speed breathes.
      const noiseTime = time * params.curveFrequency;
      const angle = headings[i] + params.curve * DEG * noise(noiseTime, noiseOffset);
      const speedFactor = 1 + params.speedVariation * noise(noiseTime * 0.7, noiseOffset + 50);
      const distance = pieceDt * piece.speed * params.moveSpeed * speedFactor;

      // Independent waves on each axis.
      const angularFrequency = frequency * Math.PI * 2;
      const wobble = amplitude * params.wobble;
      const wobbleX =
        wobble * (Math.sin(time * angularFrequency + phase[0]) - Math.sin(previousTime * angularFrequency + phase[0]));
      const wobbleY =
        wobble *
        (Math.sin(time * angularFrequency * 0.83 + phase[1]) -
          Math.sin(previousTime * angularFrequency * 0.83 + phase[1]));

      state.x += Math.cos(angle) * distance + wobbleX;
      state.y += Math.sin(angle) * distance + wobbleY;
      if (!params.softEdges) {
        state.x = wrap(state.x, wrapWidths[i]);
        state.y = wrap(state.y, wrapHeights[i]);
      }

      // Swings between -amplitude and +amplitude, easing at each end. One swing at the mean
      // speed `rotationSpeed` takes 2 * amplitude / rotationSpeed seconds.
      const rotationAmplitude = piece.rotationAmplitude;
      if (rotationAmplitude > 0) {
        rotationPhases[i] += (pieceDt * Math.PI * piece.rotationSpeed) / (2 * rotationAmplitude);
      }
      state.rotation = rotationAmplitude * Math.sin(rotationPhases[i]);
    }
    return states;
  },

  // Overlay: the edge margin where pieces turn back.
  drawDebug(g) {
    if (!params.softEdges || params.edgeMargin <= 0) return;
    g.save();
    g.setLineDash([2, 8]);
    g.globalAlpha = 0.5;
    g.strokeRect(
      -halfWidth + params.edgeMargin,
      -halfHeight + params.edgeMargin,
      2 * (halfWidth - params.edgeMargin),
      2 * (halfHeight - params.edgeMargin),
    );
    g.restore();
  },
};
