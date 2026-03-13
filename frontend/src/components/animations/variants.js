const NO_MOTION_TRANSITION = { duration: 0 };

const CARD_ENTRY_OFFSET = 20;

export const feedCardVariants = {
  hidden: { opacity: 0, y: CARD_ENTRY_OFFSET },
  visible: { opacity: 1, y: 0 },
};

export const hoverCardVariants = {
  rest: { y: 0, boxShadow: '0 0 0 rgba(0, 0, 0, 0)' },
  hover: { y: -6, boxShadow: '0 20px 30px rgba(0, 0, 0, 0.32)' },
};

export const coverZoomVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
};

export const likeButtonVariants = {
  idle: { scale: 1 },
  liked: { scale: [1, 1.18, 1] },
};

export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContentVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 12, scale: 0.98 },
};

export const transitionByPattern = {
  feedEntry: { duration: 0.36, ease: [0.22, 1, 0.36, 1] },
  hover: { duration: 0.2, ease: 'easeOut' },
  like: { duration: 0.28, ease: [0.2, 0.9, 0.2, 1] },
  modalBackdrop: { duration: 0.2, ease: 'easeOut' },
  modal: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
};

export const getTransition = (reduceMotion, pattern) => (
  reduceMotion ? NO_MOTION_TRANSITION : (transitionByPattern[pattern] || transitionByPattern.hover)
);
