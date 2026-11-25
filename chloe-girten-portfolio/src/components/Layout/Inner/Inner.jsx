"use client";

import { usePathname } from "next/navigation";
import styles from "./style.module.scss";

// Pages shown in a smaller panel.
export const COMPACT_PATHS = ["/contact"];

// A piece open over the gallery (/pieces/<slug>): the panel is blurred, border included.
const PIECE_PATH = /^\/pieces\/[^/]+/;

export default function Inner({ children, withPanel = true }) {
  const pathname = usePathname();
  const isCompact = COMPACT_PATHS.includes(pathname);
  const isBlurred = PIECE_PATH.test(pathname);

  return (
    <div
      className={[
        styles.inner,
        withPanel && styles.panel,
        isCompact && styles.compact,
        isBlurred && styles.blurred,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
