// Every motion mode, picked by motionConfig.mode. To add a version: copy a mode file,
// register it here and give it a default params object in motionConfig.js.
//
// A mode is { label, controls, init(items, ctx, params), update(items, ctx, params), drawDebug? }.
// It only writes item.state.x / y (and optionally rotation or bank); the engine handles
// avoidance, rotation sway, transitions between modes and rendering.
import { drift } from "./drift";
import { flow } from "./flow";
import { swarm } from "./swarm";
import { paths } from "./paths";

export const MOTION_MODES = { drift, flow, swarm, paths };
