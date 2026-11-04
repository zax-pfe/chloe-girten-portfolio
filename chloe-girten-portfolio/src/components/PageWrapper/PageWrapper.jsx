"use client";

import { ReactLenis } from "lenis/react";
import styles from "./style.module.scss";

// The page scrolls inside the panel, with its own Lenis instance for smooth scrolling.
// data-lenis-prevent keeps the root Lenis (window) out of it.
export default function PageWrapper({ children }) {
  return (
    <ReactLenis className={styles.pageWrapper} options={{ syncTouch: true }} data-lenis-prevent>
      {children}
    </ReactLenis>
  );
}
