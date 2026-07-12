import { motion } from "framer-motion";
import { Cloud, Server, Shield, ArrowUpDown, FileText } from "lucide-react";

const AnimatedDeployment = () => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] flex items-center justify-center">
      {/* Cloud side */}
      <motion.div
        className="absolute left-4 top-[15%] flex flex-col items-center"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Cloud size={36} className="text-accent" />
        </motion.div>
        <span className="mt-2 text-xs font-semibold text-accent">SaaS</span>

        {/* Floating docs */}
        {[0, 1].map((i) => (
          <motion.div
            key={`cloud-doc-${i}`}
            className="absolute"
            style={{ top: -10 - i * 16, left: 20 + i * 25 }}
            animate={{
              y: [0, -10 - i * 4, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            <FileText size={14} className="text-accent/40" />
          </motion.div>
        ))}
      </motion.div>

      {/* Server side */}
      <motion.div
        className="absolute right-4 top-[15%] flex flex-col items-center"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          className="w-20 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center relative"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Server size={36} className="text-foreground/60" />
          {/* Blink lights */}
          <motion.div
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
        <span className="mt-2 text-xs font-semibold text-foreground/60">On-Premise</span>
      </motion.div>

      {/* Center bridge / sync */}
      <motion.div
        className="z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.div
          className="w-14 h-14 rounded-full bg-card border-2 border-accent/30 flex items-center justify-center shadow-lg"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <ArrowUpDown size={20} className="text-accent" />
        </motion.div>
      </motion.div>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
        {/* Left line */}
        <motion.line
          x1="100" y1="110" x2="175" y2="150"
          stroke="hsl(var(--accent))"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          opacity="0.3"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        />
        {/* Right line */}
        <motion.line
          x1="225" y1="150" x2="300" y2="110"
          stroke="hsl(var(--accent))"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          opacity="0.3"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.5 }}
        />
      </svg>

      {/* Shield bottom center */}
      <motion.div
        className="absolute bottom-[10%] flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <Shield size={14} className="text-accent" />
        <span className="text-[10px] font-medium text-foreground/60">Enterprise Security</span>
      </motion.div>

      {/* Data transfer particles */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`transfer-${i}`}
          className="absolute w-1.5 h-1.5 rounded-full bg-accent"
          style={{ top: "40%" }}
          animate={{
            x: [-60, 60],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedDeployment;
