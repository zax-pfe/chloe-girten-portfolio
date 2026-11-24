"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { usePieceStore } from "@/store/store";
import { floatingImgData } from "@/data/floatingImgData";
import { getInitialMovement } from "./movement";
import { createMovementRuntime, createPiece, dragSettings } from "./movement/runtime";
import { applyElastic, releaseVelocity, throwPiece } from "./drag";
import styles from "./style.module.scss";

// How pieces float is up to the active movement variant (./movement, see its README).

// Ratio of the viewport, from its center.
const TARGET_POSITION = [0.2, 0];
const TRANSITION_DURATION = 1.2;
// A piece easing back into its float, once back in place or dropped. The others never stop.
const RESUME_DURATION = 0.8;
// Pointer travel, in px, past which a press becomes a drag instead of a click.
const DRAG_THRESHOLD = 6;

function FloatingImage({ data, index, piecesRef, onSelect }) {
  const { id, image, title } = data;
  const isSelected = usePieceStore((state) => state.isModalOpen && state.selectedPiece?.id === id);
  const clearPiece = usePieceStore((state) => state.clearPiece);

  const aspect = image.width / image.height;
  // Largest width the image is shown at: opened, contained in the screen.
  const selectedSizes = `min(100vw, ${Math.round(100 * aspect)}vh)`;

  const imageRef = useRef(null);
  const returningRef = useRef(false);
  const originalTransform = useRef(null);
  // Piece moved by the movement runtime; `held` and `activity` hand it over during a selection or a drag.
  const pieceRef = useRef(null);
  // Current press: where it started, and whether it turned into a drag.
  const dragRef = useRef(null);
  // The click that ends a drag must not open the piece.
  const draggedRef = useRef(false);
  // Momentum and bounce after a drag, until the piece floats again.
  const throwRef = useRef(null);

  useEffect(() => {
    const element = imageRef.current;
    const piece = pieceRef.current;
    return () => {
      throwRef.current?.stop();
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
      piece.activity = 0;
      piece.held = true;
      originalTransform.current = { ...piece.rendered };
      gsap.set(element, { zIndex: 10 });
      gsap.to(element, {
        x: TARGET_POSITION[0] * window.innerWidth,
        y: TARGET_POSITION[1] * window.innerHeight,
        rotation: 0,
        // Contain fit in the screen, times the piece's open size.
        scale:
          piece.scaleOpen *
          Math.min(window.innerWidth / element.offsetWidth, window.innerHeight / element.offsetHeight),
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
            activity: 1,
            duration: RESUME_DURATION,
            ease: "power2.inOut",
            overwrite: true,
          });
          clearPiece();
        },
      });
    }
  }, [isSelected, clearPiece]);

  // ______________________ DRAG ______________________//

  // Where the piece's center may be dropped: the whole piece inside the screen.
  const getDragBounds = () => {
    const piece = pieceRef.current;
    const maxX = Math.max(0, (window.innerWidth - piece.width) / 2);
    const maxY = Math.max(0, (window.innerHeight - piece.height) / 2);
    return { minX: -maxX, maxX, minY: -maxY, maxY };
  };

  const movePiece = (x, y) => {
    const piece = pieceRef.current;
    piece.rendered.x = x;
    piece.rendered.y = y;
    piece.placed = true;
    gsap.set(imageRef.current, { x, y });
  };

  // Floats again from where it is, easing back to its speed.
  const releasePiece = () => {
    const piece = pieceRef.current;
    throwRef.current = null;
    piece.held = false;
    piece.activity = 0;
    gsap.set(imageRef.current, { clearProps: "zIndex" });
    gsap.to(piece, { activity: 1, duration: RESUME_DURATION, ease: "power2.inOut", overwrite: true });
  };

  const handlePointerDown = (event) => {
    const piece = pieceRef.current;
    const throwing = throwRef.current;
    // Held without a throw: the piece is selected.
    if (event.button !== 0 || returningRef.current || (piece.held && !throwing)) return;
    throwing?.stop();
    throwRef.current = null;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: piece.rendered.x,
      y: piece.rendered.y,
      // Caught while thrown: it's a drag straight away.
      active: Boolean(throwing),
      samples: [{ t: event.timeStamp, x: event.clientX, y: event.clientY }],
    };
    draggedRef.current = Boolean(throwing);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const piece = pieceRef.current;
    if (!drag.active) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      // Becomes a drag: the runtime lets go of the piece.
      drag.active = true;
      draggedRef.current = true;
      gsap.killTweensOf(piece);
      piece.held = true;
      gsap.set(imageRef.current, { zIndex: 10 });
    }
    drag.samples.push({ t: event.timeStamp, x: event.clientX, y: event.clientY });
    if (drag.samples.length > 20) drag.samples.shift();
    const bounds = getDragBounds();
    movePiece(
      applyElastic(drag.x + dx, bounds.minX, bounds.maxX, dragSettings.elastic),
      applyElastic(drag.y + dy, bounds.minY, bounds.maxY, dragSettings.elastic),
    );
  };

  const handlePointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (!drag.active) return;
    // Thrown: momentum, bounce back inside the screen, then floats again.
    const piece = pieceRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    throwRef.current = throwPiece({
      x: piece.rendered.x,
      y: piece.rendered.y,
      velocity: reduced ? { x: 0, y: 0 } : releaseVelocity(drag.samples, event.timeStamp),
      bounds: getDragBounds(),
      options: dragSettings,
      onUpdate: movePiece,
      onComplete: releasePiece,
    });
  };

  return (
    <button
      type="button"
      className={styles.image}
      aria-label={title}
      // Height is set by the movement runtime (scaleFloating).
      style={{ aspectRatio: aspect }}
      ref={(element) => {
        imageRef.current = element;
        pieceRef.current ??= createPiece(data, index);
        pieceRef.current.element = element;
        piecesRef.current[index] = element && pieceRef.current;
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={() => {
        if (draggedRef.current) {
          draggedRef.current = false;
          return;
        }
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

    const runtime = createMovementRuntime({ pieces, stage });
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

  return (
    <div className={styles.stage} ref={stageRef}>
      {floatingImgData.map((piece, index) => (
        <FloatingImage key={piece.id} data={piece} index={index} piecesRef={piecesRef} onSelect={handleSelect} />
      ))}
    </div>
  );
}
