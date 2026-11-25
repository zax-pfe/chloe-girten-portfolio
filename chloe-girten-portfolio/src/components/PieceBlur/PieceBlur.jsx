"use client";

import { useRef } from "react";
import { useBlurFade } from "../BlurController/useBlurFade";
import styles from "./style.module.scss";

// Second blur ("page", see useBlurStore): over the whole screen, pages and background, while a
// piece is open over the gallery. Under the piece panel (PieceDetail) and the navbar, which stay
// sharp. The background blur (BackgroundBlur) is off meanwhile.
export default function PieceBlur() {
  const blurRef = useRef(null);
  useBlurFade(blurRef, "page");

  return <div ref={blurRef} className={styles.pieceBlur} aria-hidden="true" />;
}
