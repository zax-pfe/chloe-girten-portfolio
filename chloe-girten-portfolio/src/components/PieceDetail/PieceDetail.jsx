"use client";

// Loads straight from the Sanity image CDN at the size next/image asks for.
import { Image } from "next-sanity/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { usePieceTransitionStore } from "@/store/store";
import {
  FADE_DURATION,
  FADE_EASE,
  Flip,
  getPanel,
  PANEL_DURATION,
  PANEL_EASE,
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

  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const sharpRef = useRef(null);
  const titleRef = useRef(null);
  const moreRef = useRef(null);
  // Flip state taken from the store on the first run. Kept here because React runs the effect
  // twice in development (Strict Mode), and the second run must flip too.
  const flipRef = useRef(undefined);

  // Opening, before paint. The title and the rest are hidden in CSS until revealed here.
  useLayoutEffect(() => {
    const hero = heroRef.current;
    const reveal = [titleRef.current, moreRef.current];
    if (flipRef.current === undefined) {
      const { flipState, setFlipState } = usePieceTransitionStore.getState();
      // Only the state of this piece's grid item: another one, left over, is ignored.
      flipRef.current = flipState?.id === piece.id ? flipState.state : null;
      setFlipState(null);
    }
    const flip = flipRef.current;

    const context = gsap.context(() => {
      if (flip) {
        // From the grid item to the top of the panel, with the panel shrinking to portrait.
        // Resizing instead of scaling: the image is cropped (cover) at every step instead of
        // stretched, and the panel keeps its border and radius.
        Flip.from(flip, {
          targets: [hero, getPanel(hero)],
          scale: false,
          duration: motionDuration(PANEL_DURATION),
          ease: PANEL_EASE,
        });
        gsap.to(reveal, {
          autoAlpha: 1,
          duration: motionDuration(FADE_DURATION),
          ease: FADE_EASE,
          delay: motionDuration(PANEL_DURATION),
        });
      } else {
        // Reached another way (link, back/forward): everything fades in while the panel resizes.
        gsap.fromTo(
          [hero, ...reveal],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: motionDuration(FADE_DURATION), ease: FADE_EASE },
        );
      }
    });
    return () => context.revert();
  }, [piece.id]);

  // Closing (close zones, Escape): the page fades out, then the grid comes back (see Inner).
  useEffect(() => {
    if (!isClosing) return;
    const tween = gsap.to(rootRef.current, {
      autoAlpha: 0,
      duration: motionDuration(FADE_DURATION),
      ease: FADE_EASE,
      onComplete: () => router.push("/pieces"),
    });
    return () => tween.kill();
  }, [isClosing, router]);

  useEffect(() => endClose, [endClose]);

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

      <div className={styles.hero} ref={heroRef} data-flip-id={pieceFlipId(piece.id)}>
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
