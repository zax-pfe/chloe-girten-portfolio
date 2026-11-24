import GUI from "lil-gui";
import { MOVEMENTS, STORAGE_KEY } from "../index";
import {
  DRAG_DEFAULTS,
  GLOBAL_DEFAULTS,
  dragSettings,
  getPieceLabel,
  getPieceSettings,
  getVariantParams,
  resetPieceSettings,
  resetVariantParams,
  settings,
} from "../runtime";
import { createOverlay } from "./overlay";

// Development-only tuning panel. Loaded dynamically by FloatingImages.
// Shortcuts: D panel, P pause, 1-5 variants, R reseed.

// Shown when hovering a setting (the variants bring their own, in `descriptions`).
const DESCRIPTIONS = {
  speedMultiplier: "Vitesse de tout le mouvement. 1 = normal, 0 = figé.",
  amplitude:
    "Rotation maximale, en degrés de chaque côté. Les images tournent jusqu'à cet angle puis repartent dans l'autre sens.",
  avoid: "Les images se repoussent quand elles se rapprochent.",
  repulsion: "Force avec laquelle elles se repoussent (si avoid est coché). Plus haut = elles restent plus éloignées.",
  paused: "Met le mouvement en pause (touche P).",
  seed: "Graine du hasard : positions de départ, directions, ondulations... Même seed = même composition.",
  overlay: "Dessine les repères de debug : rayon, point de départ et vitesse de chaque image.",
  speed: "Vitesse de cette image. 1 = normal, 2 = deux fois plus rapide.",
  scaleFloating: "Hauteur de l'image quand elle flotte, en part de la hauteur d'écran (0.4 = 40 %).",
  scaleOpen: "Taille de l'image ouverte, en part de l'écran (1 = aussi grande que possible).",
  rotationSpeed: "Vitesse de rotation de cette image, en degrés par seconde (0 = ne tourne pas).",
  elastic:
    "Résistance quand on tire une image au-delà du bord de l'écran. 0 = bloquée au bord, 1 = suit la souris (puis revient en rebondissant).",
  power: "Élan au lâcher : jusqu'où l'image continue sur sa lancée. 0 = s'arrête net.",
  timeConstant: "Durée du ralentissement de l'élan, en millisecondes. Plus haut = glisse plus longtemps.",
  bounceStiffness: "Raideur du ressort qui ramène l'image dans l'écran. Plus haut = retour plus vif.",
  bounceDamping: "Amortissement de ce ressort. Plus bas = rebondit davantage avant de se poser.",
};

// Adds the hover explanation of `key` to a controller's row.
function describe(controller, key, descriptions = DESCRIPTIONS) {
  if (descriptions[key]) controller.domElement.title = descriptions[key];
  return controller;
}
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
  describe(global.add(settings, "speedMultiplier", 0, 5, 0.05), "speedMultiplier");
  describe(global.add(settings, "amplitude", 0, 90, 0.5), "amplitude");
  describe(
    global.add(settings, "avoid").onChange(() => repulsionController.enable(settings.avoid)),
    "avoid",
  );
  const repulsionController = describe(global.add(settings, "repulsion", 0, 5, 0.05), "repulsion");
  repulsionController.enable(settings.avoid);
  describe(global.add(settings, "paused"), "paused");
  const seedController = describe(
    global.add(settings, "seed", 1, 9999, 1).onFinishChange(() => runtime.reseed(settings.seed)),
    "seed",
  );
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
  describe(global.add(settings, "overlay"), "overlay");
  global.add(settings, "fps").decimals(0).listen().disable();

  // ______________________ PIECES ______________________//

  // One folder per image, starting from its values in floatingImgData.js.
  const piecesFolder = gui.addFolder("Pieces");
  runtime.pieces.forEach(({ data }) => {
    const values = getPieceSettings(data);
    const folder = piecesFolder.addFolder(getPieceLabel(data)).close();
    describe(folder.add(values, "speed", 0, 3, 0.01), "speed");
    describe(folder.add(values, "scaleFloating", 0.1, 1, 0.01), "scaleFloating");
    describe(folder.add(values, "scaleOpen", 0.2, 1.5, 0.01), "scaleOpen");
    describe(folder.add(values, "rotationSpeed", 0, 45, 0.5), "rotationSpeed");
  });

  // ______________________ DRAG ______________________//

  const dragFolder = gui.addFolder("Drag").close();
  describe(dragFolder.add(dragSettings, "elastic", 0, 1, 0.01), "elastic");
  describe(dragFolder.add(dragSettings, "power", 0, 1, 0.01), "power");
  describe(dragFolder.add(dragSettings, "timeConstant", 0, 1000, 10), "timeConstant");
  describe(dragFolder.add(dragSettings, "bounceStiffness", 0, 1000, 5), "bounceStiffness");
  describe(dragFolder.add(dragSettings, "bounceDamping", 0, 100, 1), "bounceDamping");

  // ______________________ PRESETS ______________________//

  const presets = gui.addFolder("Presets");
  presets.add(
    {
      Copy: () => navigator.clipboard?.writeText(JSON.stringify(gui.save(), null, 2)),
    },
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
        Object.assign(dragSettings, DRAG_DEFAULTS);
        runtime.pieces.forEach(({ data }) => resetPieceSettings(data));
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
    const { ranges = {}, descriptions = {} } = MOVEMENTS[name];
    variantFolder = gui.addFolder(name);
    Object.keys(params).forEach((key) => {
      const controller = ranges[key] ? variantFolder.add(params, key, ...ranges[key]) : variantFolder.add(params, key);
      describe(controller, key, descriptions);
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
