/* eslint-disable react-refresh/only-export-components */
import React from 'react';

export const AnimatePresence = ({ children }) => <>{children}</>;

export const motion = new Proxy({}, {
  get: (_target, tag) => {
    const Component = React.forwardRef(({ children, ...props }, ref) => React.createElement(tag, { ref, ...props }, children));
    Component.displayName = `Motion.${String(tag)}`;
    return Component;
  },
});

export const useReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
