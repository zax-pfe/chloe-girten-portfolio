import { noise2D } from "../utils";

const SAMPLES_PER_POINT = 24;

// Point of a closed Catmull-Rom curve through `points`, between point i and i + 1.
function catmullRom(points, i, t) {
  const n = points.length;
  const p0 = points[(i - 1 + n) % n];
  const p1 = points[i];
  const p2 = points[(i + 1) % n];
  const p3 = points[(i + 2) % n];
  const t2 = t * t;
  const t3 = t2 * t;
  const blend = (a, b, c, d) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return { x: blend(p0.x, p1.x, p2.x, p3.x), y: blend(p0.y, p1.y, p2.y, p3.y) };
}

// Loop k: a noisy ellipse, whose shape slowly changes over time.
function buildLoop(k, ctx, params) {
  const loops = Math.round(params.loops);
  const centerAngle = (k / loops) * Math.PI * 2;
  const offset = loops > 1 ? params.spread : 0;
  const center = { x: Math.cos(centerAngle) * offset * ctx.width / 2, y: Math.sin(centerAngle) * offset * ctx.height / 2 };
  // Several loops share the screen: smaller radii.
  const size = params.radius / Math.sqrt(loops);
  const morphTime = ctx.time * params.morph;
  const count = Math.max(3, Math.round(params.points));

  const points = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const r = 1 + params.irregularity * noise2D(k * 10.7 + i * 1.73, morphTime);
    return {
      x: center.x + Math.cos(angle) * r * size * ctx.width / 2,
      y: center.y + Math.sin(angle) * r * size * ctx.height / 2,
    };
  });

  // Samples with their cumulated length, to move at constant speed along the curve.
  const samples = [];
  let length = 0;
  let previous = null;
  for (let i = 0; i < count; i++) {
    for (let s = 0; s < SAMPLES_PER_POINT; s++) {
      const point = catmullRom(points, i, s / SAMPLES_PER_POINT);
      if (previous) length += Math.hypot(point.x - previous.x, point.y - previous.y);
      samples.push({ ...point, length });
      previous = point;
    }
  }
  length += Math.hypot(samples[0].x - previous.x, samples[0].y - previous.y);
  return { points, samples, length };
}

// Point at `progress` (0 to 1) of the loop's length, with the curve's normal.
function pointAt(loop, progress) {
  const target = (((progress % 1) + 1) % 1) * loop.length;
  const { samples } = loop;
  let low = 0;
  let high = samples.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (samples[mid].length <= target) low = mid;
    else high = mid - 1;
  }
  const a = samples[low];
  const b = samples[(low + 1) % samples.length];
  const segment = (low + 1 < samples.length ? b.length : loop.length) - a.length || 1;
  const t = (target - a.length) / segment;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const norm = Math.hypot(dx, dy) || 1;
  return { x: a.x + dx * t, y: a.y + dy * t, nx: -dy / norm, ny: dx / norm };
}

// Loop of each piece, and its slot on it: pieces spread evenly over the loops.
function getSlots(items, loops) {
  const counts = Array(loops).fill(0);
  return items.map((_, i) => {
    const loop = i % loops;
    return { loop, slot: counts[loop]++ };
  });
}

let progress = [];
let builtLoops = [];

function place(items, ctx, params) {
  const loops = Math.max(1, Math.round(params.loops));
  builtLoops = Array.from({ length: loops }, (_, k) => buildLoop(k, ctx, params));
  const slots = getSlots(items, loops);
  const perLoop = slots.reduce((acc, { loop }) => ((acc[loop] = (acc[loop] ?? 0) + 1), acc), []);
  const unit = Math.min(ctx.width, ctx.height);

  items.forEach((item, i) => {
    if (item.motion.selected) return;
    const { loop, slot } = slots[i];
    const jitter = noise2D(item.index * 7.9, ctx.time * 0.05) * params.spacingJitter;
    const point = pointAt(builtLoops[loop], progress[loop] + (slot + jitter * 0.5) / perLoop[loop]);
    // Slight drift off the path, so pieces don't look like they're on rails.
    const side = noise2D(item.index * 5.3, ctx.time * params.driftRate) * params.drift * unit;
    const along = noise2D(item.index * 2.1 + 40, ctx.time * params.driftRate) * params.drift * unit;
    item.state.x = point.x + point.nx * side + point.ny * along;
    item.state.y = point.y + point.ny * side - point.nx * along;
  });
}

// V3, paths: pieces evenly spaced along closed loops that slowly change shape.
// Spacing is guaranteed by construction: no pile-up, always pieces on screen.
export const paths = {
  label: "Paths (chemins)",
  controls: {
    loops: { min: 1, max: 4, step: 1, reinit: true },
    alternate: {},
    points: { min: 3, max: 12, step: 1 },
    radius: { min: 0.1, max: 1.5, step: 0.01 },
    spread: { min: 0, max: 1, step: 0.01 },
    irregularity: { min: 0, max: 0.8, step: 0.01 },
    morph: { min: 0, max: 0.3, step: 0.005 },
    speed: { min: 0, max: 150, step: 1 },
    spacingJitter: { min: 0, max: 1, step: 0.01 },
    drift: { min: 0, max: 0.3, step: 0.005 },
    driftRate: { min: 0, max: 0.5, step: 0.005 },
  },

  init(items, ctx, params) {
    progress = Array(Math.max(1, Math.round(params.loops))).fill(0);
    items.forEach((item) => {
      item.state = { x: 0, y: 0 };
    });
    place(items, ctx, params);
  },

  update(items, ctx, params) {
    // Loops move with the global time: the selected piece is frozen, but so is everything else.
    progress = progress.map((value, k) => {
      const loop = builtLoops[k];
      const direction = params.alternate && k % 2 ? -1 : 1;
      return loop ? value + (direction * params.speed * ctx.delta) / loop.length : value;
    });
    place(items, ctx, params);
  },

  drawDebug(g) {
    builtLoops.forEach((loop) => {
      g.beginPath();
      loop.samples.forEach(({ x, y }, i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.stroke();
      loop.points.forEach(({ x, y }) => g.fillRect(x - 3, y - 3, 6, 6));
    });
  },
};
