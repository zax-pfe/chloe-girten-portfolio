"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import styles from "./style.module.scss";

function mod(n, m) {
  return ((n % m) + m) % m;
}

const lerp = (start, end, t) => start + (end - start) * t;

// Each row is offset by the scroll, then wrapped with a modulo over the grid height:
// a row leaving the top comes back at the bottom.
function placeRows(elements, size, rows, scrollY) {
  const totalHeight = rows * size;

  elements.forEach((element, index) => {
    if (!element) return;
    const row = Math.floor(index / CONFIG.COLS);
    const y = mod(row * size - scrollY + size, totalHeight) - size;
    gsap.set(element, { y });
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
      placeRows(elementRef.current, cellSize.current, rows, scroll.current.current);
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
          <div className={styles.imageContainer}>
            <Image
              src={item.url}
              alt={item.title}
              className={styles.image}
              fill
              sizes={`${Math.ceil(100 / CONFIG.COLS)}vw`}
              draggable={false}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
