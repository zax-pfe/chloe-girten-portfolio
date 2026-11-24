import { createNoise2D, createNoise3D } from "simplex-noise";

// Seeded, so the motion is the same on every visit.
function seededRandom(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth random values between -1 and 1.
export const noise2D = createNoise2D(seededRandom(7));
export const noise3D = createNoise3D(seededRandom(13));

export const DEG = Math.PI / 180;

// Wraps a value centered on 0 into [-size / 2, size / 2[.
export function wrap(value, size) {
  if (!size) return value;
  return ((((value + size / 2) % size) + size) % size) - size / 2;
}

// Shortest signed difference between two angles, in radians.
export function angleDelta(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

// Frame-rate independent easing factor toward a target.
export function damp(rate, dt) {
  return 1 - Math.exp(-rate * dt);
}

// Lean into turns: rotation (degrees) from the heading's angular speed, smoothed.
export function updateBank(state, heading, dt, amount) {
  if (!dt) return;
  const angularSpeed = angleDelta(state.lastHeading ?? heading, heading) / dt;
  state.lastHeading = heading;
  const target = Math.max(-30, Math.min(30, angularSpeed * amount * 10));
  state.bank = (state.bank ?? 0) + (target - (state.bank ?? 0)) * damp(3, dt);
}
