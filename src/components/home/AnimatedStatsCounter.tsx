import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import EditableText from "@/components/cms/EditableText";
import { useEditMode } from "@/components/cms/EditModeContext";

interface AnimatedCounterProps {
  value: string;
  label: string;
  /** When provided, value & label become click-to-edit in admin Edit Mode */
  editKey?: string;
  page?: string;
  section?: string;
}

// Convert Arabic-Indic digits to Western
const arabicToWestern = (s: string) =>
  s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

// Convert Western digits to Arabic-Indic
const westernToArabic = (s: string) =>
  s.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);

const AnimatedCounter = ({
  value,
  label,
  editKey,
  page = "home",
  section = "stats",
}: AnimatedCounterProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState("0");
  const { enabled: editEnabled } = useEditMode();

  useEffect(() => {
    // In edit mode, show the raw value so admins see exactly what they're editing
    if (editEnabled) {
      setDisplayValue(value);
      return;
    }
    if (!isInView) return;

    const hasArabicDigits = /[٠-٩]/.test(value);
    const normalized = hasArabicDigits ? arabicToWestern(value) : value;

    const numericPart = normalized.replace(/[^0-9.]/g, "");
    const suffix = normalized.replace(/[0-9.]/g, "");
    const target = parseFloat(numericPart);

    if (isNaN(target)) {
      setDisplayValue(value);
      return;
    }

    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      const result = `${current}${suffix}`;
      setDisplayValue(hasArabicDigits ? westernToArabic(result) : result);

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, value, editEnabled]);

  return (
    <div ref={ref} className="text-center">
      {editKey && editEnabled ? (
        <>
          <EditableText
            as="div"
            page={page}
            section={section}
            contentKey={`${editKey}_value`}
            fallback={value}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-accent tracking-tight"
          />
          <EditableText
            as="div"
            page={page}
            section={section}
            contentKey={`${editKey}_label`}
            fallback={label}
            className="text-sm md:text-base text-muted-foreground mt-2 font-medium"
          />
        </>
      ) : (
        <>
          <motion.div
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-accent tracking-tight"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {displayValue}
          </motion.div>
          <motion.div
            className="text-sm md:text-base text-muted-foreground mt-2 font-medium"
            initial={{ opacity: 0, y: 5 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {label}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default AnimatedCounter;
