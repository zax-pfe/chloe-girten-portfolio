// Pieces push each other away when they get close ("avoid" in the debug panel).
// Works on any variant that moves its pieces from their current state (baseline does):
// the push is written into the states, so the variant carries on from there.

// Pieces start pushing once closer than their radii added up, times this (a bit of air around them).
const RANGE = 1.3;
// Push speed at full overlap with repulsion 1, in px/s.
const PUSH_SPEED = 400;

// How much of the piece is on screen: 0 fully out, 1 fully in. A piece is only pushed that much,
// so it can never be pushed off screen, across the wrap, and back again (ping-pong at the edges).
function visibility(state, radius, bounds) {
  const insideX = (bounds.width / 2 + radius - Math.abs(state.x)) / (2 * radius);
  const insideY = (bounds.height / 2 + radius - Math.abs(state.y)) / (2 * radius);
  const inside = insideX < insideY ? insideX : insideY;
  return inside < 0 ? 0 : inside > 1 ? 1 : inside;
}

/**
 * @param {import("./types").Piece[]} pieces
 * @param {import("./types").PieceState[]} states Mutated in place.
 * @param {import("./types").Bounds} bounds
 * @param {number} dt
 * @param {number} repulsion Strength, 0 = off.
 */
export function applyAvoidance(pieces, states, bounds, dt, repulsion) {
  if (dt <= 0 || repulsion <= 0) return;
  for (let i = 0; i < pieces.length; i++) {
    const a = pieces[i];
    if (a.held) continue;
    for (let j = i + 1; j < pieces.length; j++) {
      const b = pieces[j];
      if (b.held) continue;
      const stateA = states[i];
      const stateB = states[j];
      const radiusA = a.radius * stateA.scale;
      const radiusB = b.radius * stateB.scale;
      const range = (radiusA + radiusB) * RANGE;
      let dx = stateB.x - stateA.x;
      let dy = stateB.y - stateA.y;
      const distance = Math.hypot(dx, dy);
      if (distance >= range) continue;
      // Exactly on top of each other: split along an arbitrary but stable axis.
      if (distance < 0.001) {
        dx = Math.cos(i + j);
        dy = Math.sin(i + j);
      } else {
        dx /= distance;
        dy /= distance;
      }
      // Stronger the more they overlap; each piece takes half the push,
      // less while it slows for a selection or is partly off screen.
      const overlap = 1 - distance / range;
      const push = overlap * repulsion * PUSH_SPEED * dt * 0.5;
      const pushA = push * a.activity * visibility(stateA, radiusA, bounds);
      const pushB = push * b.activity * visibility(stateB, radiusB, bounds);
      stateA.x -= dx * pushA;
      stateA.y -= dy * pushA;
      stateB.x += dx * pushB;
      stateB.y += dy * pushB;
    }
  }
}
