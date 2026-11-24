"use client";

// Loads straight from the Sanity image CDN at the size next/image asks for.
import { Image } from "next-sanity/image";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { useCursorStore, usePieceTransitionStore } from "@/store/store";
import { FADE_DURATION, FADE_EASE, Flip, getPanel, motionDuration, pieceFlipId } from "../PieceDetail/transition";
import styles from "./style.module.scss";

const backgroundVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
};

const pieceHref = (id) => `/pieces/${id}`;

export default function PieceGallery({ items }) {
  const router = useRouter();
  const clearHovered = useCursorStore((state) => state.clearHovered);
  const setFlipState = usePieceTransitionStore((state) => state.setFlipState);

  const galleryRef = useRef(null);
  // Fade of the other items, until the piece page opens.
  const openingRef = useRef(null);

  // Leaving the page while hovering a piece would keep the cursor follower visible.
  useEffect(() => () => clearHovered("piece"), [clearHovered]);

  useEffect(() => {
    // A Flip state left by an opening that didn't finish must not play on a later visit.
    setFlipState(null);
    return () => openingRef.current?.kill();
  }, [setFlipState]);

  // The other items fade out, then the piece page opens and flips the clicked one into place.
  const openPiece = (id, element) => {
    if (openingRef.current) return;
    const others = [...galleryRef.current.children].filter((child) => child !== element);
    const open = () => {
      // Measured last, right before the page changes. The panel too: it resizes with the image.
      setFlipState({ id, state: Flip.getState([element, getPanel(element)]) });
      router.push(pieceHref(id));
    };
    // A single piece: nothing to fade, it opens straight away.
    openingRef.current = others.length
      ? gsap.to(others, {
          autoAlpha: 0,
          duration: motionDuration(FADE_DURATION),
          ease: FADE_EASE,
          onComplete: open,
        })
      : gsap.delayedCall(0, open);
  };

  return (
    <div className={styles.gallery} ref={galleryRef}>
      {items.map((item) => (
        <PieceGalleryItem
          key={item.id}
          id={item.id}
          src={item.url}
          noBgSrc={item.urlNoBg}
          name={item.title}
          onOpen={openPiece}
          onPrefetch={() => router.prefetch(pieceHref(item.id))}
        />
      ))}
    </div>
  );
}

// The photo with its background sits under the cut-out and fades in on hover.
function PieceGalleryItem({ id, src, noBgSrc, name, onOpen, onPrefetch }) {
  const setHovered = useCursorStore((state) => state.setHovered);
  const clearHovered = useCursorStore((state) => state.clearHovered);

  return (
    <motion.div
      className={styles.galleryItem}
      // Same id as the piece page's image, which Flip animates from this item.
      data-flip-id={pieceFlipId(id)}
      initial="rest"
      animate="rest"
      whileHover="hover"
      onHoverStart={() => {
        setHovered("piece");
        // The piece page is ready by the time the click comes.
        onPrefetch();
      }}
      onHoverEnd={() => clearHovered("piece")}
      onClick={(event) => onOpen(id, event.currentTarget)}
    >
      <motion.div
        className={styles.background}
        variants={backgroundVariants}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <Image src={src} alt="" aria-hidden="true" className={styles.image} fill sizes="33vw" />
      </motion.div>
      <Image src={noBgSrc} alt={name} className={styles.image} fill sizes="33vw" />
    </motion.div>
  );
}
