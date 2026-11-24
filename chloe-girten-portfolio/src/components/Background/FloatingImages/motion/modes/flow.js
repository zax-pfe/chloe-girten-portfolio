import { DEG, angleDelta, damp, noise3D, updateBank, wrap } from "../utils";

// V1, flow field: a slowly evolving noise bends each piece's heading,
// so trajectories curve and meander. Wraps around the screen like drift.
export const flow = {
  label: "Flow (champ de bruit)",
  controls: {
    speed: { min: 0, max: 8, step: 0.1 },
    speedVariation: { min: 0, max: 1, step: 0.01 },
    wind: { min: 0, max: 1, step: 0.01 },
    windDirection: { min: 0, max: 360, step: 1 },
    turn: { min: 0, max: 180, step: 1 },
    fieldScale: { min: 0, max: 5, step: 0.05 },
    evolution: { min: 0, max: 0.3, step: 0.005 },
    individuality: { min: 0, max: 2, step: 0.01 },
    inertia: { min: 0.1, max: 5, step: 0.05 },
    bank: { min: 0, max: 20, step: 0.1 },
  },

  init(items) {
    items.forEach((item) => {
      item.state = { x: item.motion.x, y: item.motion.y, heading: item.config.direction * DEG };
    });
  },

  update(items, ctx, params) {
    // Noise coordinates relative to the screen, so the look doesn't change with its size.
    const scale = params.fieldScale / Math.hypot(ctx.width, ctx.height);
    const windAngle = params.windDirection * DEG;

    items.forEach((item) => {
      if (!item.dt) return;
      const { state, config, index, motion } = item;
      const time = motion.time * params.evolution;
      const seed = index * params.individuality * 3.7;

      // Own direction pulled toward the shared wind, then bent by the field.
      const ownAngle = config.direction * DEG;
      const baseHeading = ownAngle + angleDelta(ownAngle, windAngle) * params.wind;
      const bend = noise3D(state.x * scale, state.y * scale, time + seed) * params.turn * DEG;
      // Inertia: the heading follows the field with a delay, for softer turns.
      state.heading += angleDelta(state.heading, baseHeading + bend) * damp(params.inertia, item.dt);

      const speedNoise = noise3D(index * 11.3, 0, motion.time * 0.12);
      const speed = config.speed * params.speed * (1 + params.speedVariation * speedNoise);
      state.x = wrap(state.x + Math.cos(state.heading) * speed * item.dt, item.bounds.width);
      state.y = wrap(state.y + Math.sin(state.heading) * speed * item.dt, item.bounds.height);

      updateBank(state, state.heading, item.dt, params.bank);
    });
  },
};
