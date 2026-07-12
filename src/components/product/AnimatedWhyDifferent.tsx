import { motion } from "framer-motion";
import { Shield, Globe, FileCheck, Zap, Lock } from "lucide-react";

const AnimatedWhyDifferent = () => {
  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square flex items-center justify-center">
      {/* Central shield */}
      <motion.div
        className="relative z-10 w-24 h-24 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Shield size={40} className="text-accent" />
      </motion.div>

      {/* Orbiting rings */}
      <motion.div
        className="absolute w-44 h-44 rounded-full border border-accent/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <motion.div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent/40" />
      </motion.div>

      <motion.div
        className="absolute w-64 h-64 rounded-full border border-dashed border-accent/10"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <motion.div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent/40" />
        <motion.div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary/30" />
      </motion.div>

      {/* Corner icons */}
      {[
        { icon: Lock, pos: "top-2 left-4", delay: 0.3 },
        { icon: Globe, pos: "top-2 right-4", delay: 0.5 },
        { icon: FileCheck, pos: "bottom-8 left-4", delay: 0.7 },
        { icon: Zap, pos: "bottom-8 right-4", delay: 0.9 },
      ].map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={i}
            className={`absolute ${item.pos} w-10 h-10 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center`}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: item.delay, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.15, y: -2 }}
          >
            <Icon size={18} className="text-accent/70" />
          </motion.div>
        );
      })}

      {/* Pulse waves */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={`wave-${i}`}
          className="absolute rounded-full border border-accent/10"
          style={{ width: 80 + i * 40, height: 80 + i * 40 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0, 0.15],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.8,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedWhyDifferent;
