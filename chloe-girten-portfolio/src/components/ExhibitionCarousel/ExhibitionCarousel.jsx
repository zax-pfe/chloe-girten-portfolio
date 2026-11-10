"use client";

// Loads straight from the Sanity image CDN at the size next/image asks for.
import { Image } from "next-sanity/image";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import CursorTarget from "../CursorTarget/CursorTarget";
import styles from "./style.module.scss";

const SLIDE_DURATION = 0.8;
const SLIDE_EASE = "power3.inOut";

// Puts each slide in its slot, in widths of the carousel: 0 is the visible one, -1 the next one
// (on its left), 1, 2... the previous ones (on its right). Slots wrap around, so the strip never ends.
function placeSlides(slides, offset) {
  const wrap = gsap.utils.wrap(-1, slides.length - 1);
  slides.forEach((slide, i) => gsap.set(slide, { xPercent: wrap(offset - i) * 100 }));
}

// Infinite carousel. Clicking the right half (">") slides the image to the right and shows the one
// on its left, the next one in the studio order. The left half ("<") goes the other way.
export default function ExhibitionCarousel({ images, name }) {
  const slidesRef = useRef([]);
  // Position of the strip, in images, tweened by gsap.
  const offsetRef = useRef({ value: 0 });
  // Where the strip is going: clicks during a slide add up.
  const targetRef = useRef(0);
  // Off-screen images are lazy and would slide in empty: they start loading once the carousel is hovered.
  const [preload, setPreload] = useState(false);

  const canSlide = images.length > 1;

  useLayoutEffect(() => {
    const slides = slidesRef.current;
    const offset = offsetRef.current;

    if (slides.length > 1) placeSlides(slides, offset.value);
    gsap.set(slides, { autoAlpha: 1 });

    return () => gsap.killTweensOf(offset);
  }, []);

  const slide = (direction) => {
    targetRef.current += direction;
    gsap.to(offsetRef.current, {
      value: targetRef.current,
      duration: SLIDE_DURATION,
      ease: SLIDE_EASE,
      overwrite: true,
      onUpdate: () => placeSlides(slidesRef.current, offsetRef.current.value),
    });
  };

  return (
    <div className={styles.carousel} onPointerEnter={() => setPreload(true)}>
      {images.map((url, i) => (
        <div
          key={i}
          className={styles.slide}
          ref={(element) => {
            slidesRef.current[i] = element;
          }}
        >
          <Image src={url} alt={name} fill sizes="50vw" loading={preload ? "eager" : "lazy"} className={styles.image} />
        </div>
      ))}

      {canSlide && (
        <>
          <CursorTarget
            as="button"
            type="previous"
            aria-label="Previous image"
            className={styles.previous}
            onClick={() => slide(-1)}
          />
          <CursorTarget
            as="button"
            type="next"
            aria-label="Next image"
            className={styles.next}
            onClick={() => slide(1)}
          />
        </>
      )}
    </div>
  );
}
