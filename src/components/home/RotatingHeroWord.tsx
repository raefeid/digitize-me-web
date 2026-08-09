import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RotatingHeroWordProps {
  words: string[];
  className?: string;
  onIndexChange?: (index: number) => void;
}

const RotatingHeroWord = ({ words, className, onIndexChange }: RotatingHeroWordProps) => {
  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [words.length]);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);


  return (
    <span ref={rootRef} className={cn("relative inline overflow-visible", className)}>
      <span className="inline-block rounded-lg bg-[hsl(var(--hero-navy)/0.45)] px-2 -mx-1 backdrop-blur-sm shadow-[0_0_30px_-8px_hsl(var(--hero-navy)/0.7)]">
        <motion.span
          key={words[index]}
          className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--hero-on-navy))] to-[hsl(var(--dm-coral))] pb-[0.15em] -mb-[0.15em] align-baseline drop-shadow-[0_2px_14px_hsl(var(--hero-navy)/0.9)]"
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.4 }}
        >
          {words[index]}
        </motion.span>
      </span>
    </span>
  );
};

export default RotatingHeroWord;
