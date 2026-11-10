import { create } from "zustand";

export const usePieceStore = create((set) => ({
  selectedPiece: null,
  isModalOpen: false,
  openPiece: (piece) => set({ selectedPiece: piece, isModalOpen: true }),
  // Keeps the piece selected until its return animation calls clearPiece.
  closePiece: () => set({ isModalOpen: false }),
  clearPiece: () => set({ selectedPiece: null }),
}));

// Kind of element under the cursor ("piece"...), read by the cursor follower to pick its label or arrow.
export const useCursorStore = create((set) => ({
  hovered: null,
  setHovered: (type) => set({ hovered: type }),
  // Only clears its own type: hover end and hover start of two elements can arrive in any order
  // (framer-motion and React pointer events are not dispatched at the same time).
  clearHovered: (type) => set((state) => (state.hovered === type ? { hovered: null } : state)),
}));

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
