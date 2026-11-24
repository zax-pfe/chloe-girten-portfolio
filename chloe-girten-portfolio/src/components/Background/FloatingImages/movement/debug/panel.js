import GUI from "lil-gui";
import { MOVEMENTS, STORAGE_KEY } from "../index";
import { GLOBAL_DEFAULTS, getVariantParams, resetVariantParams, settings } from "../runtime";
import { createOverlay } from "./overlay";

// Development-only tuning panel. Loaded dynamically by FloatingImages.
// Shortcuts: D panel, P pause, 1-5 variants, R reseed.
export function createMovementPanel(runtime, stage) {
  const names = Object.keys(MOVEMENTS);
  const gui = new GUI({ title: "Floating movement" });
  const destroyOverlay = createOverlay(runtime, stage);

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gui.save()));
    } catch {
      // Storage unavailable: the values just won't persist.
    }
  };

  // ______________________ VARIANT ______________________//

  const variantController = gui.add(settings, "variant", names).onChange((name) => switchVariant(name));

  // ______________________ GLOBAL ______________________//

  const global = gui.addFolder("Global");
  global.add(settings, "speedMultiplier", 0, 5, 0.05);
  global.add(settings, "paused");
  const seedController = global.add(settings, "seed", 1, 9999, 1).onFinishChange(() => runtime.reseed(settings.seed));
  global.add(
    {
      Reseed: () => {
        runtime.reseed();
        seedController.updateDisplay();
        save();
      },
    },
    "Reseed",
  );
  global.add(settings, "overlay");
  global.add(settings, "fps").decimals(0).listen().disable();

  // ______________________ PRESETS ______________________//

  const presets = gui.addFolder("Presets");
  presets.add(
    { Copy: () => navigator.clipboard?.writeText(JSON.stringify(gui.save(), null, 2)) },
    "Copy",
  );
  presets.add(
    {
      Load: () => {
        const text = window.prompt("Preset JSON (from Copy)");
        if (!text) return;
        try {
          const preset = JSON.parse(text);
          switchVariant(preset.controllers?.variant ?? settings.variant);
          gui.load(preset);
          runtime.setVariant(settings.variant);
          save();
        } catch (error) {
          console.error("Invalid preset", error);
        }
      },
    },
    "Load",
  );
  presets.add(
    {
      Reset: () => {
        Object.assign(settings, GLOBAL_DEFAULTS);
        resetVariantParams(settings.variant);
        gui.controllersRecursive().forEach((controller) => controller.updateDisplay());
        runtime.setVariant(settings.variant);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Nothing stored.
        }
      },
    },
    "Reset",
  );

  // ______________________ VARIANT PARAMS ______________________//

  // One folder, rebuilt from the active variant's defaults.
  let variantFolder = null;
  function buildVariantFolder() {
    variantFolder?.destroy();
    const name = settings.variant;
    const params = getVariantParams(name);
    const ranges = MOVEMENTS[name].ranges ?? {};
    variantFolder = gui.addFolder(name);
    Object.keys(params).forEach((key) => {
      if (ranges[key]) variantFolder.add(params, key, ...ranges[key]);
      else variantFolder.add(params, key);
    });
    // Before the presets, which stay last.
    gui.$children.insertBefore(variantFolder.domElement, presets.domElement);
  }

  function switchVariant(name) {
    if (!MOVEMENTS[name]) return;
    settings.variant = name;
    variantController.updateDisplay();
    runtime.setVariant(name);
    buildVariantFolder();
    save();
  }

  buildVariantFolder();
  gui.onFinishChange(save);

  // ______________________ SHORTCUTS ______________________//

  const onKeyDown = (event) => {
    const target = event.target;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

    const key = event.key.toLowerCase();
    if (key === "d") gui.show(gui._hidden);
    else if (key === "p") {
      settings.paused = !settings.paused;
      gui.controllersRecursive().forEach((controller) => controller.updateDisplay());
      save();
    } else if (key === "r") {
      runtime.reseed();
      seedController.updateDisplay();
      save();
    } else if (/^[1-5]$/.test(key) && names[Number(key) - 1]) switchVariant(names[Number(key) - 1]);
  };
  window.addEventListener("keydown", onKeyDown);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    destroyOverlay();
    gui.destroy();
  };
}
