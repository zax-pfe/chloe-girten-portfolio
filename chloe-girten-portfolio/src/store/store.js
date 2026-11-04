import { create } from "zustand";

export const usePieceStore = create((set) => ({
  selectedPiece: null,
  isModalOpen: false,
  openPiece: (piece) => set({ selectedPiece: piece, isModalOpen: true }),
  // Keeps the piece selected until its return animation calls clearPiece.
  closePiece: () => set({ isModalOpen: false }),
  clearPiece: () => set({ selectedPiece: null }),
}));

// Kind of element under the cursor ("piece"...), read by the cursor follower to pick its label.
export const useCursorStore = create((set) => ({
  hovered: null,
  setHovered: (type) => set({ hovered: type }),
  // Only clears its own type: hover end and hover start of two elements can arrive in any order
  // (framer-motion and React pointer events are not dispatched at the same time).
  clearHovered: (type) => set((state) => (state.hovered === type ? { hovered: null } : state)),
}));
