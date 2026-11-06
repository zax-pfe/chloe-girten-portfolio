"use client";

import styles from "./style.module.scss";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePieceStore } from "@/store/store";

// Small panel at the bottom of the screen for the selected piece.
// It closes by clicking anywhere else (see CloseZone) or with Escape.
export default function Modal() {
  const selectedPiece = usePieceStore((state) => state.selectedPiece);
  const isModalOpen = usePieceStore((state) => state.isModalOpen);
  const closePiece = usePieceStore((state) => state.closePiece);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closePiece();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, closePiece]);

  return (
    <AnimatePresence>
      {isModalOpen && selectedPiece && (
        <motion.section
          key={selectedPiece.id}
          className={styles.modalContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <h2 className={styles.pieceName}>{selectedPiece.title}</h2>

          <div className={styles.botContainer}>
            <p className={styles.year}>{selectedPiece.date}</p>
            <button type="button" className={styles.learnMore}>
              Learn more
            </button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
