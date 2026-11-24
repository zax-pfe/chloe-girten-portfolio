// Debug panel shared by the whole site (lil-gui), only created when the URL ends with #debug.
// lil-gui is loaded on demand, so it costs nothing to normal visitors.

let guiPromise = null;

export function isDebug() {
  return typeof window !== "undefined" && window.location.hash === "#debug";
}

// Resolves with the shared lil-gui instance, or null outside debug mode.
export function getDebugGui() {
  if (!isDebug()) return Promise.resolve(null);
  guiPromise ??= import("lil-gui").then(({ default: GUI }) => new GUI({ title: "Debug" }));
  return guiPromise;
}

// Adds a folder to the panel from an effect. Returns the cleanup, which also works
// when the effect is cleaned up before lil-gui has finished loading.
export function addDebugFolder(setup) {
  let cancelled = false;
  let cleanup = null;
  getDebugGui().then((gui) => {
    if (gui && !cancelled) cleanup = setup(gui);
  });
  return () => {
    cancelled = true;
    cleanup?.();
  };
}

// Values tweaked in the panel survive a reload (debug mode only).
export function loadDebugValues(key) {
  try {
    return JSON.parse(localStorage.getItem(`debug:${key}`));
  } catch {
    return null;
  }
}

export function saveDebugValues(key, values) {
  try {
    localStorage.setItem(`debug:${key}`, JSON.stringify(values));
  } catch {
    // Storage unavailable (private mode...): the values just won't persist.
  }
}

export function clearDebugValues(key) {
  try {
    localStorage.removeItem(`debug:${key}`);
  } catch {
    // Nothing to clear.
  }
}
