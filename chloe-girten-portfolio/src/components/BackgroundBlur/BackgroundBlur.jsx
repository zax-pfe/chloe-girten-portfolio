"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { usePieceStore } from "@/store/store";
import styles from "./style.module.scss";

// Blurs the background (title, floating images) on every page but the home page, and on the
// home page while a piece is open. A single element for both: going from an open piece to a
// page keeps it as it is, it doesn't fade again.
// It also catches the pointer, so the blurred floating images can't be clicked.
export default function BackgroundBlur() {
  const pathname = usePathname();
  const isModalOpen = usePieceStore((state) => state.isModalOpen);

  return (
    <AnimatePresence>
      {(pathname !== "/" || isModalOpen) && (
        <motion.div
          key="backgroundBlur"
          className={styles.backgroundBlur}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
}
