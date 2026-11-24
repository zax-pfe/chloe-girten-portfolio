import { createRandom } from "./utils";

// Ranges the generated traits are picked in.
const ROTATION_MAX = 25; // degrees, either side
const AMPLITUDE = [8, 20]; // px, wobble size
const FREQUENCY = [0.06, 0.15]; // Hz, wobble speed
// Screen ratio of the start grid (width / height): one cell per piece.
const GRID_RATIO = 16 / 9;

function between([min, max], random) {
  return min + (max - min) * random();
}

/**
 * Gives every piece its motion traits, from the global seed: same seed, same composition.
 * Start positions come from a shuffled, jittered grid, so pieces start spread over the
 * screen instead of piling up. Mutates `piece.traits` (allocated once in createPiece).
 * @param {import("./types").Piece[]} pieces
 * @param {number} seed
 */
export function generateTraits(pieces, seed) {
  const count = pieces.length;
  const columns = Math.max(1, Math.ceil(Math.sqrt(count * GRID_RATIO)));
  const rows = Math.max(1, Math.ceil(count / columns));

  // Cells shuffled with the global seed (Fisher-Yates), one per piece.
  const shuffle = createRandom(seed * 7919);
  const cells = Array.from({ length: columns * rows }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(shuffle() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  pieces.forEach((piece, i) => {
    const random = createRandom(seed * 104729 + piece.seed * 7907);
    const { traits } = piece;
    const cell = cells[i];
    // Somewhere in the middle 60% of its cell, as a ratio from the center (-0.5 to 0.5).
    traits.basePosition[0] = ((cell % columns) + 0.2 + 0.6 * random()) / columns - 0.5;
    traits.basePosition[1] = (Math.floor(cell / columns) + 0.2 + 0.6 * random()) / rows - 0.5;
    traits.rotation = (random() * 2 - 1) * ROTATION_MAX;
    traits.spin = random() < 0.5 ? -1 : 1;
    traits.direction = random() * 360;
    traits.amplitude = between(AMPLITUDE, random);
    traits.frequency = between(FREQUENCY, random);
    traits.phase[0] = random() * Math.PI * 2;
    traits.phase[1] = random() * Math.PI * 2;
    traits.z = random();
  });
}
