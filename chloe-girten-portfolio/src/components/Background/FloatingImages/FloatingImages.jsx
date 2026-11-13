"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { usePieceStore } from "@/store/store";
import { floatingImgData } from "@/data/floatingImgData";
import { images_config } from "./imageList";
import styles from "./style.module.scss";

function mod(n, m) {
  return ((n % m) + m) % m;
}

const CONFIG = {
  GLOBAL_SPEED: 3,
  // Slight rotation sway while floating, in degrees.
  ROTATION_AMPLITUDE: 4,
};

// Ratio of the viewport, from its center.
const TARGET_POSITION = [0.2, 0];
// Box every selected image fits into, whatever its base size: ratio of the viewport [width, height].
const TARGET_SIZE = [1, 1];
const TRANSITION_DURATION = 1.2;
const RESUME_DURATION = 0.8;
// Slow down of the other images while a piece is selected.
const SLOWDOWN_DURATION = 1.2;
const IMAGE_CONFIGS = images_config;

function FloatingImage({
  id,
  index,
  elementRef,
  height,
  rotation,
  direction,
  speed,
  amplitude,
  frequency,
  phase,
  onSelect,
}) {
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
        elementRef.current[index] = element && {
          element,
          motion: motionRef.current,
          bounds: { width: 0, height: 0 },
          rotation,
          angle: (direction * Math.PI) / 180,
          speed,
          amplitude,
          frequency,
          phase,
        };
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
        const diagonal = Math.hypot(item.element.offsetWidth, item.element.offsetHeight);
        item.bounds = {
          width: stageDimensions.current.width + diagonal,
          height: stageDimensions.current.height + diagonal,
        };
      });
    };
    measure();

    IMAGE_CONFIGS.forEach(({ basePosition }, index) => {
      const item = elementRef.current[index];
      if (!item) return;
      item.motion.x = basePosition[0] * item.bounds.width;
      item.motion.y = basePosition[1] * item.bounds.height;
      gsap.set(item.element, {
        xPercent: -50,
        yPercent: -50,
        x: item.motion.x,
        y: item.motion.y,
        rotation: item.motion.rotation,
        autoAlpha: 1,
      });
    });

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
      const delta = (deltaTime / 1000) * globalMotion.current.speed;

      elementRef.current.forEach((item) => {
        if (!item || item.motion.selected) return;

        const { element, motion, bounds, rotation, angle, speed: imageSpeed, amplitude, frequency, phase } = item;
        // Advance from the current position so floating resumes smoothly after deselection.
        const distance = delta * imageSpeed * CONFIG.GLOBAL_SPEED * motion.speed;
        const previousTime = motion.time;
        motion.time += delta * motion.speed;
        const angularFrequency = frequency * Math.PI * 2;
        // Independent waves on each axis, paused during selection and resumed smoothly.
        const wobbleX =
          amplitude *
          (Math.sin(motion.time * angularFrequency + phase[0]) - Math.sin(previousTime * angularFrequency + phase[0]));
        const wobbleY =
          amplitude *
          (Math.sin(motion.time * angularFrequency * 0.83 + phase[1]) -
            Math.sin(previousTime * angularFrequency * 0.83 + phase[1]));
        const offsetX = Math.cos(angle) * distance + wobbleX;
        const offsetY = Math.sin(angle) * distance + wobbleY;

        motion.x = mod(motion.x + offsetX + bounds.width / 2, bounds.width) - bounds.width / 2;
        motion.y = mod(motion.y + offsetY + bounds.height / 2, bounds.height) - bounds.height / 2;
        // Sway around the base rotation, starting from it at time 0.
        motion.rotation =
          rotation +
          CONFIG.ROTATION_AMPLITUDE *
            (Math.sin(motion.time * angularFrequency * 0.6 + phase[0]) - Math.sin(phase[0]));

        gsap.set(element, { x: motion.x, y: motion.y, rotation: motion.rotation });
      });
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div className={styles.stage} ref={stageRef}>
      {IMAGE_CONFIGS.map((image, index) => (
        <FloatingImage key={image.id} {...image} index={index} elementRef={elementRef} onSelect={handleSelect} />
      ))}
    </div>
  );
}
