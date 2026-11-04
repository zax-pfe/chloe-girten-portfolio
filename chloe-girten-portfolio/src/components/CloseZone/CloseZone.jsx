"use client";

import { usePathname, useRouter } from "next/navigation";
import CursorTarget from "../CursorTarget/CursorTarget";
import { COMPACT_PATHS } from "../Layout/Inner/Inner";
import styles from "./style.module.scss";

// Invisible areas, on every page but the home page: hovering them shows "close x",
// clicking them goes back home. One over the title, and one on the right of the
// screen for the pages in a small panel, where that side is empty.
// CursorTarget clears the label when a zone is removed (back home, page change).
export default function CloseZone() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") return null;

  const zone = { type: "close", onClick: () => router.push("/"), "aria-hidden": true };

  return (
    <>
      <CursorTarget className={styles.top} {...zone} />
      {COMPACT_PATHS.includes(pathname) && <CursorTarget className={styles.side} {...zone} />}
    </>
  );
}
