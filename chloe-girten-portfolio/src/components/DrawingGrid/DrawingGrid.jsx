"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
// Loads straight from the Sanity image CDN at the size next/image asks for.
import { Image } from "next-sanity/image";
import { gsap } from "gsap";
import styles from "./style.module.scss";

function mod(n, m) {
  return ((n % m) + m) % m;
}

const lerp = (start, end, t) => start + (end - start) * t;

// Position of a row, in cells: offset by the scroll, then wrapped with a modulo over
// the grid height, so a row leaving the top comes back at the bottom.
function rowPosition(row, rows, scrollInCells) {
  return mod(row - scrollInCells + 1, rows) - 1;
}

function placeRows(elements, size, rows, scrollY) {
  // Not measured yet: nothing to place.
  if (!size) return;

  elements.forEach((element, index) => {
    if (!element) return;
    const row = Math.floor(index / CONFIG.COLS);
    gsap.set(element, { y: rowPosition(row, rows, scrollY / size) * size });
  });
}

const CONFIG = {
  LERP: 0.08,
  SCROLL_MULTIPLIER: 1,
  COLS: 6,
  // The list is repeated so the grid is taller than the panel: rows wrap out of sight.
  REPEAT: 2,
};

export default function DrawingGrid({ items }) {
  const containerRef = useRef(null);
  const elementRef = useRef([]);
  const cellSize = useRef(0);
  const scroll = useRef({ current: 0, target: 0 });

  const slotCount = Math.ceil((items.length * CONFIG.REPEAT) / CONFIG.COLS) * CONFIG.COLS;
  const slots = Array.from({ length: slotCount }, (_, i) => items[i % items.length]);
  const rows = slotCount / CONFIG.COLS;

  // ______________________ CELL SIZE ______________________//

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = () => {
      cellSize.current = container.offsetWidth / CONFIG.COLS;
      if (!cellSize.current) return;
      placeRows(elementRef.current, cellSize.current, rows, scroll.current.current);
      // Rows are in place: show the grid, hidden in CSS until now so the rows
      // are never seen stacked before the JS has positioned them.
      gsap.set(container, { autoAlpha: 1 });
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [rows]);

  // ______________________ SCROLLING ______________________//

  useEffect(() => {
    const container = containerRef.current;
    const handleWheel = (e) => {
      e.preventDefault();
      scroll.current.target += e.deltaY * CONFIG.SCROLL_MULTIPLIER;
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // ______________________ TICKER LOOP ______________________//

  useEffect(() => {
    const tick = () => {
      const s = scroll.current;
      s.current = lerp(s.current, s.target, CONFIG.LERP);
      placeRows(elementRef.current, cellSize.current, rows, s.current);
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [rows]);

  return (
    // data-lenis-prevent: the wheel drives the infinite grid, not the panel's Lenis.
    <div className={styles.drawingGrid} ref={containerRef} data-lenis-prevent>
      {slots.map((item, index) => (
        <div
          key={index}
          className={styles.cell}
          ref={(element) => (elementRef.current[index] = element)}
          style={{ left: `${((index % CONFIG.COLS) * 100) / CONFIG.COLS}%`, width: `${100 / CONFIG.COLS}%` }}
        >
          <div className={`${styles.imageContainer} ${item.hover ? styles.hasHover : ""}`}>
            <Image
              src={item.url}
              alt={item.title}
              className={styles.image}
              fill
              sizes={`${Math.ceil(100 / CONFIG.COLS)}vw`}
              draggable={false}
            />
            {/* Rendered (hidden) from the start so it is loaded before the hover: the swap is instant. */}
            {item.hover && (
              <Image
                src={item.hover}
                alt=""
                className={`${styles.image} ${styles.hoverImage}`}
                fill
                sizes={`${Math.ceil(100 / CONFIG.COLS)}vw`}
                draggable={false}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
