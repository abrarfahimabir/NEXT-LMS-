// ============================================
// Animation Variants for framer-motion
// ============================================

// Page load variants
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 18,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -18,
    transition: {
      duration: 0.3,
    },
  },
};

// Staggered children for grids
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08,
    },
  },
};

// Card entrance variants
export const cardVariants = {
  initial: {
    opacity: 0,
    y: 18,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.2,
    },
  },
};

// Modal variants with spring physics
export const modalVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 28,
      mass: 1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

// Toast slide-in variants
export const toastVariants = {
  initial: {
    opacity: 0,
    x: 100,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
};

// Confirmation dialog shake
export const confirmDialogVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  shake: {
    x: [0, -8, 8, -8, 8, -4, 4, 0],
    transition: {
      duration: 0.4,
    },
  },
};

// List item slide-in
export const listItemVariants = {
  initial: {
    opacity: 0,
    x: -18,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

// Hover scale with glow effect
export const hoverScaleVariants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Button press effect
export const buttonPressVariants = {
  tap: {
    scale: 0.985,
    transition: {
      duration: 0.1,
    },
  },
};

// Pulse effect for quick actions
export const pulseVariants = {
  initial: {
    scale: 1,
  },
  pulse: {
    scale: [1, 1.03, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
};

// Stat count-up variants
export const statCountVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Gradient background animation
export const gradientVariants = {
  initial: {
    backgroundPosition: "0% 50%",
  },
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Report type card selection
export const reportTypeVariants = {
  initial: {
    opacity: 0,
    y: 18,
  },
  animate: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
  selected: {
    scale: 1.02,
    borderColor: "rgba(99, 102, 241, 0.6)",
    boxShadow: "0 0 30px rgba(99, 102, 241, 0.2)",
    transition: {
      duration: 0.3,
    },
  },
};

// Activity item slide-in
export const activityItemVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.08,
      duration: 0.35,
      ease: "easeOut",
    },
  }),
};

// Pagination page transition
export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

// Course card with enhanced hover
export const courseCardVariants = {
  initial: {
    opacity: 0,
    y: 18,
  },
  animate: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.04,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
  hover: {
    y: -4,
    transition: {
      duration: 0.2,
    },
  },
};

// Skeleton pulse
export const skeletonVariants = {
  initial: {
    opacity: 0.5,
  },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Hero section variants
export const heroVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Chart entrance
export const chartVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Module card variants
export const moduleCardVariants = {
  initial: {
    opacity: 0,
    x: -18,
  },
  animate: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.35,
      ease: "easeOut",
    },
  }),
};

// Stat card with count-up
export const statCardVariants = {
  initial: {
    opacity: 0,
    y: 18,
  },
  animate: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

// Filter bar slide animation
export const filterBarVariants = {
  initial: {
    opacity: 0,
    y: -10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

// ============================================
// Premium Select Dropdown Variants
// ============================================

// Dropdown entrance with 3D rotation effect
export const dropdownVariants = {
  initial: {
    opacity: 0,
    y: -12,
    scale: 0.96,
    rotateX: -5,
    transformOrigin: "top center",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    rotateX: 5,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

// Option item with staggered entrance
export const optionVariants = {
  initial: {
    opacity: 0,
    x: -12,
    scale: 0.95,
  },
  animate: (index) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      delay: index * 0.04,
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
  exit: {
    opacity: 0,
    x: -8,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
  hover: {
    scale: 1.02,
    x: 4,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Trigger button with magnetic hover
export const triggerVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
  hover: {
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.985,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
  open: {
    scale: 1,
  },
};

// Selected checkmark spring animation
export const checkmarkVariants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

// Clear button micro-interactions
export const clearVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  hover: { scale: 1.15 },
  tap: { scale: 0.9 },
};

// Loading spinner animation
export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Focus ring animation
export const focusRingVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

// Option group header reveal
export const groupHeaderVariants = {
  initial: { opacity: 0, x: -8 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: -8,
    transition: { duration: 0.15 },
  },
};

// Error message shake animation
export const selectErrorVariants = {
  initial: { opacity: 0, y: -4 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.15 },
  },
};

// Multi-select badge pulse
export const multiBadgeVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

// Search input reveal animation
export const searchInputVariants = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

// Arrow rotation animation
export const chevronVariants = {
  closed: { rotate: 0 },
  open: { rotate: 180 },
};

// Glow pulse for selected options in multi-select
export const glowPulseVariants = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(99, 102, 241, 0.25)",
      "0 0 30px rgba(99, 102, 241, 0.35)",
      "0 0 20px rgba(99, 102, 241, 0.25)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
