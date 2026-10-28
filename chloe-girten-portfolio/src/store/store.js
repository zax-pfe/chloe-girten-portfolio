import { create } from "zustand";

export const usePieceStore = create((set) => ({
  selectedPiece: null,
  isModalOpen: false,
  openPiece: (piece) => set({ selectedPiece: piece, isModalOpen: true }),
  // Keeps the piece selected until its return animation calls clearPiece.
  closePiece: () => set({ isModalOpen: false }),
  clearPiece: () => set({ selectedPiece: null }),
}));
