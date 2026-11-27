"use client";

import { usePathname, useRouter } from "next/navigation";
import { usePieceStore, usePieceTransitionStore } from "@/store/store";
import CursorTarget from "../CursorTarget/CursorTarget";
import { COMPACT_PATHS, isPiecePath } from "../Layout/Inner/Inner";
import styles from "./style.module.scss";

// Invisible areas that show "close x" while hovered, or "back <" on a piece page.
// On the home page, while a piece is open: the whole screen, clicking it closes the piece.
// On the other pages: one over the title, and one on the right of the screen for the pages
// in a smaller panel, where that side is empty. Clicking them goes back home, or back to the
// grid from a piece page (which fades out first, see PieceDetail).
// CursorTarget clears the label when a zone is removed (piece closed, back home, page change).
export default function CloseZone() {
  const pathname = usePathname();
  const router = useRouter();
  const isModalOpen = usePieceStore((state) => state.isModalOpen);
  const closePiece = usePieceStore((state) => state.closePiece);
  const requestClose = usePieceTransitionStore((state) => state.requestClose);

  if (pathname === "/") {
    if (!isModalOpen) return null;
    return <CursorTarget className={styles.full} type="close" onClick={closePiece} aria-hidden />;
  }

  const isPiecePage = isPiecePath(pathname);
  const zone = {
    // From a piece page, they go back to the grid.
    type: isPiecePage ? "back" : "close",
    onClick: isPiecePage ? requestClose : () => router.push("/"),
    "aria-hidden": true,
  };

  return (
    <>
      <CursorTarget className={styles.top} {...zone} />
      {COMPACT_PATHS.includes(pathname) && <CursorTarget className={styles.side} {...zone} />}
      {isPiecePage && <CursorTarget className={`${styles.side} ${styles.pieceSide}`} {...zone} />}
    </>
  );
}
