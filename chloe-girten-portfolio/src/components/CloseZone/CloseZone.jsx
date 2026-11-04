"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCursorStore } from "@/store/store";
import styles from "./style.module.scss";

// Invisible area over the title, on every page but the home page:
// hovering it shows "close x", clicking it goes back home.
export default function CloseZone() {
  const pathname = usePathname();
  const router = useRouter();
  const setHovered = useCursorStore((state) => state.setHovered);
  const clearHovered = useCursorStore((state) => state.clearHovered);

  // The zone is removed on the home page without a pointer leave event.
  useEffect(() => {
    if (pathname === "/") clearHovered("close");
  }, [pathname, clearHovered]);

  if (pathname === "/") return null;

  return (
    <div
      className={styles.closeZone}
      onPointerEnter={() => setHovered("close")}
      onPointerLeave={() => clearHovered("close")}
      onClick={() => router.push("/")}
      aria-hidden="true"
    />
  );
}
