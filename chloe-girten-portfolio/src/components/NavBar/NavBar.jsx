"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./style.module.scss";

const MotionLink = motion.create(Link);

const navLinks = [
  { href: "/pieces", label: "Pieces" },
  { href: "/drawings", label: "Drawings" },
  { href: "/exhibitions", label: "Exhibitions" },
  { href: "/world", label: "World" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function NavBar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <div className={styles.navBarContainer}>
      <div className={styles.navBar}>
        {navLinks.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <MotionLink
              key={href}
              href={href}
              className={styles.navLink}
              initial={false}
              animate={{
                backgroundColor: isActive ? "#000000" : "#fffbf6",
                color: isActive ? "#ffffff" : "#000000",
                // Off-black (#121212), transparent until hovered.
                borderColor: "rgba(18, 18, 18, 0)",
              }}
              // Ignored on touch, so the border never sticks after a tap.
              whileHover={{ borderColor: "rgba(18, 18, 18, 1)" }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeInOut" }}
              aria-current={isActive ? "page" : undefined}
            >
              <p>{label}</p>
            </MotionLink>
          );
        })}
      </div>
    </div>
  );
}
