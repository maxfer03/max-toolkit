import type { Transition, Variants } from "motion/react";

/** Snappy, tactile spring — quick settle, no bouncy overshoot. */
export const snap: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 38,
  mass: 0.7,
};

/** Subtle entrance used across the app. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: snap },
};

/** Container that staggers its children's `fadeUp` entrances. */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
};
