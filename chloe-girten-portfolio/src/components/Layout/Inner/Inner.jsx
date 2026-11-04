"use client";

import { usePathname } from "next/navigation";
import styles from "./style.module.scss";

// Pages shown in a smaller panel.
export const COMPACT_PATHS = ["/contact"];

export default function Inner({ children, withPanel = true }) {
  const pathname = usePathname();
  const isCompact = COMPACT_PATHS.includes(pathname);

  return (
    <div
      className={`${styles.inner} ${withPanel ? styles.panel : ""} ${isCompact ? styles.compact : ""}`.trim()}
    >
      {children}
    </div>
  );
}
