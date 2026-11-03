"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./style.module.scss";

const backgroundVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
};

export default function Gallery({ items }) {
  return (
    <div className={styles.gallery}>
      {items.map((item, index) => (
        <GalleryItem key={`${item.url}-${index}`} src={item.url} noBgSrc={item.urlNoBg} name={item.title} />
      ))}
    </div>
  );
}

function GalleryItem({ src, noBgSrc, name }) {
  // Without a cut-out version, the image is shown with its background.
  if (!noBgSrc) {
    return (
      <div className={styles.galleryItem}>
        <Image src={src} alt={name} className={styles.image} fill sizes="33vw" />
      </div>
    );
  }

  // The photo with its background sits under the cut-out and fades in on hover.
  return (
    <motion.div className={styles.galleryItem} initial="rest" animate="rest" whileHover="hover">
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
