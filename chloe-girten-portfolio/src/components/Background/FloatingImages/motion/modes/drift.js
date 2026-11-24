import { DEG, wrap } from "../utils";

// V0, the current motion: straight line along `direction` + sine wobble, wraps around the screen.
export const drift = {
  label: "Drift (actuel)",
  controls: {
    speed: { min: 0, max: 10, step: 0.1 },
    wobble: { min: 0, max: 4, step: 0.05 },
  },

  init(items) {
    items.forEach((item) => {
      item.state = { x: item.motion.x, y: item.motion.y, rotation: item.config.rotation };
    });
  },

  update(items, ctx, params) {
    items.forEach((item) => {
      if (!item.dt) return;
      const { state, config } = item;
      const { direction, speed, amplitude, frequency, phase, rotation } = config;
      const angle = direction * DEG;
      const angularFrequency = frequency * Math.PI * 2;
      const time = item.motion.time;
      const previousTime = time - item.dt;
      const distance = item.dt * speed * params.speed;
      const wave = (t, factor, offset) => Math.sin(t * angularFrequency * factor + offset);

      const wobbleX = params.wobble * amplitude * (wave(time, 1, phase[0]) - wave(previousTime, 1, phase[0]));
      const wobbleY = params.wobble * amplitude * (wave(time, 0.83, phase[1]) - wave(previousTime, 0.83, phase[1]));

      state.x = wrap(state.x + Math.cos(angle) * distance + wobbleX, item.bounds.width);
      state.y = wrap(state.y + Math.sin(angle) * distance + wobbleY, item.bounds.height);
      state.rotation =
        rotation + ctx.config.rotation.amplitude * (wave(time, 0.6, phase[0]) - Math.sin(phase[0]));
    });
  },
};
