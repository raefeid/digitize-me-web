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
    <span ref={rootRef} className={cn("relative overflow-visible pb-3 leading-[1.5]", className)}>
      <motion.span
        key={words[index]}
        className="gradient-text inline-block"
        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.4 }}
      >
        {words[index]}
      </motion.span>
    </span>
  );
};

export default RotatingHeroWord;
