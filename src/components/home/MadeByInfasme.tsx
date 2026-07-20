import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import infasmeLogo from "@/assets/infasme-logo-new.webp.asset.json";

/**
 * "Crafted by Infasme" attribution strip. Subtle, elegant animation:
 * a thin accent line draws in, the logo fades + scales in, and a soft
 * pulse glow sits behind the mark.
 */
const MadeByInfasme = () => {
  const { isRTL } = useLanguage();

  return (
    <section
      aria-label="Crafted by Infasme"
      className="py-14 md:py-16 bg-background relative overflow-hidden"
    >
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center flex flex-col items-center gap-5"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-px w-24 bg-gradient-to-r from-transparent via-accent to-transparent origin-center"
          />

          <p className="text-xs md:text-sm uppercase tracking-[0.28em] text-muted-foreground/70 font-medium">
            {isRTL ? "تم التطوير بواسطة" : "BUILT BY"}
          </p>

          <motion.a
            href="https://infasme.com"
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-flex items-center justify-center group"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Soft pulse glow */}
            <motion.span
              aria-hidden
              className="absolute inset-0 -m-6 rounded-full bg-accent/10 blur-2xl"
              animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.9, 1.05, 0.9] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.img
              src={infasmeLogo.url}
              alt="Infasme"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="relative h-14 md:h-20 w-auto object-contain select-none"
              loading="lazy"
            />
          </motion.a>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm md:text-base text-muted-foreground max-w-md"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {isRTL
              ? "حلٌّ مصمَّم بعناية من قِبَل إنفاسمي — خبراء الذكاء الاصطناعي وإدارة المستندات."
              : "A solution meticulously engineered by Infasme — specialists in AI and enterprise document intelligence."}
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="h-px w-24 bg-gradient-to-r from-transparent via-accent to-transparent origin-center"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default MadeByInfasme;
