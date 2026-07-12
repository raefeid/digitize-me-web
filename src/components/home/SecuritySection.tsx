import { motion } from "framer-motion";
import { Shield, Lock, CheckCircle2, Server, Eye, KeyRound } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import VisualSlot from "@/components/cms/VisualSlot";
import EditableText from "@/components/cms/EditableText";
import EditableList from "@/components/cms/EditableList";
import EditableIcon from "@/components/cms/EditableIcon";

// Default icons cycle through this set; each row can be swapped via EditableIcon.
const badgeIcons = [Lock, Server, Eye, KeyRound];

const SecuritySection = () => {
  const { t } = useLanguage();

  return (
    <section aria-label="Security" className="section-padding bg-primary text-primary-foreground overflow-hidden">
      <div className="container-max">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <EditableText
              page="home"
              section="security"
              contentKey="security_label"
              fallback={t("security.label")}
              as="span"
              className="text-accent font-semibold text-sm uppercase tracking-wider"
            />
            <EditableText
              page="home"
              section="security"
              contentKey="security_title"
              fallback={t("security.title")}
              as="h2"
              rich
              className="text-3xl md:text-4xl font-bold mt-2 mb-4"
            />
            <EditableText
              page="home"
              section="security"
              contentKey="security_desc"
              fallback={t("security.desc")}
              as="p"
              rich
              multiline
              className="text-primary-foreground/70 mb-8"
            />
            <EditableList
              page="home"
              listKey="security_badges"
              className="grid grid-cols-2 gap-4"
              seeds={[
                { key: "security_badge_1", text: t("security.badge1") },
                { key: "security_badge_2", text: t("security.badge2") },
                { key: "security_badge_3", text: t("security.badge3") },
                { key: "security_badge_4", text: t("security.badge4") },
              ]}
              renderItem={({ id, index, text }) => {
                const Icon = badgeIcons[index % badgeIcons.length];
                return (
                  <motion.div
                    className="flex items-center gap-3 bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-4"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <EditableIcon page="home" slotKey={`security_badge_icon_${id}`} size={20}>
                      <Icon size={20} className="text-accent shrink-0" />
                    </EditableIcon>
                    <span className="text-sm font-medium flex-1 min-w-0">{text}</span>
                  </motion.div>
                );
              }}
            />
          </motion.div>

          <motion.div className="relative flex items-center justify-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <VisualSlot page="home" slotKey="security_image" alt="Security illustration" className="w-full flex items-center justify-center" imgClassName="max-h-72 w-auto object-contain">
              <div className="relative w-64 h-64">
                {[1, 2, 3].map((ring) => (
                  <motion.div key={ring} className="absolute inset-0 rounded-full border border-accent/20" style={{ scale: ring * 0.3 + 0.4 }} animate={{ scale: [ring * 0.3 + 0.4, ring * 0.3 + 0.6, ring * 0.3 + 0.4], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: ring * 0.5 }} />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div className="w-24 h-24 rounded-2xl bg-accent/20 flex items-center justify-center backdrop-blur-sm" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Shield size={40} className="text-accent" />
                  </motion.div>
                </div>
                {[0, 1, 2, 3].map((i) => {
                  const angle = (i / 4) * 360;
                  return (
                    <motion.div key={i} className="absolute w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center" style={{ top: `${50 - 42 * Math.cos((angle * Math.PI) / 180)}%`, left: `${50 + 42 * Math.sin((angle * Math.PI) / 180)}%`, transform: "translate(-50%, -50%)" }} animate={{ scale: [0.8, 1.1, 0.8] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}>
                      <CheckCircle2 size={14} className="text-accent" />
                    </motion.div>
                  );
                })}
              </div>
            </VisualSlot>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
