import { clearDebugValues, loadDebugValues, saveDebugValues } from "@/utils/debug";
import { MOTION_MODES } from "./modes";
import { MOTION_DEFAULTS, motionConfig } from "./motionConfig";
import { requestReinit, setDebugCanvas } from "./engine";

const STORAGE_KEY = "floating-motion";

// Copies `source` into `target`, only for keys the defaults know (old saved keys are ignored).
function assign(target, source, shape = MOTION_DEFAULTS) {
  if (!source) return;
  Object.keys(shape).forEach((key) => {
    if (!(key in source)) return;
    if (shape[key] && typeof shape[key] === "object") assign(target[key], source[key], shape[key]);
    else target[key] = source[key];
  });
}

// Same shape as motionConfig.js, ready to paste there.
function toSource(config) {
  return `export const MOTION_DEFAULTS = ${JSON.stringify(config, null, 2).replace(/"(\w+)":/g, "$1:")};`;
}

function addControls(folder, object, controls) {
  Object.entries(controls).forEach(([key, { min, max, step, reinit }]) => {
    const controller = min === undefined ? folder.add(object, key) : folder.add(object, key, min, max, step);
    if (reinit) controller.onFinishChange(requestReinit);
  });
}

// Floating images folder of the debug panel. Returns its cleanup.
export function setupMotionDebug(gui, stage) {
  assign(motionConfig, loadDebugValues(STORAGE_KEY));

  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: 20 });
  stage.appendChild(canvas);
  setDebugCanvas(canvas);

  const folder = gui.addFolder("Floating images");
  const modeOptions = Object.fromEntries(Object.entries(MOTION_MODES).map(([key, mode]) => [mode.label, key]));

  const modeFolders = {};
  const showActiveMode = () =>
    Object.entries(modeFolders).forEach(([key, modeFolder]) => modeFolder.show(key === motionConfig.mode));

  folder.add(motionConfig, "mode", modeOptions).onChange(showActiveMode);
  folder.add(motionConfig, "timeScale", 0, 5, 0.05);
  folder.add(motionConfig, "transition", 0, 5, 0.05);
  folder.add(motionConfig, "overlay");

  const rotation = folder.addFolder("Rotation");
  rotation.add(motionConfig.rotation, "amplitude", 0, 30, 0.1);
  rotation.add(motionConfig.rotation, "frequency", 0, 0.5, 0.005);

  const avoidance = folder.addFolder("Avoidance");
  avoidance.add(motionConfig.avoidance, "enabled");
  avoidance.add(motionConfig.avoidance, "strength", 0, 1.5, 0.01);
  avoidance.add(motionConfig.avoidance, "range", 0, 2, 0.01);
  avoidance.add(motionConfig.avoidance, "smoothing", 0.1, 10, 0.1);

  Object.entries(MOTION_MODES).forEach(([key, mode]) => {
    modeFolders[key] = folder.addFolder(mode.label);
    addControls(modeFolders[key], motionConfig[key], mode.controls);
  });
  showActiveMode();

  const actions = {
    "Copier la config": () => navigator.clipboard?.writeText(toSource(motionConfig)),
    "Reset": () => {
      assign(motionConfig, structuredClone(MOTION_DEFAULTS));
      clearDebugValues(STORAGE_KEY);
      folder.controllersRecursive().forEach((controller) => controller.updateDisplay());
      showActiveMode();
      requestReinit();
    },
  };
  folder.add(actions, "Copier la config");
  folder.add(actions, "Reset");

  folder.onChange(() => saveDebugValues(STORAGE_KEY, motionConfig));

  return () => {
    folder.destroy();
    setDebugCanvas(null);
    canvas.remove();
  };
}
