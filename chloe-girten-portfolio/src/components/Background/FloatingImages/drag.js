import { gsap } from "gsap";

// Drag feel of the floating pieces, Framer Motion style (dragElastic, dragMomentum, dragTransition).
// Values are tuned in the debug panel ("Drag" folder, see dragSettings in movement/runtime.js).

// Below this distance (px) and speed (px/s), a throw is at rest.
const REST_DISTANCE = 0.5;
const REST_SPEED = 10;
// Longest spring integration step, in seconds: keeps stiff springs stable.
const MAX_SPRING_STEP = 1 / 240;
// Pointer samples older than this (ms) don't count in the release velocity.
const VELOCITY_WINDOW = 100;

// Where a dragged value sits past [min, max]: `elastic` 0 = stops at the edge, 1 = follows the pointer.
export function applyElastic(value, min, max, elastic) {
  if (value < min) return min + (value - min) * elastic;
  if (value > max) return max + (value - max) * elastic;
  return value;
}

// Pointer velocity at release, in px/s, from the samples ({ t, x, y }) of the last VELOCITY_WINDOW ms.
export function releaseVelocity(samples, now) {
  const last = samples[samples.length - 1];
  if (!last || now - last.t > VELOCITY_WINDOW) return { x: 0, y: 0 };
  const first = samples.find((sample) => now - sample.t <= VELOCITY_WINDOW) ?? last;
  const seconds = (last.t - first.t) / 1000;
  if (seconds <= 0) return { x: 0, y: 0 };
  return { x: (last.x - first.x) / seconds, y: (last.y - first.y) / seconds };
}

// One axis of a throw: inertia decaying exponentially toward `position + power * velocity`,
// then a spring back to the edge when it starts or ends up outside [min, max].
function createAxis(position, velocity, min, max, options) {
  const timeConstant = Math.max(options.timeConstant, 1) / 1000;
  let x = position;
  let v = velocity;
  let spring = false;
  let bound = 0;
  let amplitude = 0;
  let target = 0;
  let elapsed = 0;
  let done = false;

  if (x < min || x > max) {
    spring = true;
    bound = x < min ? min : max;
  } else {
    amplitude = options.power * v;
    target = x + amplitude;
  }

  return {
    get x() {
      return x;
    },
    get done() {
      return done;
    },
    step(dt) {
      if (done) return;
      if (!spring) {
        elapsed += dt;
        const decay = Math.exp(-elapsed / timeConstant);
        x = target - amplitude * decay;
        v = (amplitude / timeConstant) * decay;
        if (x < min || x > max) {
          // Crossed an edge: the spring takes over, with the current speed.
          spring = true;
          bound = x < min ? min : max;
        } else if (Math.abs(amplitude * decay) < REST_DISTANCE) {
          x = target;
          done = true;
        }
        return;
      }
      const steps = Math.ceil(dt / MAX_SPRING_STEP);
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        const acceleration = -options.bounceStiffness * (x - bound) - options.bounceDamping * v;
        v += acceleration * h;
        x += v * h;
      }
      if (Math.abs(v) < REST_SPEED && Math.abs(x - bound) < REST_DISTANCE) {
        x = bound;
        done = true;
      }
    },
  };
}

/**
 * Animates a released piece: momentum, then bounce back inside the bounds.
 * @param {object} throwOptions
 * @param {number} throwOptions.x Release position, px from the stage center.
 * @param {number} throwOptions.y
 * @param {{ x: number, y: number }} throwOptions.velocity In px/s.
 * @param {{ minX: number, maxX: number, minY: number, maxY: number }} throwOptions.bounds
 * @param {{ power: number, timeConstant: number, bounceStiffness: number, bounceDamping: number }} throwOptions.options
 * @param {(x: number, y: number) => void} throwOptions.onUpdate
 * @param {() => void} throwOptions.onComplete
 * @returns {{ stop: () => void }} Stops the throw where it is (the piece is grabbed again).
 */
export function throwPiece({ x, y, velocity, bounds, options, onUpdate, onComplete }) {
  const axisX = createAxis(x, velocity.x, bounds.minX, bounds.maxX, options);
  const axisY = createAxis(y, velocity.y, bounds.minY, bounds.maxY, options);

  const tick = (_time, deltaTime) => {
    const dt = Math.min(deltaTime / 1000, 0.05);
    axisX.step(dt);
    axisY.step(dt);
    onUpdate(axisX.x, axisY.x);
    if (axisX.done && axisY.done) {
      gsap.ticker.remove(tick);
      onComplete();
    }
  };
  gsap.ticker.add(tick);

  return { stop: () => gsap.ticker.remove(tick) };
}
