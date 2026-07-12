import { motion } from "framer-motion";
import { Brain, FileText, Tag, Search, Sparkles } from "lucide-react";

const AnimatedOCREngine = () => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
      {/* Central brain */}
      <motion.div
        className="relative z-10 w-24 h-24 rounded-2xl bg-accent/10 flex items-center justify-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Brain size={40} className="text-accent" />
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-accent/30"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Incoming documents (left) */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`doc-${i}`}
          className="absolute flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-2 shadow-md"
          style={{
            left: 0,
            top: `${25 + i * 22}%`,
          }}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.3, duration: 0.5 }}
        >
          <FileText size={14} className="text-accent/70" />
          <div className="flex flex-col">
            <div className="w-12 h-1.5 bg-muted rounded" />
            <div className="w-8 h-1.5 bg-muted rounded mt-1" />
          </div>
        </motion.div>
      ))}

      {/* Scanning beam */}
      <motion.div
        className="absolute left-[28%] w-[18%] h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent"
        animate={{
          top: ["30%", "60%", "30%"],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      {/* Output tags (right) */}
      {[
        { icon: Tag, label: "Legal", delay: 1.5 },
        { icon: Search, label: "Indexed", delay: 1.8 },
        { icon: Sparkles, label: "99.2%", delay: 2.1 },
      ].map((item, i) => (
        <motion.div
          key={item.label}
          className="absolute flex items-center gap-1.5 bg-accent/10 border border-accent/20 rounded-full px-3 py-1.5"
          style={{
            right: 0,
            top: `${22 + i * 24}%`,
          }}
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: item.delay, duration: 0.4 }}
        >
          <item.icon size={12} className="text-accent" />
          <span className="text-xs font-medium text-accent">{item.label}</span>
        </motion.div>
      ))}

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
        {/* Left to center */}
        <motion.path
          d="M120 140 Q200 140 180 200"
          stroke="hsl(var(--accent))"
          strokeWidth="1.5"
          fill="none"
          opacity="0.2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        />
        <motion.path
          d="M120 200 Q160 200 180 200"
          stroke="hsl(var(--accent))"
          strokeWidth="1.5"
          fill="none"
          opacity="0.2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        />
        <motion.path
          d="M120 260 Q200 260 180 200"
          stroke="hsl(var(--accent))"
          strokeWidth="1.5"
          fill="none"
          opacity="0.2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        />
        {/* Center to right */}
        <motion.path
          d="M220 200 Q260 140 280 130"
          stroke="hsl(var(--accent))"
          strokeWidth="1.5"
          fill="none"
          opacity="0.2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        />
        <motion.path
          d="M220 200 Q260 200 280 200"
          stroke="hsl(var(--accent))"
          strokeWidth="1.5"
          fill="none"
          opacity="0.2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
        />
        <motion.path
          d="M220 200 Q260 260 280 270"
          stroke="hsl(var(--accent))"
          strokeWidth="1.5"
          fill="none"
          opacity="0.2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
        />
      </svg>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1.5 h-1.5 rounded-full bg-accent/30"
          style={{
            left: `${30 + Math.random() * 40}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [0, -8, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedOCREngine;
