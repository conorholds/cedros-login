export const motion = {
  distance: 18,
  staggerMs: 30,
  springs: {
    responsive: {
      stiffness: 520,
      damping: 38,
      mass: 0.8,
    },
    settle: {
      stiffness: 420,
      damping: 34,
      mass: 0.9,
    },
  },
};

export type Motion = typeof motion;
