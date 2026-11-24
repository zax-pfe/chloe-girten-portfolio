"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { usePieceStore } from "@/store/store";
import { floatingImgData } from "@/data/floatingImgData";
import { images_config } from "./imageList";
import { getInitialMovement } from "./movement";
import { createMovementRuntime, createPiece } from "./movement/runtime";
import styles from "./style.module.scss";

// How pieces float is up to the active movement variant (./movement, see its README).

// Ratio of the viewport, from its center.
const TARGET_POSITION = [0.2, 0];
// Box every selected image fits into, whatever its base size: ratio of the viewport [width, height].
const TARGET_SIZE = [1, 1];
const TRANSITION_DURATION = 1.2;
const RESUME_DURATION = 0.8;
// Slow down of the other images while a piece is selected.
const SLOWDOWN_DURATION = 1.2;
const IMAGE_CONFIGS = images_config;

function FloatingImage({ data, index, piecesRef, onSelect }) {
  const { id, height } = data;
  const isSelected = usePieceStore((state) => state.isModalOpen && state.selectedPiece?.id === id);
  const clearPiece = usePieceStore((state) => state.clearPiece);

  const { image, title } = floatingImgData.find((piece) => piece.id === id);
  const aspect = image.width / image.height;
  // Largest width the image is shown at: selected, contained in the TARGET_SIZE box.
  const selectedSizes = `min(${TARGET_SIZE[0] * 100}vw, ${Math.round(TARGET_SIZE[1] * 100 * aspect)}vh)`;

  const imageRef = useRef(null);
  const returningRef = useRef(false);
  const originalTransform = useRef(null);
  // Piece moved by the movement runtime; `held` and `speed` hand it over during a selection.
  const pieceRef = useRef(null);

  useEffect(() => {
    const element = imageRef.current;
    const piece = pieceRef.current;
    return () => {
      gsap.killTweensOf(element);
      gsap.killTweensOf(piece);
    };
  }, []);

  useEffect(() => {
    const element = imageRef.current;
    const piece = pieceRef.current;
    const options = { duration: TRANSITION_DURATION, ease: "power3.inOut", overwrite: true };

    if (isSelected) {
      gsap.killTweensOf(piece);
      piece.speed = 0;
      piece.held = true;
      originalTransform.current = { ...piece.rendered };
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
    } else if (piece.held && originalTransform.current) {
      returningRef.current = true;
      const original = originalTransform.current;
      gsap.to(element, {
        x: original.x,
        y: original.y,
        rotation: original.rotation,
        scale: original.scale,
        ...options,
        onComplete: () => {
          piece.held = false;
          returningRef.current = false;
          gsap.set(element, { clearProps: "zIndex" });
          gsap.to(piece, {
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
        pieceRef.current ??= createPiece(data, index);
        pieceRef.current.element = element;
        piecesRef.current[index] = element && pieceRef.current;
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
  const piecesRef = useRef([]);
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

  // ______________________ MOVEMENT RUNTIME ______________________//

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const pieces = piecesRef.current.filter(Boolean);
    pieces.forEach((piece) => gsap.set(piece.element, { xPercent: -50, yPercent: -50 }));

    const runtime = createMovementRuntime({ pieces, stage, timeScale: globalMotion.current });
    runtime.measure();
    runtime.setVariant(getInitialMovement());
    pieces.forEach((piece) => gsap.set(piece.element, { autoAlpha: 1 }));

    const observer = new ResizeObserver(() => runtime.measure());
    observer.observe(stage);
    const tick = (_time, deltaTime) => runtime.tick(deltaTime / 1000);
    gsap.ticker.add(tick);

    // Debug panel, development only (never part of the production bundle).
    let destroyPanel = null;
    let cancelled = false;
    if (process.env.NODE_ENV === "development") {
      import("./movement/debug/panel").then(({ createMovementPanel }) => {
        if (!cancelled) destroyPanel = createMovementPanel(runtime, stage);
      });
    }

    return () => {
      cancelled = true;
      destroyPanel?.();
      gsap.ticker.remove(tick);
      observer.disconnect();
      runtime.destroy();
    };
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

  return (
    <div className={styles.stage} ref={stageRef}>
      {IMAGE_CONFIGS.map((image, index) => (
        <FloatingImage key={image.id} data={image} index={index} piecesRef={piecesRef} onSelect={handleSelect} />
      ))}
    </div>
  );
}
