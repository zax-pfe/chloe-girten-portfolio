import { DEG, noise2D, updateBank } from "../utils";

// Half size of the area piece centers stay in, from the stage center.
function getArea(ctx, params) {
  return { x: (ctx.width * params.area) / 2, y: (ctx.height * params.area) / 2 };
}

// V2, balanced swarm: each piece wanders (steering behaviour), pushes the others away
// and is held inside the screen. They spread over the whole screen and keep moving,
// without wrapping: no more empty center or pile-up.
export const swarm = {
  label: "Swarm (essaim équilibré)",
  controls: {
    cruiseSpeed: { min: 0, max: 150, step: 1 },
    maxSpeed: { min: 0, max: 300, step: 1 },
    wanderTurn: { min: 0, max: 360, step: 1 },
    wanderRate: { min: 0, max: 0.5, step: 0.005 },
    steer: { min: 0.05, max: 4, step: 0.05 },
    repulsion: { min: 0, max: 5, step: 0.05 },
    spacing: { min: 0.2, max: 2, step: 0.01 },
    area: { min: 0.3, max: 1.5, step: 0.01 },
    boundary: { min: 0, max: 4, step: 0.05 },
    gravity: { min: 0, max: 0.3, step: 0.005 },
    bank: { min: 0, max: 20, step: 0.1 },
  },

  init(items, ctx, params) {
    const area = getArea(ctx, params);
    items.forEach((item) => {
      const angle = item.config.direction * DEG;
      item.state = {
        // Wrapping modes can leave pieces far outside: bring them back to the area edge.
        x: Math.max(-area.x, Math.min(area.x, item.motion.x)),
        y: Math.max(-area.y, Math.min(area.y, item.motion.y)),
        vx: Math.cos(angle) * params.cruiseSpeed,
        vy: Math.sin(angle) * params.cruiseSpeed,
      };
    });
  },

  update(items, ctx, params) {
    const area = getArea(ctx, params);
    // Distance pieces would have if spread evenly over the area.
    const evenSpacing = Math.sqrt((area.x * 2 * area.y * 2) / Math.max(items.length, 1));
    const range = evenSpacing * params.spacing;

    // Forces from the positions at the start of the frame, then integration.
    const forces = items.map((item) => {
      const { state, config, index, motion } = item;
      if (!item.dt) return null;

      // Wander: desired heading drifts slowly around the piece's own direction.
      const heading = config.direction * DEG + noise2D(index * 13.1, motion.time * params.wanderRate) * params.wanderTurn * DEG;
      let ax = (Math.cos(heading) * params.cruiseSpeed - state.vx) * params.steer;
      let ay = (Math.sin(heading) * params.cruiseSpeed - state.vy) * params.steer;

      // Repulsion, stronger as pieces get closer; never less than their sizes.
      items.forEach((other) => {
        if (other === item) return;
        const dx = state.x - other.state.x;
        const dy = state.y - other.state.y;
        const distance = Math.hypot(dx, dy) || 0.01;
        const reach = Math.max(range, (item.radius + other.radius) * 0.9);
        if (distance >= reach) return;
        const push = (1 - distance / reach) ** 2 * params.repulsion * params.cruiseSpeed * 4;
        ax += (dx / distance) * push;
        ay += (dy / distance) * push;
      });

      // Gentle pull toward the center, balancing the repulsion that would push everyone to the edges.
      ax -= state.x * params.gravity;
      ay -= state.y * params.gravity;

      // Soft walls: a spring pulls back what goes past the area edges.
      const overX = Math.abs(state.x) - area.x;
      const overY = Math.abs(state.y) - area.y;
      if (overX > 0) ax -= Math.sign(state.x) * overX * params.boundary;
      if (overY > 0) ay -= Math.sign(state.y) * overY * params.boundary;

      return { ax, ay };
    });

    items.forEach((item, i) => {
      const force = forces[i];
      if (!force) return;
      const { state } = item;
      state.vx += force.ax * item.dt;
      state.vy += force.ay * item.dt;
      const speed = Math.hypot(state.vx, state.vy);
      if (speed > params.maxSpeed) {
        state.vx *= params.maxSpeed / speed;
        state.vy *= params.maxSpeed / speed;
      }
      state.x += state.vx * item.dt;
      state.y += state.vy * item.dt;
      updateBank(state, Math.atan2(state.vy, state.vx), item.dt, params.bank);
    });
  },

  drawDebug(g, items, ctx, params) {
    const area = getArea(ctx, params);
    g.strokeRect(-area.x, -area.y, area.x * 2, area.y * 2);
  },
};
