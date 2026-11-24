"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import {
  FADE_DURATION,
  FADE_EASE,
  PANEL_DURATION,
  PANEL_EASE,
  PANEL_FLIP_ID,
  motionDuration,
} from "../../PieceDetail/transition";
import styles from "./style.module.scss";

// Pages shown in a smaller panel.
export const COMPACT_PATHS = ["/contact"];

// A piece page (/pieces/[id]), shown in a portrait panel.
export const isPiecePath = (pathname) => /^\/pieces\/[^/]+$/.test(pathname);

const getPanelMode = (pathname) => {
  if (isPiecePath(pathname)) return "piece";
  if (COMPACT_PATHS.includes(pathname)) return "compact";
  return "full";
};

export default function Inner({ children, withPanel = true }) {
  const pathname = usePathname();
  const panelMode = getPanelMode(pathname);

  const panelRef = useRef(null);
  // Width the panel was last laid out at, kept up to date by a ResizeObserver.
  const widthRef = useRef(null);
  const modeRef = useRef(panelMode);

  useEffect(() => {
    const panel = panelRef.current;
    const observer = new ResizeObserver(() => {
      widthRef.current = panel.offsetWidth;
    });
    observer.observe(panel);
    return () => {
      observer.disconnect();
      gsap.killTweensOf(panel);
    };
  }, []);

  // Between a full panel and a piece page, the panel resizes instead of jumping.
  // Runs before paint, once the new page is in place: the panel already has its new size,
  // it is set back to the previous one and animated to the new one.
  useLayoutEffect(() => {
    const previous = modeRef.current;
    modeRef.current = panelMode;
    const isPieceSwitch =
      (previous === "full" && panelMode === "piece") || (previous === "piece" && panelMode === "full");
    if (!isPieceSwitch) return;

    const panel = panelRef.current;
    // A piece opened from the grid: its page (run first, being a child) already resizes the
    // panel along with the image (Flip).
    if (panelMode === "piece" && gsap.getTweensOf(panel).length) return;

    const from = widthRef.current;
    gsap.killTweensOf(panel);
    gsap.set(panel, { clearProps: "width" });
    const to = panel.offsetWidth;

    if (from && from !== to) {
      gsap.fromTo(
        panel,
        { width: from },
        {
          width: to,
          duration: motionDuration(PANEL_DURATION),
          ease: PANEL_EASE,
          onComplete: () => gsap.set(panel, { clearProps: "width" }),
        },
      );
    }

    // Leaving a piece: the new page (the grid) fades in while the panel widens.
    if (panelMode === "full") {
      gsap.fromTo(
        panel.children,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: motionDuration(FADE_DURATION), ease: FADE_EASE },
      );
    }
  }, [panelMode]);

  return (
    <div
      ref={panelRef}
      data-flip-id={PANEL_FLIP_ID}
      className={`${styles.inner} ${withPanel ? styles.panel : ""} ${panelMode !== "full" ? styles[panelMode] : ""}`.trim()}
    >
      {children}
    </div>
  );
}
