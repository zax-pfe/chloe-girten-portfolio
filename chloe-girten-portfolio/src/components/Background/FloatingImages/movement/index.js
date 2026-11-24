import { baseline } from "./variants/baseline";

// Every variant, in the order of the 1-5 shortcuts of the debug panel.
export const MOVEMENTS = { baseline };

// Variant used by the site. Overridden by ?movement=<name> in the URL.
export const ACTIVE_MOVEMENT = "baseline";

export const STORAGE_KEY = "floating-movement:panel";

// Last state of the debug panel, in development only.
export function readStoredPanel() {
  if (process.env.NODE_ENV !== "development") return null;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

// ?movement=<name>, then the panel's last variant (development), then ACTIVE_MOVEMENT.
export function getInitialMovement() {
  const fromUrl = new URLSearchParams(window.location.search).get("movement");
  if (MOVEMENTS[fromUrl]) return fromUrl;
  const stored = readStoredPanel()?.controllers?.variant;
  if (MOVEMENTS[stored]) return stored;
  return ACTIVE_MOVEMENT;
}
