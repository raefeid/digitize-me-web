import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface RollingTextProps {
  text: string;
  className?: string;
  numberClassName?: string;
  duration?: number;
}

function DigitColumn({
  targetDigit,
  duration,
  isVisible,
}: {
  targetDigit: number;
  duration: number;
  isVisible: boolean;
}) {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="relative h-[1em] w-[0.62em] overflow-hidden inline-flex align-bottom">
      <motion.div
        className="absolute top-0 left-0 w-full flex flex-col"
        initial={{ y: "0%" }}
        animate={{ y: isVisible ? `${-targetDigit * 10}%` : "0%" }}
        transition={{
          duration: isVisible ? duration : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {digits.map((d) => (
          <div
            key={d}
            className="h-[10em] flex items-center justify-center leading-none"
          >
            {d}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function RollingNumber({
  value,
  className = "",
  duration = 2,
}: {
  value: string | number;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setIsVisible(true), 150);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  const numValue = typeof value === "string" ? parseFloat(value) : value;
  const isNegative = numValue < 0;
  const digits = Math.abs(Math.round(numValue))
    .toString()
    .split("")
    .map(Number);

  return (
    <span ref={ref} className={`inline-flex items-baseline ${className}`}>
      {isNegative && (
        <span className="inline-block leading-none">-</span>
      )}
      {digits.map((digit, i) => (
        <DigitColumn
          key={i}
          targetDigit={digit}
          duration={duration}
          isVisible={isVisible}
        />
      ))}
    </span>
  );
}

export function RollingText({
  text,
  className = "",
  numberClassName = "",
  duration = 2,
}: RollingTextProps) {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  if (!match) {
    return <span className={className}>{text}</span>;
  }

  const prefix = text.slice(0, match.index);
  const numberStr = match[0];
  const suffix = text.slice((match.index || 0) + numberStr.length);

  return (
    <span className={className}>
      {prefix}
      <RollingNumber
        value={numberStr}
        className={numberClassName}
        duration={duration}
      />
      {suffix}
    </span>
  );
}
