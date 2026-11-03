"use client";

import { motion } from "framer-motion";
import ArrowSVG from "../ArrowSVG/ArrowSVG";
import styles from "./style.module.scss";

// Driven by the parent's "rest" / "hover" variants.
const viewButtonVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
};

export default function ViewButton({ onClick }) {
  return (
    <motion.button
      type="button"
      className={styles.viewButton}
      variants={viewButtonVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onClick={onClick}
    >
      <p>view</p>
      <ArrowSVG />
    </motion.button>
  );
}
