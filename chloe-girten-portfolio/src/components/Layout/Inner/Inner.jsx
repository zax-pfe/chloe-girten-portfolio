"use client";

import { Component, useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import {
  FADE_DURATION,
  FADE_EASE,
  Flip,
  PANEL_FLIP_ID,
  RESIZE_DURATION,
  RESIZE_EASE,
  fadeOutGhost,
  motionDuration,
  playOnNextTick,
} from "../../PieceDetail/transition";
import styles from "./style.module.scss";

// Pages shown in a smaller panel.
export const COMPACT_PATHS = ["/contact"];

// A piece page (/pieces/[id]), shown in a tall portrait panel.
export const isPiecePath = (pathname) => /^\/pieces\/[^/]+$/.test(pathname);

const getPanelMode = (pathname) => {
  if (isPiecePath(pathname)) return "piece";
  if (COMPACT_PATHS.includes(pathname)) return "compact";
  return "full";
};

// Between a full panel and a piece page, the panel moves and resizes instead of jumping.
const isPieceSwitch = (from, to) => (from === "full" && to === "piece") || (from === "piece" && to === "full");

// Measures the panel right before React swaps the page, while it still shows the previous one
// (even mid-animation): the state the panel is flipped from once the new page is in place.
// Only a class component can run code at that moment (getSnapshotBeforeUpdate).
class PanelSnapshot extends Component {
  getSnapshotBeforeUpdate(prevProps) {
    const panel = this.props.panelRef.current;
    if (!panel || !isPieceSwitch(prevProps.mode, this.props.mode)) return null;
    return Flip.getState(panel);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) this.props.onSnapshot(snapshot);
  }

  render() {
    return this.props.children;
  }
}

export default function Inner({ children, withPanel = true }) {
  const pathname = usePathname();
  const panelMode = getPanelMode(pathname);

  const panelRef = useRef(null);
  const ghostLayerRef = useRef(null);
  const modeRef = useRef(panelMode);
  // State of the panel before the page changed (see PanelSnapshot), used once.
  const snapshotRef = useRef(null);
  // The transition run here (panel, copy of the old page, new page), stopped by the next one.
  const timelineRef = useRef(null);

  useEffect(() => () => timelineRef.current?.kill(), []);

  // Runs before paint, once the new page is in place: the panel already has its new size and
  // position, it is set back to the previous ones and animated to the new ones.
  useLayoutEffect(() => {
    const previous = modeRef.current;
    modeRef.current = panelMode;
    const snapshot = snapshotRef.current;
    snapshotRef.current = null;
    if (!isPieceSwitch(previous, panelMode)) return;

    const panel = panelRef.current;
    timelineRef.current?.kill();
    // A piece opened from the grid: its page (run first, being a child) already flips the panel
    // along with the image, and shows its own content.
    if (gsap.getTweensOf(panel).length) return;

    // Leftovers of an interrupted animation must not be measured as the new state.
    gsap.set(panel, { clearProps: "all" });
    const resizeDuration = snapshot ? motionDuration(RESIZE_DURATION) : 0;
    const ghostLayer = ghostLayerRef.current;
    const page = [...panel.children].filter((child) => child !== ghostLayer);

    // Every starting state is applied now, before paint; the movement starts on the next tick.
    const timeline = gsap.timeline({ paused: true });
    if (snapshot) {
      // Resizing instead of scaling keeps the border and the radius as they are.
      timeline.add(Flip.from(snapshot, { targets: panel, scale: false, duration: resizeDuration, ease: RESIZE_EASE }), 0);
    }
    // While the panel moves, the copy of the page being left (see createGhost) fades out.
    [...ghostLayer.children].forEach((ghost) => timeline.add(fadeOutGhost(ghost), 0));
    // The new page stays hidden until the panel is in place, so it is never seen reflowing,
    // then fades in. With the "out" ease, the panel has done 99% of its move at 80% of the
    // duration: the page starts fading in there instead of waiting for the last pixel.
    timeline.fromTo(
      page,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: motionDuration(FADE_DURATION), ease: FADE_EASE },
      resizeDuration * 0.8,
    );
    timelineRef.current = playOnNextTick(timeline);
  }, [panelMode]);

  return (
    <PanelSnapshot
      mode={panelMode}
      panelRef={panelRef}
      onSnapshot={(snapshot) => {
        snapshotRef.current = snapshot;
      }}
    >
      <div
        ref={panelRef}
        data-flip-id={PANEL_FLIP_ID}
        className={`${styles.inner} ${withPanel ? styles.panel : ""} ${panelMode !== "full" ? styles[panelMode] : ""}`.trim()}
      >
        {/* Filled outside React with a copy of the page being left, between the grid and a piece
            (see createGhost). */}
        <div className={styles.ghostLayer} ref={ghostLayerRef} data-ghost-layer aria-hidden="true" />
        {children}
      </div>
    </PanelSnapshot>
  );
}
