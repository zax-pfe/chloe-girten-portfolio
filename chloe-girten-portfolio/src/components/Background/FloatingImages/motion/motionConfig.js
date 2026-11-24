// Every tunable value of the floating images motion, in one place.
// "Copier la config" in the debug panel (#debug) gives an object to paste here.
// Distances are in px, speeds in px/s, angles in degrees, times in seconds.
export const MOTION_DEFAULTS = {
  // Active mode: "drift" | "flow" | "swarm" | "paths" (see ./modes).
  mode: "drift",
  // Multiplies time: 0 pauses, 2 plays twice as fast. For tuning only, keep 1.
  timeScale: 1,
  // Time to blend from one mode to another when switching live.
  transition: 1.5,
  // Draws paths, areas and piece centers over the stage (debug mode only).
  overlay: false,

  // Slow sway around each piece's base rotation (every mode but drift).
  rotation: { amplitude: 4, frequency: 0.06 },

  // Pieces gently push each other away when they overlap, on top of any mode.
  avoidance: { enabled: false, strength: 0.5, range: 0.9, smoothing: 1.5 },

  // Current motion: straight line + sine wobble, wraps around the screen.
  drift: { speed: 3, wobble: 1 },

  // Each piece's heading is bent by a noise field: curved, meandering trajectories.
  flow: {
    speed: 2.5,
    speedVariation: 0.4,
    // Pull of every piece toward the same wind direction (0 = own direction, 1 = all together).
    wind: 0.6,
    windDirection: 20,
    turn: 70,
    fieldScale: 1.2,
    evolution: 0.05,
    individuality: 0.5,
    inertia: 1.5,
    bank: 6,
  },

  // Wander + repulsion, kept inside the screen: pieces spread evenly and never all leave the center.
  swarm: {
    cruiseSpeed: 30,
    maxSpeed: 60,
    wanderTurn: 140,
    wanderRate: 0.08,
    steer: 0.8,
    repulsion: 1.2,
    spacing: 1,
    area: 1,
    boundary: 0.6,
    gravity: 0.06,
    bank: 6,
  },

  // Pieces evenly spaced along closed loops that slowly change shape.
  paths: {
    loops: 2,
    alternate: true,
    points: 7,
    radius: 0.7,
    spread: 0.45,
    irregularity: 0.3,
    morph: 0.04,
    speed: 25,
    spacingJitter: 0.25,
    drift: 0.06,
    driftRate: 0.08,
  },
};

// Live values: read every frame, edited by the debug panel.
export const motionConfig = structuredClone(MOTION_DEFAULTS);
