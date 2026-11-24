// Small math helpers shared by the movement variants. None of them allocates.

export const DEG = Math.PI / 180;

// Deterministic random generator (mulberry32): same seed, same sequence.
export function createRandom(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Wraps a value centered on 0 into [-size / 2, size / 2[.
export function wrap(value, size) {
  if (!size) return value;
  return ((((value + size / 2) % size) + size) % size) - size / 2;
}

export function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

// Frame-rate independent easing factor toward a target.
export function damp(rate, dt) {
  return 1 - Math.exp(-rate * dt);
}
