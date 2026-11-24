"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { usePieceStore } from "@/store/store";
import { floatingImgData } from "@/data/floatingImgData";
import { addDebugFolder } from "@/utils/debug";
import { images_config } from "./imageList";
import { stepMotion } from "./motion/engine";
import { setupMotionDebug } from "./motion/debugPanel";
import styles from "./style.module.scss";

// The way pieces move is picked and tuned in ./motion (motionConfig.js, or live with #debug).

// Ratio of the viewport, from its center.
const TARGET_POSITION = [0.2, 0];
// Box every selected image fits into, whatever its base size: ratio of the viewport [width, height].
const TARGET_SIZE = [1, 1];
const TRANSITION_DURATION = 1.2;
const RESUME_DURATION = 0.8;
// Slow down of the other images while a piece is selected.
const SLOWDOWN_DURATION = 1.2;
const IMAGE_CONFIGS = images_config;

function FloatingImage({ config, index, elementRef, onSelect }) {
  const { id, height, rotation } = config;
  const isSelected = usePieceStore((state) => state.isModalOpen && state.selectedPiece?.id === id);
  const clearPiece = usePieceStore((state) => state.clearPiece);

  const { image, title } = floatingImgData.find((piece) => piece.id === id);
  const aspect = image.width / image.height;
  // Largest width the image is shown at: selected, contained in the TARGET_SIZE box.
  const selectedSizes = `min(${TARGET_SIZE[0] * 100}vw, ${Math.round(TARGET_SIZE[1] * 100 * aspect)}vh)`;

  const imageRef = useRef(null);
  const returningRef = useRef(false);
  const originalTransform = useRef(null);
  // Position on the stage, float time and speed factor, read by the shared ticker.
  const motionRef = useRef({ x: 0, y: 0, rotation, time: 0, speed: 1, selected: false });
  // Read by the motion engine (./motion/engine.js); sizes are measured by the stage.
  const itemRef = useRef(null);

  useEffect(() => {
    const element = imageRef.current;
    const motion = motionRef.current;
    return () => {
      gsap.killTweensOf(element);
      gsap.killTweensOf(motion);
    };
  }, []);

  useEffect(() => {
    const element = imageRef.current;
    const motion = motionRef.current;
    const options = { duration: TRANSITION_DURATION, ease: "power3.inOut", overwrite: true };

    if (isSelected) {
      gsap.killTweensOf(motion);
      motion.speed = 0;
      motion.selected = true;
      originalTransform.current = { x: motion.x, y: motion.y, rotation: motion.rotation };
      gsap.set(element, { zIndex: 10 });
      gsap.to(element, {
        x: TARGET_POSITION[0] * window.innerWidth,
        y: TARGET_POSITION[1] * window.innerHeight,
        rotation: 0,
        // Contain fit, so every image ends up the same size.
        scale: Math.min(
          (TARGET_SIZE[0] * window.innerWidth) / element.offsetWidth,
          (TARGET_SIZE[1] * window.innerHeight) / element.offsetHeight,
        ),
        ...options,
      });
    } else if (motion.selected && originalTransform.current) {
      returningRef.current = true;
      const original = originalTransform.current;
      gsap.to(element, {
        x: original.x,
        y: original.y,
        rotation: original.rotation,
        scale: 1,
        ...options,
        onComplete: () => {
          motion.selected = false;
          returningRef.current = false;
          gsap.set(element, { clearProps: "zIndex" });
          gsap.to(motion, {
            speed: 1,
            duration: RESUME_DURATION,
            ease: "power2.inOut",
            overwrite: true,
          });
          clearPiece();
        },
      });
    }
  }, [isSelected, clearPiece]);

  return (
    <button
      type="button"
      className={styles.image}
      aria-label={title}
      style={{ height: `${height}vh`, aspectRatio: aspect }}
      ref={(element) => {
        imageRef.current = element;
        itemRef.current ??= { motion: motionRef.current, config, index, bounds: { width: 0, height: 0 }, radius: 0 };
        itemRef.current.element = element;
        elementRef.current[index] = element && itemRef.current;
      }}
      onClick={() => {
        if (!returningRef.current) onSelect(id);
      }}
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes={selectedSizes}
        draggable={false}
        className={styles.img}
      />
    </button>
  );
}

export default function FloatingImages() {
  const stageRef = useRef(null);
  const stageDimensions = useRef({ width: 0, height: 0 });
  const elementRef = useRef([]);
  // Speed factor shared by every image, eased to 0 while a piece is selected.
  const globalMotion = useRef({ speed: 1 });
  // Stays true until the selected piece is back in place.
  const hasSelection = usePieceStore((state) => state.selectedPiece !== null);

  const handleSelect = (id) => {
    const { selectedPiece, openPiece } = usePieceStore.getState();
    // An open piece is closed by the close zone over the screen (CloseZone);
    // a closing one has to be back in place before another can open.
    if (selectedPiece) return;
    openPiece(floatingImgData.find((piece) => piece.id === id));
  };

  // ______________________ STAGE SIZE & INITIAL POSITIONS ______________________//

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const measure = () => {
      stageDimensions.current = { width: stage.offsetWidth, height: stage.offsetHeight };

      // Each image wraps on the stage extended by its diagonal (covers any rotation),
      // so it reappears as soon as it has fully left the screen.
      elementRef.current.forEach((item) => {
        if (!item) return;
        const { offsetWidth, offsetHeight } = item.element;
        const diagonal = Math.hypot(offsetWidth, offsetHeight);
        item.bounds = {
          width: stageDimensions.current.width + diagonal,
          height: stageDimensions.current.height + diagonal,
        };
        // Size used to keep pieces apart.
        item.radius = (offsetWidth + offsetHeight) / 4;
      });
    };
    measure();

    IMAGE_CONFIGS.forEach(({ basePosition }, index) => {
      const item = elementRef.current[index];
      if (!item) return;
      item.motion.x = basePosition[0] * item.bounds.width;
      item.motion.y = basePosition[1] * item.bounds.height;
      gsap.set(item.element, { xPercent: -50, yPercent: -50 });
    });
    // Places every piece with the active motion mode before showing it.
    stepMotion(elementRef.current, 0, stageDimensions.current);
    elementRef.current.forEach((item) => item && gsap.set(item.element, { autoAlpha: 1 }));

    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // ______________________ SLOW DOWN ON SELECTION ______________________//

  useEffect(() => {
    gsap.to(globalMotion.current, {
      speed: hasSelection ? 0 : 1,
      duration: hasSelection ? SLOWDOWN_DURATION : RESUME_DURATION,
      ease: "power2.inOut",
      overwrite: true,
    });
  }, [hasSelection]);

  useEffect(() => {
    const motion = globalMotion.current;
    return () => gsap.killTweensOf(motion);
  }, []);

  // ______________________ TICKER LOOP ______________________//

  useEffect(() => {
    const tick = (_time, deltaTime) => {
      stepMotion(elementRef.current, (deltaTime / 1000) * globalMotion.current.speed, stageDimensions.current);
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // ______________________ DEBUG PANEL (#debug) ______________________//

  useEffect(() => addDebugFolder((gui) => setupMotionDebug(gui, stageRef.current)), []);

  return (
    <div className={styles.stage} ref={stageRef}>
      {IMAGE_CONFIGS.map((image, index) => (
        <FloatingImage key={image.id} config={image} index={index} elementRef={elementRef} onSelect={handleSelect} />
      ))}
    </div>
  );
}
