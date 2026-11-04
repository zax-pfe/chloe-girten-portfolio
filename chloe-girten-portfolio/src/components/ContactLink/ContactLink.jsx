"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import ArrowUpRightSVG from "../ArrowUpRightSVG/ArrowUpRightSVG";
import styles from "./style.module.scss";

// Fill positions in % of its height, from its rest just below the row (CSS).
const FILL_POSITION = {
  BELOW: 0,
  IN: -100,
  ABOVE: -200,
};

// Black background coming in from the bottom and leaving through the top,
// text (and arrow color) turning white.
const FILL_CONFIG = {
  // Appearing (hover), disappearing (leave).
  DURATION_IN: 0.4,
  DURATION_OUT: 0.2,
  EASE: "power4.inOut",
  COLOR: "#000",
  COLOR_HOVER: "#fff",
};

// ↗ arrow sliding along the diagonal.
const ARROW_CONFIG = {
  DURATION: 0.25,
  EASE: "power2.inOut",
};

// Contact row: a link when it has an `href`, a button otherwise (onClick…).
// On hover, a black fill rises from the bottom while the text turns white;
// on leave, it goes on up and out through the top.
// `arrow` adds a ↗ arrow: a second arrow coming from the bottom left pushes the
// first one out through the top right and takes its place.
export default function ContactLink({ href, arrow = false, className, children, ...props }) {
  const rowRef = useRef(null);
  const fillsRef = useRef([]);
  const currentFill = useRef(0);
  const arrowsRef = useRef(null);

  const Tag = href ? "a" : "button";
  const tagProps = href ? { href, target: "_blank", rel: "noopener noreferrer" } : { type: "button" };

  // In both animations: 1 = hovered, 0 = rest.

  // ______________________ BACKGROUND ______________________//

  // A fill comes in from the bottom and leaves through the top (yPercent, from its rest below the row).
  // Two fills take turns: when hovering again while one is leaving, it finishes leaving
  // and the other one comes in from the bottom.
  const animateFill = (progress) => {
    // The text color changes at the same speed as the fill, in both directions.
    const duration = progress ? FILL_CONFIG.DURATION_IN : FILL_CONFIG.DURATION_OUT;
    const tween = { duration, ease: FILL_CONFIG.EASE, overwrite: true };
    let fill = fillsRef.current[currentFill.current];

    if (progress) {
      // Past its hovered position: leaving (or gone) through the top.
      if (gsap.getProperty(fill, "yPercent") < FILL_POSITION.IN) {
        currentFill.current = 1 - currentFill.current;
        fill = fillsRef.current[currentFill.current];
        gsap.set(fill, { yPercent: FILL_POSITION.BELOW });
      }
      gsap.to(fill, { yPercent: FILL_POSITION.IN, ...tween });
    } else {
      gsap.to(fill, { yPercent: FILL_POSITION.ABOVE, ...tween });
    }
    // The arrow is drawn with currentColor: its color follows the text, here.
    gsap.to(rowRef.current, { color: progress ? FILL_CONFIG.COLOR_HOVER : FILL_CONFIG.COLOR, ...tween });
  };

  // ______________________ ARROW ______________________//

  // Both arrows sit in one track: moving it by one arrow size along the diagonal moves them together.
  const animateArrow = (progress) => {
    if (!arrowsRef.current) return;

    gsap.to(arrowsRef.current, {
      xPercent: 100 * progress,
      yPercent: -100 * progress,
      duration: ARROW_CONFIG.DURATION,
      ease: ARROW_CONFIG.EASE,
      overwrite: true,
    });
  };

  const handleEnter = () => {
    animateFill(1);
    animateArrow(1);
  };

  const handleLeave = () => {
    animateFill(0);
    animateArrow(0);
  };

  return (
    <Tag
      {...tagProps}
      {...props}
      ref={rowRef}
      className={`${styles.contactLink} ${className ?? ""}`.trim()}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      {[0, 1].map((index) => (
        <span
          key={index}
          className={styles.fill}
          ref={(element) => (fillsRef.current[index] = element)}
          aria-hidden="true"
        />
      ))}
      {children}
      {arrow && (
        <span className={styles.arrow} aria-hidden="true">
          <span className={styles.track} ref={arrowsRef}>
            <ArrowUpRightSVG />
            <ArrowUpRightSVG />
          </span>
        </span>
      )}
    </Tag>
  );
}
