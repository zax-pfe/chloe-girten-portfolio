"use client";

// Loads straight from the Sanity image CDN at the size next/image asks for.
import { Image } from "next-sanity/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import { ReactLenis } from "lenis/react";
import CursorTarget from "../CursorTarget/CursorTarget";
import styles from "./style.module.scss";

const TITLE_ID = "piece-detail-title";

// Light fade in of the whole panel when it opens.
const PANEL_FADE = { duration: 0.3, ease: "power1.out" };

// Panel of a piece, over the blurred gallery (blurred by Inner): its photos, then its details.
// It closes by clicking anywhere else (shows "close x") or with Escape, back to /pieces.
export default function PieceDetail({ piece }) {
  const router = useRouter();
  const panelRef = useRef(null);

  useEffect(() => {
    gsap.to(panelRef.current, { opacity: 1, ...PANEL_FADE });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") router.push("/pieces", { scroll: false });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <>
      <CursorTarget
        className={styles.closeZone}
        type="close"
        onClick={() => router.push("/pieces", { scroll: false })}
        aria-hidden
      />

      <section ref={panelRef} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby={TITLE_ID}>
        {/* The whole panel: shows "scroll" next to the cursor while hovered. */}
        <CursorTarget type="scroll" className={styles.content}>
          {/* Stays at the top while the photos scroll under it. */}
          <h2 id={TITLE_ID} className={styles.title}>
            {piece.title}
          </h2>

          {/* Own Lenis instance for smooth scrolling; data-lenis-prevent keeps the root one out. */}
          <ReactLenis className={styles.scroller} options={{ syncTouch: true }} data-lenis-prevent>
            {piece.images.map((src, index) => (
              <div key={`${index}-${src}`} className={styles.photo}>
                <Image src={src} alt={index === 0 ? piece.title : ""} className={styles.image} fill sizes="50vw" />
              </div>
            ))}

            <div className={styles.info}>
              {(piece.size || piece.material) && (
                <div className={styles.specs}>
                  {piece.size && <p>{piece.size}</p>}
                  {piece.material && <p>{piece.material}</p>}
                </div>
              )}
              <p className={styles.year}>{piece.date}</p>
              <p className={styles.description}>{piece.description}</p>
            </div>
          </ReactLenis>
        </CursorTarget>
      </section>
    </>
  );
}
