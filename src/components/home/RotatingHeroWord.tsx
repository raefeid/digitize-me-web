import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RotatingHeroWordProps {
  words: string[];
  className?: string;
  onIndexChange?: (index: number) => void;
}

const WORD_INTERVAL = 8000;
const TRANSITION_DURATION = 0.9;

const RotatingHeroWord = ({ words, className, onIndexChange }: RotatingHeroWordProps) => {
  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, WORD_INTERVAL);
    return () => clearInterval(interval);
  }, [words.length]);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);


  return (
    <span ref={rootRef} className={cn("relative inline overflow-visible", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--hero-on-navy))] to-[hsl(var(--dm-coral))] pb-[0.15em] -mb-[0.15em] align-baseline drop-shadow-[0_3px_18px_hsl(var(--hero-navy)/1)]"
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
          transition={{
            duration: TRANSITION_DURATION,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default RotatingHeroWord;
