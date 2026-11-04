"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./style.module.scss";

// Blurs the background (title, floating images) on every page but the home page.
// It also catches the pointer, so the blurred floating images can't be clicked.
export default function BackgroundBlur() {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {pathname !== "/" && (
        <motion.div
          key="backgroundBlur"
          className={styles.backgroundBlur}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
}
