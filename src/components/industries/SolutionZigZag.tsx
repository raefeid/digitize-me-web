import { motion } from "framer-motion";
import { FileText, Search, Lock, Zap, CheckCircle } from "lucide-react";

interface SolutionZigZagProps {
  heading: string;
  intro?: string;
  items: { solution: string; problem?: string }[];
}

/** Animated, looping visuals (GIF-like) rendered with motion + tokens. */
const Visual = ({ index }: { index: number }) => {
  const variant = index % 3;

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />

      {variant === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-12 h-14 rounded-md bg-background border border-border flex items-center justify-center"
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.15 }}
              >
                <FileText size={16} className="text-muted-foreground" />
              </motion.div>
            ))}
          </div>
          <motion.div
            className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-accent/25 to-transparent"
            animate={{ y: ["-20%", "120%"] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {variant === 1 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8">
          <motion.div
            className="w-full max-w-xs flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5"
            animate={{ boxShadow: ["0 0 0 0 hsl(var(--accent)/0)", "0 0 0 6px hsl(var(--accent)/0.12)", "0 0 0 0 hsl(var(--accent)/0)"] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          >
            <Search size={15} className="text-accent shrink-0" />
            <motion.span
              className="h-2 rounded-full bg-muted-foreground/30"
              animate={{ width: ["10%", "70%", "10%"] }}
              transition={{ duration: 2.8, repeat: Infinity }}
            />
          </motion.div>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-full max-w-xs flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -8] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.35 }}
            >
              <CheckCircle size={15} className="text-accent shrink-0" />
              <span className="h-2 flex-1 rounded-full bg-muted-foreground/20" />
            </motion.div>
          ))}
        </div>
      )}

      {variant === 2 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="absolute w-40 h-40 rounded-full border border-accent/25"
            animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-40 h-40 rounded-full border border-accent/25"
            animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: 1.2 }}
          />
          <motion.div
            className="relative z-10 w-20 h-20 rounded-2xl bg-primary/90 flex items-center justify-center"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            {index % 2 === 0 ? (
              <Lock size={28} className="text-primary-foreground" />
            ) : (
              <Zap size={28} className="text-primary-foreground" />
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

const SolutionZigZag = ({ heading, intro, items }: SolutionZigZagProps) => {
  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">{heading}</h2>
          {intro && <p className="text-base text-muted-foreground mt-4">{intro}</p>}
        </div>

        <div className="space-y-14 lg:space-y-24">
          {items.map((item, i) => {
            const flipped = i % 2 === 1;
            return (
              <motion.div
                key={i}
                className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <div className={flipped ? "lg:order-2" : "lg:order-1"}>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent mb-4">
                    <span className="w-6 h-px bg-accent" />
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 text-balance">{item.solution}</h3>
                  {item.problem && (
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Today: {item.problem}.
                    </p>
                  )}
                </div>
                <div className={flipped ? "lg:order-1" : "lg:order-2"}>
                  <Visual index={i} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SolutionZigZag;
