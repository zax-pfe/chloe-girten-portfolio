import { settings } from "../runtime";

const COLOR = "rgba(255, 0, 80, 0.85)";
// Length of the speed vector: where the piece will be in this many seconds.
const VELOCITY_SCALE = 1;

// Canvas over the stage: radius, anchor (generated start position) and speed of each piece, plus the variant's own drawing.
export function createOverlay(runtime, stage) {
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "20",
  });
  stage.appendChild(canvas);
  const g = canvas.getContext("2d");
  let previous = new Float64Array(0);
  let wasDrawn = false;

  runtime.onFrame = (states, dt) => {
    const { width, height } = runtime.bounds;
    if (!settings.overlay) {
      if (wasDrawn) g.clearRect(0, 0, canvas.width, canvas.height);
      wasDrawn = false;
      return;
    }
    wasDrawn = true;

    const ratio = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    if (previous.length !== states.length * 2) previous = new Float64Array(states.length * 2);

    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.setTransform(ratio, 0, 0, ratio, (width * ratio) / 2, (height * ratio) / 2);
    g.strokeStyle = COLOR;
    g.fillStyle = COLOR;
    g.lineWidth = 1.5;

    runtime.strategy?.drawDebug?.(g);

    runtime.pieces.forEach((piece, i) => {
      const { x, y } = states[i];

      // Radius.
      g.setLineDash([4, 6]);
      g.beginPath();
      g.arc(x, y, piece.radius * states[i].scale, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);

      // Anchor, linked to the piece.
      const ax = piece.traits.basePosition[0] * width;
      const ay = piece.traits.basePosition[1] * height;
      g.beginPath();
      g.moveTo(ax - 6, ay - 6);
      g.lineTo(ax + 6, ay + 6);
      g.moveTo(ax + 6, ay - 6);
      g.lineTo(ax - 6, ay + 6);
      g.stroke();
      g.globalAlpha = 0.25;
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(x, y);
      g.stroke();
      g.globalAlpha = 1;

      // Speed vector (skipped on wraps, where the position jumps).
      const dx = x - previous[i * 2];
      const dy = y - previous[i * 2 + 1];
      if (dt > 0 && Math.hypot(dx, dy) < 100) {
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + (dx / dt) * VELOCITY_SCALE, y + (dy / dt) * VELOCITY_SCALE);
        g.lineWidth = 3;
        g.stroke();
        g.lineWidth = 1.5;
      }
      previous[i * 2] = x;
      previous[i * 2 + 1] = y;

      g.beginPath();
      g.arc(x, y, 4, 0, Math.PI * 2);
      g.fill();
    });
  };

  return () => {
    runtime.onFrame = null;
    canvas.remove();
  };
}
