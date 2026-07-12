import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AnimatedFeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  index: number;
}

const AnimatedFeatureCard = ({ icon: Icon, title, desc, index }: AnimatedFeatureCardProps) => {
  return (
    <motion.div
      className="bg-card rounded-xl p-6 border border-border hover:border-accent/20 hover:shadow-lg transition-all group relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -4 }}
    >
      {/* Animated background glow on hover */}
      <motion.div
        className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-accent/5 blur-2xl"
        initial={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 2.5, opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      <motion.div
        className="relative w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors"
        whileHover={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
        >
          <Icon size={22} className="text-accent" />
        </motion.div>

        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-accent/20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
        />
      </motion.div>

      <h3 className="font-semibold text-foreground mb-2 relative">{title}</h3>
      <p className="text-sm text-muted-foreground relative">{desc}</p>
    </motion.div>
  );
};

export default AnimatedFeatureCard;
