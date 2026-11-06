"use client";

import { usePathname, useRouter } from "next/navigation";
import { usePieceStore } from "@/store/store";
import CursorTarget from "../CursorTarget/CursorTarget";
import { COMPACT_PATHS } from "../Layout/Inner/Inner";
import styles from "./style.module.scss";

// Invisible areas that show "close x" while hovered.
// On the home page, while a piece is open: the whole screen, clicking it closes the piece.
// On the other pages: one over the title, and one on the right of the screen for the pages
// in a small panel, where that side is empty; clicking them goes back home.
// CursorTarget clears the label when a zone is removed (piece closed, back home, page change).
export default function CloseZone() {
  const pathname = usePathname();
  const router = useRouter();
  const isModalOpen = usePieceStore((state) => state.isModalOpen);
  const closePiece = usePieceStore((state) => state.closePiece);

  if (pathname === "/") {
    if (!isModalOpen) return null;
    return <CursorTarget className={styles.full} type="close" onClick={closePiece} aria-hidden />;
  }

  const zone = { type: "close", onClick: () => router.push("/"), "aria-hidden": true };

  return (
    <>
      <CursorTarget className={styles.top} {...zone} />
      {COMPACT_PATHS.includes(pathname) && <CursorTarget className={styles.side} {...zone} />}
    </>
  );
}
