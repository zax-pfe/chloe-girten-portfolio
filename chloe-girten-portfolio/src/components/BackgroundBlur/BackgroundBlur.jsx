"use client";

import { useRef } from "react";
import { useBlurFade } from "../BlurController/useBlurFade";
import styles from "./style.module.scss";

// First blur ("background", see useBlurStore): hides the background (title, floating images) on
// every page but the home page, and on the home page while a piece is selected. A single element
// for both: going from a selected piece to a page keeps it as it is, it doesn't fade again.
// Off while a piece is open over the gallery: the page blur (PieceBlur) takes over.
// It also catches the pointer while on, so the blurred floating images can't be clicked.
export default function BackgroundBlur() {
  const blurRef = useRef(null);
  const isOn = useBlurFade(blurRef, "background");

  return (
    <div
      ref={blurRef}
      className={styles.backgroundBlur}
      // Lets the pointer through as soon as it goes off, even while fading out.
      style={{ pointerEvents: isOn ? "auto" : "none" }}
      aria-hidden="true"
    />
  );
}
