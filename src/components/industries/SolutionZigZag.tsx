import { motion } from "framer-motion";
import searchVideo from "@/assets/search_feature.mp4";
import aichatVideo from "@/assets/aichat_feature.mp4";
import reportsVideo from "@/assets/reports_feature.mp4";

interface SolutionZigZagProps {
  heading: string;
  intro?: string;
  items: { solution: string; problem?: string }[];
  /** Industry display name, used in the visual captions. */
  industryName?: string;
}

type FeatureKey = "search" | "aichat" | "reports";

const FEATURES: Record<FeatureKey, { url: string; label: string; caption: (n: string) => string }> = {
  search: {
    url: searchVideo,
    label: "Instant Search",
    caption: (n) => `Find any ${n.toLowerCase()} document in seconds — Arabic or English.`,
  },
  aichat: {
    url: aichatVideo,
    label: "AI Assistant",
    caption: (n) => `Ask questions across your ${n.toLowerCase()} archive and get sourced answers.`,
  },
  reports: {
    url: reportsVideo,
    label: "Reports & Insights",
    caption: (n) => `Track ${n.toLowerCase()} activity, compliance and turnaround in live dashboards.`,
  },
};

const KEYWORDS: Record<FeatureKey, RegExp> = {
  search: /(search|find|retriev|locat|index|archiv|access)/i,
  aichat: /(ai|chat|assistant|answer|extract|classif|ocr|scan|automat)/i,
  reports: /(report|dashboard|analytic|audit|complian|track|insight|monitor)/i,
};

/** Assigns one of the three feature videos to each solution, avoiding repeats. */
const assignFeatures = (items: { solution: string; problem?: string }[]): FeatureKey[] => {
  const order: FeatureKey[] = ["search", "aichat", "reports"];
  const used = new Set<FeatureKey>();
  const result: FeatureKey[] = [];

  items.forEach((item) => {
    const text = `${item.solution} ${item.problem ?? ""}`;
    const match = order.find((k) => !used.has(k) && KEYWORDS[k].test(text));
    const chosen = match ?? order.find((k) => !used.has(k)) ?? order[result.length % 3];
    used.add(chosen);
    if (used.size === 3) used.clear();
    result.push(chosen);
  });

  return result;
};

const FeatureVisual = ({ feature, industryName }: { feature: FeatureKey; industryName: string }) => {
  const config = FEATURES[feature];
  return (
    <motion.div
      className="group relative"
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="absolute -inset-4 rounded-3xl bg-accent/10 blur-2xl opacity-70" aria-hidden />
      <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
        <video
          src={config.url}
          className="w-full h-auto block"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={`${config.label} — ${industryName}`}
        />
        <div className="px-4 py-3 border-t border-border bg-card">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">{config.label}</div>
          <p className="text-sm text-muted-foreground mt-1">{config.caption(industryName)}</p>
        </div>
      </div>
    </motion.div>
  );
};

const SolutionZigZag = ({ heading, intro, items, industryName = "your" }: SolutionZigZagProps) => {
  const features = assignFeatures(items);

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
                  <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent mb-4">
                    <span className="w-6 h-px bg-accent" />
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">{item.solution}</h3>
                  {item.problem && (
                    <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                      Today: {item.problem}.
                    </p>
                  )}
                </div>
                <div className={flipped ? "lg:order-1" : "lg:order-2"}>
                  <FeatureVisual feature={features[i]} industryName={industryName} />
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
