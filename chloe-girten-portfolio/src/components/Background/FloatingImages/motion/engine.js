import { gsap } from "gsap";
import { MOTION_MODES } from "./modes";
import { motionConfig } from "./motionConfig";
import { damp, noise2D } from "./utils";

let activeMode = null;
let reinitRequested = false;
let time = 0;
let debugCanvas = null;

// Restarts the active mode (with a smooth transition), e.g. when a structural param changes.
export function requestReinit() {
  reinitRequested = true;
}

export function setDebugCanvas(canvas) {
  debugCanvas = canvas;
}

// Active mode key, back to drift if the config names an unknown one.
function getModeKey() {
  return MOTION_MODES[motionConfig.mode] ? motionConfig.mode : "drift";
}

// Starts a mode from where the pieces are: the gap to its own positions fades out.
function activate(mode, items, ctx, withTransition) {
  items.forEach((item) => {
    item.motion.avoid ??= { x: 0, y: 0 };
    item.motion.blend ??= { x: 0, y: 0 };
  });
  mode.init(items, ctx, motionConfig[getModeKey()]);
  items.forEach((item) => {
    const { motion, state } = item;
    motion.state = state;
    motion.blend = withTransition
      ? { x: motion.x - state.x - motion.avoid.x, y: motion.y - state.y - motion.avoid.y }
      : { x: 0, y: 0 };
    // The rotation gap is only known once the new mode has computed its first frame.
    motion.rotationBlend = withTransition ? null : 0;
  });
  activeMode = mode;
  reinitRequested = false;
}

// Overlapping pieces push each other away. Offset from the mode's positions, eased,
// so it never fights the mode itself.
function updateAvoidance(items, delta) {
  const { enabled, strength, range, smoothing } = motionConfig.avoidance;
  const targets = items.map(() => ({ x: 0, y: 0 }));

  if (enabled) {
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        const dx = a.state.x - b.state.x;
        const dy = a.state.y - b.state.y;
        const distance = Math.hypot(dx, dy) || 0.01;
        const reach = (a.radius + b.radius) * range;
        if (distance >= reach) continue;
        const push = ((reach - distance) * strength) / 2;
        targets[i].x += (dx / distance) * push;
        targets[i].y += (dy / distance) * push;
        targets[j].x -= (dx / distance) * push;
        targets[j].y -= (dy / distance) * push;
      }
    }
  }

  items.forEach((item, i) => {
    if (item.motion.selected) return;
    const { avoid } = item.motion;
    const factor = damp(smoothing, delta);
    avoid.x += (targets[i].x - avoid.x) * factor;
    avoid.y += (targets[i].y - avoid.y) * factor;
  });
}

function drawDebug(items, ctx) {
  const canvas = debugCanvas;
  if (!canvas) return;
  const g = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  if (canvas.width !== ctx.width * ratio || canvas.height !== ctx.height * ratio) {
    canvas.width = ctx.width * ratio;
    canvas.height = ctx.height * ratio;
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, canvas.width, canvas.height);
  if (!motionConfig.overlay) return;

  g.setTransform(ratio, 0, 0, ratio, (ctx.width * ratio) / 2, (ctx.height * ratio) / 2);
  g.strokeStyle = "rgba(255, 0, 80, 0.7)";
  g.fillStyle = "rgba(255, 0, 80, 0.9)";
  g.lineWidth = 1.5;
  activeMode.drawDebug?.(g, items, ctx, motionConfig[getModeKey()]);

  items.forEach((item) => {
    g.beginPath();
    g.arc(item.motion.x, item.motion.y, 5, 0, Math.PI * 2);
    g.fill();
    // Size used by the avoidance.
    g.beginPath();
    g.arc(item.motion.x, item.motion.y, item.radius, 0, Math.PI * 2);
    g.setLineDash([4, 6]);
    g.stroke();
    g.setLineDash([]);
  });
}

// One frame. `delta` is in seconds, already slowed down by the selection.
export function stepMotion(allItems, delta, stage) {
  const items = allItems.filter(Boolean);
  if (!items.length) return;

  const scaledDelta = Math.min(delta, 0.1) * motionConfig.timeScale;
  time += scaledDelta;
  const ctx = { width: stage.width, height: stage.height, delta: scaledDelta, time, config: motionConfig };

  // State lives on `motion`, which survives re-renders.
  items.forEach((item) => {
    item.state = item.motion.state;
    item.dt = item.motion.selected ? 0 : scaledDelta * item.motion.speed;
    item.motion.time += item.dt;
  });

  const modeKey = getModeKey();
  const mode = MOTION_MODES[modeKey];
  const fresh = items.some((item) => !item.state);
  if (fresh || mode !== activeMode || reinitRequested) activate(mode, items, ctx, !fresh);

  mode.update(items, ctx, motionConfig[modeKey]);
  updateAvoidance(items, scaledDelta);

  const { amplitude, frequency } = motionConfig.rotation;
  const blendFactor = 1 - damp(4 / Math.max(motionConfig.transition, 0.01), scaledDelta);

  items.forEach((item) => {
    const { motion, state, config, index, element } = item;
    if (motion.selected) return;

    motion.blend.x *= blendFactor;
    motion.blend.y *= blendFactor;
    motion.x = state.x + motion.avoid.x + motion.blend.x;
    motion.y = state.y + motion.avoid.y + motion.blend.y;
    const rotation =
      state.rotation ??
      config.rotation + amplitude * noise2D(index * 3.1 + 100, motion.time * frequency) + (state.bank ?? 0);
    motion.rotationBlend ??= motion.rotation - rotation;
    motion.rotationBlend *= blendFactor;
    motion.rotation = rotation + motion.rotationBlend;

    gsap.set(element, { x: motion.x, y: motion.y, rotation: motion.rotation });
  });

  drawDebug(items, ctx);
}
