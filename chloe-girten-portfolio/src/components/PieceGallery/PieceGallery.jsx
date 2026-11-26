"use client";

// Loads straight from the Sanity image CDN at the size next/image asks for.
import { Image } from "next-sanity/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { useCursorStore, usePieceTransitionStore } from "@/store/store";
import {
  createGhost,
  FADE_DURATION,
  FADE_EASE,
  fadeOutGhost,
  Flip,
  getPageScroll,
  getPanel,
  motionDuration,
  PANEL_DURATION,
  PANEL_EASE,
  pieceFlipId,
  playOnNextTick,
  RIPPLE_MAX_CELLS,
  RIPPLE_START,
  RIPPLE_STEP,
} from "../PieceDetail/transition";
import styles from "./style.module.scss";

const backgroundVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
};

// Page of a piece: its slug, or its id while it has none (see PIECES_QUERY).
const pieceHref = (slug) => `/pieces/${slug}`;

// Part of an item that Flip moves (see PieceGalleryItem).
const getVisual = (item) => item.querySelector("[data-flip-id]");

export default function PieceGallery({ items }) {
  const router = useRouter();
  const clearHovered = useCursorStore((state) => state.clearHovered);
  const setFlipState = usePieceTransitionStore((state) => state.setFlipState);
  const setGridScroll = usePieceTransitionStore((state) => state.setGridScroll);

  const galleryRef = useRef(null);
  // A piece is opening: further clicks are ignored until the page changes.
  const openingRef = useRef(false);
  // Piece page closed to come here (see PieceDetail), read once. In state, not taken from the
  // store in the effect: React runs the effect twice in development (Strict Mode), and the
  // second run must play the return too.
  const [returning] = useState(() => usePieceTransitionStore.getState().returnState);
  // Item showing its photo with its background, like the piece page's image, until that image
  // has landed in it: then the background fades out, as at the end of a hover.
  const [heldId, setHeldId] = useState(returning?.id ?? null);

  // Leaving the page while hovering a piece would keep the cursor follower visible.
  useEffect(() => () => clearHovered("piece"), [clearHovered]);

  // Left by an opening that didn't finish: must not play on a later visit.
  useEffect(() => setFlipState(null), [setFlipState]);

  // Back from a piece page, before paint: the opening played backwards. The image goes from the
  // top of the piece page back into its item while the panel goes back to its size, then the
  // other items come back around it, the nearest first.
  // Runs before Inner's effect (a parent), which leaves the panel alone once it's animated here.
  useLayoutEffect(() => {
    if (!returning) return;
    usePieceTransitionStore.getState().setReturnState(null);

    const gallery = galleryRef.current;
    const visual = gallery.querySelector(`[data-flip-id="${pieceFlipId(returning.id)}"]`);
    // The piece isn't in the grid anymore: Inner fades the grid in instead.
    if (!visual) return;
    const item = visual.parentElement;
    const panel = getPanel(gallery);

    // The grid scrolled back to where it was when the piece was opened, or, if the item isn't
    // fully visible there (reached the piece page another way, window resized), to the item.
    const scroller = getPageScroll(gallery);
    if (scroller) {
      scroller.scrollTop = usePieceTransitionStore.getState().gridScroll;
      const itemRect = item.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      if (itemRect.top < scrollerRect.top || itemRect.bottom > scrollerRect.bottom) {
        scroller.scrollTop += itemRect.top - scrollerRect.top - (scrollerRect.height - itemRect.height) / 2;
      }
    }

    // Distance of each other item from this one, in cells: their delay in the ripple.
    const others = [...gallery.children].filter((child) => child !== item);
    const rippleDelay = (index, other) => {
      const distance = Math.hypot(
        (other.offsetLeft - item.offsetLeft) / item.offsetWidth,
        (other.offsetTop - item.offsetTop) / item.offsetHeight,
      );
      return motionDuration(Math.min(distance, RIPPLE_MAX_CELLS) * RIPPLE_STEP);
    };

    const duration = motionDuration(PANEL_DURATION);
    // Every starting state is applied now, before paint; the movement starts on the next tick.
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ paused: true, onComplete: () => setHeldId(null) });
      // Same as the opening (see PieceDetail), the other way round.
      timeline.add(
        Flip.from(returning.state, {
          targets: [visual, panel],
          scale: false,
          nested: true,
          // Over the other items, which come back meanwhile.
          zIndex: 1,
          duration,
          ease: PANEL_EASE,
        }),
        0,
      );
      // The rest of the piece page fades out under the image.
      if (returning.ghost) timeline.add(fadeOutGhost(returning.ghost), 0);
      // The grid forms again around the piece: the other items, and the item's own lines.
      timeline.fromTo(
        others,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: motionDuration(FADE_DURATION), ease: FADE_EASE, stagger: rippleDelay },
        duration * RIPPLE_START,
      );
      timeline.fromTo(
        item,
        { borderColor: "rgba(0, 0, 0, 0)" },
        { borderColor: "rgba(0, 0, 0, 1)", duration: motionDuration(FADE_DURATION), ease: FADE_EASE, clearProps: "borderColor" },
        duration * RIPPLE_START,
      );
      playOnNextTick(timeline);
    });
    return () => context.revert();
  }, [returning]);

  // Opens the piece page, which flips the clicked item's image into place (see PieceDetail).
  // The grid is replaced as soon as the page changes: a copy of it stays in the panel,
  // for the other items to fade out while the image and the panel move.
  const openPiece = (id, slug, item) => {
    if (openingRef.current) return;
    openingRef.current = true;
    const gallery = galleryRef.current;
    // Where the grid will be back when the piece closes.
    setGridScroll(getPageScroll(gallery)?.scrollTop ?? 0);
    setFlipState({
      id,
      // The panel too: it resizes with the image.
      state: Flip.getState([getVisual(item), getPanel(item)]),
      ghost: createGhost(gallery, item),
    });
    router.push(pieceHref(slug));
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
          held={item.id === heldId}
          onOpen={(element) => openPiece(item.id, item.slug, element)}
          onPrefetch={() => router.prefetch(pieceHref(item.slug))}
        />
      ))}
    </div>
  );
}

// The photo with its background sits under the cut-out and fades in on hover (or while `held`).
// The images are in a layer of their own, the part Flip moves between the grid and the piece
// page: it's out of the flow, so the item keeps its place in the grid while it's resized.
function PieceGalleryItem({ id, src, noBgSrc, name, held, onOpen, onPrefetch }) {
  const setHovered = useCursorStore((state) => state.setHovered);
  const clearHovered = useCursorStore((state) => state.clearHovered);
  const variant = held ? "hover" : "rest";

  return (
    <motion.div
      className={styles.galleryItem}
      initial={variant}
      animate={variant}
      whileHover="hover"
      onHoverStart={() => {
        setHovered("piece");
        // The piece page is ready by the time the click comes.
        onPrefetch();
      }}
      onHoverEnd={() => clearHovered("piece")}
      onClick={(event) => onOpen(event.currentTarget)}
    >
      {/* Same id as the piece page's image, which Flip animates from and back to this layer. */}
      <div className={styles.visual} data-flip-id={pieceFlipId(id)}>
        <motion.div
          className={styles.background}
          variants={backgroundVariants}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* Coming back from the piece page, it's seen at once, big: no lazy loading. */}
          <Image
            src={src}
            alt=""
            aria-hidden="true"
            className={styles.image}
            fill
            sizes="33vw"
            loading={held ? "eager" : undefined}
          />
        </motion.div>
        <Image src={noBgSrc} alt={name} className={styles.image} fill sizes="33vw" />
      </div>
    </motion.div>
  );
}
