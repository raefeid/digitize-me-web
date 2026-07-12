import { useEffect, useState } from "react";

/**
 * Returns true when the OS asks for reduced motion (or on tiny screens
 * where heavy animations would hurt perf). Use to gate decorative motion.
 */
export const useReducedMotion = (mobileBreakpoint = 640) => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);

    const update = () => setReduced(mqMotion.matches);
    update();

    mqMotion.addEventListener?.("change", update);
    mqMobile.addEventListener?.("change", update);
    return () => {
      mqMotion.removeEventListener?.("change", update);
      mqMobile.removeEventListener?.("change", update);
    };
  }, [mobileBreakpoint]);

  return reduced;
};

/**
 * Variant: also reports if we're on mobile, useful for lighter
 * (not fully disabled) animations.
 */
export const useMotionPreference = (mobileBreakpoint = 640) => {
  const [state, setState] = useState({ reduced: false, mobile: false });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);
    const update = () => setState({ reduced: mqMotion.matches, mobile: mqMobile.matches });
    update();
    mqMotion.addEventListener?.("change", update);
    mqMobile.addEventListener?.("change", update);
    return () => {
      mqMotion.removeEventListener?.("change", update);
      mqMobile.removeEventListener?.("change", update);
    };
  }, [mobileBreakpoint]);

  return state;
};
