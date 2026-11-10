"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useCursorStore } from "@/store/store";
import styles from "./style.module.scss";

// Label shown for each kind of hovered element.
const LABELS = {
  piece: "view",
  close: "close x",
  previous: "<",
  next: ">",
};

const variant = {
  hidden: { opacity: 0, scale: 0 },
  visible: { opacity: 1, scale: 1 },
};

// Follows the cursor with a spring and shows a label while an element is hovered.
export default function CursorFollower() {
  const hovered = useCursorStore((state) => state.hovered);
  const label = LABELS[hovered];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div className={styles.cursorFollower} style={{ x: springX, y: springY }} aria-hidden="true">
      <AnimatePresence>
        {label && (
          <motion.p
            key={hovered}
            className={styles.label}
            variants={variant}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
