"use client";

// Loads straight from the Sanity image CDN at the size next/image asks for.
import { Image } from "next-sanity/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useLenis } from "lenis/react";
import { usePieceTransitionStore } from "@/store/store";
import {
  createGhost,
  FADE_DURATION,
  FADE_EASE,
  fadeOutGhost,
  Flip,
  getPanel,
  PANEL_DURATION,
  PANEL_EASE,
  REWIND_DURATION,
  REWIND_EASE,
  motionDuration,
  pieceFlipId,
} from "./transition";
import styles from "./style.module.scss";

// Placeholder content until the piece has more images and text in Sanity.
const PLACEHOLDER_IMAGE_COUNT = 2;
const PLACEHOLDER_TEXT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

// Panel width at the largest screens: 4 of 8 columns.
const HERO_SIZES = "50vw";
// Same as the grid items: the image is already loaded when the page opens.
const GRID_SIZES = "33vw";

// Page of a piece: its image at the top, filling the panel, then more about it as you scroll.
// Opened from the grid, the image flips from its grid item into place (see PieceGallery).
// Reached another way, Inner resizes the panel and the page fades in.
export default function PieceDetail({ piece }) {
  const router = useRouter();
  const isClosing = usePieceTransitionStore((state) => state.isClosing);
  const requestClose = usePieceTransitionStore((state) => state.requestClose);
  const endClose = usePieceTransitionStore((state) => state.endClose);
  const setReturnState = usePieceTransitionStore((state) => state.setReturnState);
  // Smooth scroll of this page (PageWrapper).
  const lenis = useLenis();

  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const sharpRef = useRef(null);
  const titleRef = useRef(null);
  const moreRef = useRef(null);
  // Flip state (and grid copy) taken from the store on the first run. Kept here because React
  // runs the effect twice in development (Strict Mode), and the second run must flip too.
  const flipRef = useRef(undefined);

  // Opening, before paint. The title and the rest are hidden in CSS until revealed here.
  useLayoutEffect(() => {
    const hero = heroRef.current;
    const reveal = [titleRef.current, moreRef.current];
    if (flipRef.current === undefined) {
      const { flipState, setFlipState } = usePieceTransitionStore.getState();
      // Only the state of this piece's grid item: another one, left over, is ignored.
      flipRef.current = flipState?.id === piece.id ? flipState : null;
      setFlipState(null);
    }
    const flip = flipRef.current;

    const context = gsap.context(() => {
      if (flip) {
        // From the grid item to the top of the panel, with the panel turning into a tall
        // portrait that goes up to the top of the screen.
        // Resizing instead of scaling: the image is cropped (cover) at every step instead of
        // stretched, and the panel keeps its border and radius.
        Flip.from(flip.state, {
          targets: [hero, getPanel(hero)],
          scale: false,
          // The image is inside the panel, which moves too: its own move is measured from the
          // panel's, so the two don't add up.
          nested: true,
          duration: motionDuration(PANEL_DURATION),
          ease: PANEL_EASE,
        });
        // At the same time, the copy of the grid (the other items) fades out, then goes away.
        if (flip.ghost) fadeOutGhost(flip.ghost);
        gsap.to(reveal, {
          autoAlpha: 1,
          duration: motionDuration(FADE_DURATION),
          ease: FADE_EASE,
          delay: motionDuration(PANEL_DURATION),
        });
      } else {
        // Reached another way (link, back/forward): everything fades in. When the panel has to
        // resize first, Inner keeps the whole page hidden until it's done.
        gsap.fromTo(
          [hero, ...reveal],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: motionDuration(FADE_DURATION), ease: FADE_EASE },
        );
      }
    });
    return () => context.revert();
  }, [piece.id]);

  // Closing (close zones, Escape): the opening played backwards. Scrolled down, the page first
  // scrolls back up to the image. Then back to the grid, which brings the image back into its
  // item while the panel goes back to its size (see PieceGallery). A copy of the rest of this
  // page (title, text...) stays in the panel and fades out meanwhile.
  useEffect(() => {
    if (!isClosing) return;
    let cancelled = false;
    const close = () => {
      if (cancelled) return;
      const hero = heroRef.current;
      setReturnState({
        id: piece.id,
        state: Flip.getState([hero, getPanel(hero)]),
        ghost: createGhost(rootRef.current, hero),
      });
      router.push("/pieces");
    };

    const rewindDuration = motionDuration(REWIND_DURATION);
    if (lenis && lenis.scroll > 1 && rewindDuration > 0) {
      lenis.scrollTo(0, {
        duration: rewindDuration,
        easing: gsap.parseEase(REWIND_EASE),
        // No scrolling by the user meanwhile.
        lock: true,
        force: true,
        onComplete: close,
      });
    } else {
      close();
    }
    return () => {
      cancelled = true;
    };
  }, [isClosing, lenis, piece.id, router, setReturnState]);

  useEffect(() => endClose, [endClose]);

  // The grid is ready by the time the page is closed: it changes right away on click.
  useEffect(() => {
    router.prefetch("/pieces");
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [requestClose]);

  // The sharp image covers the grid-sized one once loaded.
  const revealSharp = () => {
    gsap.to(sharpRef.current, { autoAlpha: 1, duration: motionDuration(FADE_DURATION), ease: FADE_EASE });
  };

  return (
    <article className={styles.pieceDetail} ref={rootRef}>
      {/* Stays at the top of the panel, over the images, while the page scrolls. */}
      <div className={styles.titleBar}>
        <h2 className={styles.title} ref={titleRef}>
          {piece.title}
        </h2>
      </div>

      <div
        className={styles.hero}
        ref={heroRef}
        data-flip-id={pieceFlipId(piece.id)}
        // The image's own proportions, like the images under it: shown whole, never cropped.
        style={piece.width && piece.height ? { aspectRatio: `${piece.width} / ${piece.height}`, height: "auto" } : undefined}
      >
        <Image src={piece.url} alt={piece.title} className={styles.heroImage} fill sizes={GRID_SIZES} loading="eager" />
        <Image
          src={piece.url}
          alt=""
          aria-hidden="true"
          className={`${styles.heroImage} ${styles.sharp}`}
          fill
          sizes={HERO_SIZES}
          loading="eager"
          ref={sharpRef}
          onLoad={revealSharp}
        />
      </div>

      <div className={styles.more} ref={moreRef}>
        {Array.from({ length: PLACEHOLDER_IMAGE_COUNT }, (_, index) => (
          <Image
            key={index}
            src={piece.url}
            alt=""
            className={styles.image}
            width={piece.width}
            height={piece.height}
            sizes={HERO_SIZES}
          />
        ))}
        <p className={styles.text}>{PLACEHOLDER_TEXT}</p>
      </div>
    </article>
  );
}
