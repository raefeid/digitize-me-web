import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RotatingHeroWordProps {
  words: string[];
  className?: string;
  onIndexChange?: (index: number) => void;
}

const WORD_INTERVAL = 4000;
const TRANSITION_DURATION = 0.45;

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
          className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-[hsl(356_100%_78%)] via-[hsl(var(--dm-coral))] to-[hsl(356_95%_55%)] pb-[0.15em] -mb-[0.15em] align-baseline drop-shadow-[0_2px_24px_hsl(356_94%_60%/0.65)]"
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
