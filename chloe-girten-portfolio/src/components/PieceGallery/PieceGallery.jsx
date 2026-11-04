"use client";

// Loads straight from the Sanity image CDN at the size next/image asks for.
import { Image } from "next-sanity/image";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useCursorStore } from "@/store/store";
import styles from "./style.module.scss";

const backgroundVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
};

export default function PieceGallery({ items }) {
  const clearHovered = useCursorStore((state) => state.clearHovered);

  // Leaving the page while hovering a piece would keep the cursor follower visible.
  useEffect(() => () => clearHovered("piece"), [clearHovered]);

  return (
    <div className={styles.gallery}>
      {items.map((item) => (
        <PieceGalleryItem key={item.id} id={item.id} src={item.url} noBgSrc={item.urlNoBg} name={item.title} />
      ))}
    </div>
  );
}

// The photo with its background sits under the cut-out and fades in on hover.
function PieceGalleryItem({ id, src, noBgSrc, name }) {
  const setHovered = useCursorStore((state) => state.setHovered);
  const clearHovered = useCursorStore((state) => state.clearHovered);

  return (
    <motion.div
      className={styles.galleryItem}
      initial="rest"
      animate="rest"
      whileHover="hover"
      onHoverStart={() => setHovered("piece")}
      onHoverEnd={() => clearHovered("piece")}
      onClick={() => console.log(id)}
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
