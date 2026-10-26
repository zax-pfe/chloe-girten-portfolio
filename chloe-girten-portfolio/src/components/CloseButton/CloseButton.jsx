"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import ButtonSVG from "./ButtonSVG";
import styles from "./style.module.scss";

const closeButtonVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};

export default function CloseButton() {
  const pathname = usePathname();
  const isRootPage = pathname === "/";

  return (
    <AnimatePresence>
      {!isRootPage && (
        <motion.div
          className={styles.closeButtonContainer}
          variants={closeButtonVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <Link href="/" className={styles.closeButton} aria-label="Fermer et revenir à l’accueil">
            <ButtonSVG />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
