"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { drawingStoryData } from "@/data/drawingStoryData";
import styles from "./style.module.scss";

// Drawings placed freely over the whole parent (absolute layer), every value comes from
// drawingStoryData. The panel scrolls natively (smoothed by the PageWrapper's Lenis).
function Drawings({ section }) {
  return (
    <div className={styles.drawings}>
      {section.images.map((image) => {
        const width = section.imageWidth * image.scale;

        return (
          <Image
            key={image.id}
            src={image.src}
            alt={image.alt}
            className={styles.drawing}
            sizes={`${Math.ceil(width)}vw`}
            draggable={false}
            style={{
              left: `${image.x}%`,
              top: `${image.y}cqh`,
              width: `${width}%`,
              transform: `translate(-50%, -50%) rotate(${image.rotate}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

// Tall section of drawings, with the story text sticky in the middle of the panel.
function Section1({ section, text }) {
  const textRef = useRef(null);

  // The sticky text is centered with its own height (CSS cannot read it), so it can stop
  // with its bottom at textStop from the end of the section.
  useLayoutEffect(() => {
    const element = textRef.current;
    const measure = () => {
      element.style.setProperty("--text-height", `${element.offsetHeight}px`);
      // Centered now: show it, hidden in CSS until measured.
      gsap.set(element, { autoAlpha: 1 });
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section1} style={{ height: `${section.height}cqh` }}>
      <Drawings section={section} />

      {/* The text sticks inside this layer, which ends textStop before the end of the section. */}
      <div className={styles.textLayer} style={{ bottom: `${section.textStop}px` }}>
        <p className={styles.text} ref={textRef}>
          {text}
        </p>
      </div>
    </section>
  );
}

// One image on each half, a small text in the top left corner.
function Section2({ section }) {
  return (
    <section className={styles.section2}>
      <p className={styles.text}>{section.text}</p>
      {[section.left, section.right].map((image) => (
        <Image
          key={image.alt}
          src={image.src}
          alt={image.alt}
          className={styles.image}
          sizes="50vw"
          draggable={false}
        />
      ))}
    </section>
  );
}

// A text on the left, then a tall area of drawings placed like in section1.
function Section3({ section }) {
  return (
    <section className={styles.section3}>
      <p className={styles.text}>{section.text}</p>
      <div className={styles.drawingsArea} style={{ height: `${section.height}cqh` }}>
        <Drawings section={section} />
      </div>
    </section>
  );
}

export default function DrawingStory() {
  const { text, sections } = drawingStoryData;

  return (
    <div className={styles.drawingStory}>
      {sections.map((section) => {
        if (section.id === "section1") {
          return <Section1 key={section.id} section={section} text={text} />;
        }
        if (section.id === "section2") {
          return <Section2 key={section.id} section={section} />;
        }
        if (section.id === "section3") {
          return <Section3 key={section.id} section={section} />;
        }
        return null;
      })}
    </div>
  );
}
