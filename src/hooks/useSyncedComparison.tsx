import { useEffect, useSyncExternalStore, type RefObject } from "react";
import { useInView } from "framer-motion";

/**
 * Shared, synchronized auto-toggle for the home page's two comparison sections
 * (All-in-One and Before/After). Both sections read one boolean flipped by a
 * single interval, so they always switch together — no drift between two
 * independent timers, and only one coordinated layout change instead of two
 * offset ones that make the page jump.
 *
 * The cycle starts once any consuming section scrolls into view (framer-motion
 * useInView), matching the original Lovable pattern; the interval speed below is
 * the shared switching cadence.
 */

const INTERVAL_MS = 5000;

let active = false;
let intervalId: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

const restart = () => {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    active = !active;
    emit();
  }, INTERVAL_MS);
};

/** Begin the shared auto-cycle (idempotent). */
const start = () => {
  if (!intervalId) restart();
};

/**
 * Manually flip both sections now, and restart the interval so the next auto
 * switch is a full cycle away (no jarring double flip right after a click).
 */
const toggle = () => {
  active = !active;
  emit();
  if (intervalId) restart();
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
    // Stop the timer once no section is mounted, and reset to the initial state.
    if (listeners.size === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      active = false;
    }
  };
};

const getSnapshot = () => active;

export const useSyncedComparison = (sectionRef: RefObject<HTMLElement>) => {
  const activeState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const inView = useInView(sectionRef, { once: true, margin: "-30% 0px -30% 0px" });

  useEffect(() => {
    if (inView) start();
  }, [inView]);

  return { active: activeState, toggle };
};
