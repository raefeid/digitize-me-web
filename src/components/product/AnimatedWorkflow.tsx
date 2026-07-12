import { motion } from "framer-motion";
import { Scan, Brain, FolderOpen, Search } from "lucide-react";

const steps = [
  { icon: Scan, color: "bg-accent/15", iconColor: "text-accent" },
  { icon: Brain, color: "bg-dm-navy/15", iconColor: "text-primary" },
  { icon: FolderOpen, color: "bg-accent/10", iconColor: "text-accent" },
  { icon: Search, color: "bg-dm-navy/10", iconColor: "text-primary" },
];

const AnimatedWorkflow = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto py-8">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <motion.div
          className="absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-accent/40 via-primary/30 to-accent/40 -translate-y-1/2"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ transformOrigin: "left" }}
        />

        {/* Animated data packet */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/30 z-20"
          initial={{ left: "10%" }}
          animate={{ left: ["10%", "90%"] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1,
          }}
        />

        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={i}
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.2, duration: 0.5 }}
            >
              <motion.div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${step.color} flex items-center justify-center shadow-sm border border-border/50 bg-card`}
                whileHover={{ scale: 1.1, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon size={28} className={step.iconColor} />
              </motion.div>

              {/* Pulse ring */}
              <motion.div
                className={`absolute inset-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 ${step.iconColor.replace("text-", "border-")}/20`}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedWorkflow;
