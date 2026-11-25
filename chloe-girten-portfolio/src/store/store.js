import { create } from "zustand";

export const usePieceStore = create((set) => ({
  selectedPiece: null,
  isModalOpen: false,
  openPiece: (piece) => set({ selectedPiece: piece, isModalOpen: true }),
  // Keeps the piece selected until its return animation calls clearPiece.
  closePiece: () => set({ isModalOpen: false }),
  clearPiece: () => set({ selectedPiece: null }),
}));

// The blur that is on, never both at once:
// "background": BackgroundBlur, hides the background (title, floating images), under the pages.
// "page": PieceBlur, over the pages and the background, under the piece panel (PieceDetail).
// null: none. previousBlur is the one before, to tell a switch between the two from a fade.
// Kept up to date by BlurController.
export const useBlurStore = create((set) => ({
  activeBlur: null,
  previousBlur: null,
  setActiveBlur: (blur) =>
    set((state) => (state.activeBlur === blur ? state : { activeBlur: blur, previousBlur: state.activeBlur })),
}));

// Kind of element under the cursor ("piece"...), read by the cursor follower to pick its label or arrow.
export const useCursorStore = create((set) => ({
  hovered: null,
  setHovered: (type) => set({ hovered: type }),
  // Only clears its own type: hover end and hover start of two elements can arrive in any order
  // (framer-motion and React pointer events are not dispatched at the same time).
  clearHovered: (type) => set((state) => (state.hovered === type ? { hovered: null } : state)),
}));

// Last pointer position in the window (kept by the cursor follower), null before the first move.
// Read by CursorTarget for an element that appears under a pointer that doesn't move: the
// browser only sends pointerenter on the next move.
export const lastPointer = { x: null, y: null };

// Max window width (px) of each device mode, from the smallest. Wider windows are "xl".
export const DEVICE_BREAKPOINTS = { phone: 750, m: 1300, l: 1920 };

// Device mode from the window width: "phone", "m", "l" or "xl".
// null on the server and during the first render: the width is only known in the browser.
export const useDeviceStore = create(() => ({ deviceMode: null }));

// Keeps the device mode up to date. Returns the function that stops listening.
export function listenDeviceMode() {
  // Media queries only fire when a breakpoint is crossed, not on every pixel of a resize.
  const queries = Object.entries(DEVICE_BREAKPOINTS).map(([mode, width]) => ({
    mode,
    media: window.matchMedia(`(max-width: ${width}px)`),
  }));

  const update = () => {
    const match = queries.find(({ media }) => media.matches);
    useDeviceStore.setState({ deviceMode: match ? match.mode : "xl" });
  };

  update();
  queries.forEach(({ media }) => media.addEventListener("change", update));
  return () => queries.forEach(({ media }) => media.removeEventListener("change", update));
}
