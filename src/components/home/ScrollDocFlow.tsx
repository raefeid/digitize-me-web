import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  MotionValue,
} from "framer-motion";
import {
  Upload,
  Brain,
  FolderCheck,
  FileText,
  Tag,
  CheckCircle,
  MousePointer2,
  ScanLine,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useMotionPreference } from "@/hooks/useReducedMotion";
import AnimatedDocFlow from "./AnimatedDocFlow";

const STATION_DEFAULTS = [
  { icon: Upload, labelEn: "Select & Drag", labelAr: "اختر واسحب" },
  { icon: Upload, labelEn: "Upload", labelAr: "رفع" },
  { icon: ScanLine, labelEn: "Scan & OCR", labelAr: "مسح ضوئي" },
  { icon: Brain, labelEn: "Classify", labelAr: "تصنيف" },
  { icon: FolderCheck, labelEn: "Ready", labelAr: "جاهز" },
];

/** Ranged fade helper — clamped & monotonic-safe. */
const fadeRange = (p: MotionValue<number>, inStart: number, inEnd: number, outStart: number, outEnd: number) => {
  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  const a = clamp(inStart);
  const b = Math.max(a, clamp(inEnd));
  const c = Math.max(b, clamp(outStart));
  const d = Math.max(c, clamp(outEnd));
  return useTransform(p, [a, b, c, d], [0, 1, 1, 0], { clamp: true });
};

// Timeline segments (fractions of scrollYProgress)
const T = {
  moveTo1: [0.02, 0.10] as const,
  drag1:   [0.10, 0.18] as const,
  moveTo2: [0.18, 0.24] as const,
  drag2:   [0.24, 0.30] as const,
  moveTo3: [0.30, 0.36] as const,
  drag3:   [0.36, 0.42] as const,
  moveBtn: [0.42, 0.50] as const,
  press:   [0.50, 0.54] as const,
  upload:  [0.54, 0.68] as const,
  scan:    [0.68, 0.82] as const,
  classify:[0.82, 0.92] as const,
  ready:   [0.92, 1.00] as const,
};

const ScrollDocFlow = () => {
  const { isRTL } = useLanguage();
  const { getContent } = useSiteContent("home", "doc_flow");
  const { reduced, mobile } = useMotionPreference();

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Fallback for reduced motion / very small screens
  if (reduced || mobile) {
    return <AnimatedDocFlow />;
  }

  // Track current logical station for the rail
  const [activeStep, setActiveStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    let idx = 0;
    if (v >= T.upload[0]) idx = 1;
    if (v >= T.scan[0]) idx = 2;
    if (v >= T.classify[0]) idx = 3;
    if (v >= T.ready[0]) idx = 4;
    if (idx !== activeStep) setActiveStep(idx);
  });

  const railProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // ---- Cursor path (percent-based on stage) ----
  // Files sit in a row at the top; drop zone below. Approx positions:
  const file1 = { x: "14%", y: "18%" };
  const file2 = { x: "40%", y: "18%" };
  const file3 = { x: "66%", y: "18%" };
  const dropZ = { x: "50%", y: "58%" };
  const btn   = { x: "50%", y: "88%" };
  const start = { x: "6%",  y: "8%"  };

  const cx = useTransform(
    scrollYProgress,
    [0, T.moveTo1[1], T.drag1[1], T.moveTo2[1], T.drag2[1], T.moveTo3[1], T.drag3[1], T.moveBtn[1], T.press[1], 1],
    [start.x, file1.x, dropZ.x, file2.x, dropZ.x, file3.x, dropZ.x, btn.x, btn.x, btn.x],
  );
  const cy = useTransform(
    scrollYProgress,
    [0, T.moveTo1[1], T.drag1[1], T.moveTo2[1], T.drag2[1], T.moveTo3[1], T.drag3[1], T.moveBtn[1], T.press[1], 1],
    [start.y, file1.y, dropZ.y, file2.y, dropZ.y, file3.y, dropZ.y, btn.y, btn.y, btn.y],
  );
  const cursorOpacity = useTransform(scrollYProgress, [0, 0.01, T.upload[0] - 0.01, T.upload[0]], [0, 1, 1, 0], { clamp: true });

  // Per-file "grabbed" state — file follows cursor between moveTo end and drag end
  const makeFileTransform = (moveTo: readonly [number, number], drag: readonly [number, number], home: { x: string; y: string }) => {
    // opacity=1 in home until picked; then fades out at drag end (it "lands" in drop zone)
    const opacity = useTransform(scrollYProgress, [drag[1] - 0.005, drag[1]], [1, 0], { clamp: true });
    // Interpolate x/y from home → dropZone across [moveTo[1], drag[1]]
    const x = useTransform(scrollYProgress, [moveTo[1], drag[1]], [home.x, dropZ.x], { clamp: true });
    const y = useTransform(scrollYProgress, [moveTo[1], drag[1]], [home.y, dropZ.y], { clamp: true });
    // Only "attached" (visible follower) between moveTo end and drag end
    const attached = useTransform(scrollYProgress, [moveTo[1] - 0.005, moveTo[1], drag[1], drag[1] + 0.005], [0, 1, 1, 0], { clamp: true });
    return { opacity, x, y, attached };
  };
  const f1 = makeFileTransform(T.moveTo1, T.drag1, file1);
  const f2 = makeFileTransform(T.moveTo2, T.drag2, file2);
  const f3 = makeFileTransform(T.moveTo3, T.drag3, file3);

  // Drop zone highlight when cursor is over it
  const dropGlow = useTransform(
    scrollYProgress,
    [T.moveTo1[1] - 0.02, T.moveTo1[1], T.drag1[1], T.drag2[1], T.drag3[1], T.drag3[1] + 0.02],
    [0, 1, 1, 1, 1, 0],
    { clamp: true },
  );

  // Button press scale
  const btnScale = useTransform(scrollYProgress, [T.press[0], T.press[0] + 0.02, T.press[1]], [1, 0.92, 1], { clamp: true });
  const btnGlow = useTransform(scrollYProgress, [T.moveBtn[0], T.moveBtn[1]], [0, 1], { clamp: true });

  // Upload progress bar
  const uploadX = useTransform(scrollYProgress, [T.upload[0], T.upload[1]], [0, 1], { clamp: true });

  // Scene fades
  const uploadSceneOpacity = fadeRange(scrollYProgress, 0, 0.01, T.upload[1] - 0.02, T.upload[1]);
  const scanSceneOpacity = fadeRange(scrollYProgress, T.upload[1] - 0.02, T.scan[0], T.scan[1] - 0.02, T.scan[1]);
  const classifySceneOpacity = fadeRange(scrollYProgress, T.scan[1] - 0.02, T.classify[0], T.classify[1] - 0.02, T.classify[1]);
  const readySceneOpacity = fadeRange(scrollYProgress, T.classify[1] - 0.02, T.ready[0], 1, 1);

  // OCR text reveal count
  const ocrCount = useTransform(scrollYProgress, [T.scan[0], T.scan[1]], [0, 5]);
  const [ocrShown, setOcrShown] = useState(0);
  useMotionValueEvent(ocrCount, "change", (v) => setOcrShown(Math.min(5, Math.max(0, Math.floor(v)))));

  // Tag reveal count
  const tagCount = useTransform(scrollYProgress, [T.classify[0], T.classify[1]], [0, 8]);
  const [tagsShown, setTagsShown] = useState(0);
  useMotionValueEvent(tagCount, "change", (v) => setTagsShown(Math.min(8, Math.max(0, Math.floor(v)))));

  const files = [
    { name: "Contract_2024.pdf", home: file1, t: f1 },
    { name: "Invoice_Q3.pdf", home: file2, t: f2 },
    { name: "NDA_signed.pdf", home: file3, t: f3 },
  ];

  const stations = STATION_DEFAULTS.map((s) => ({
    icon: s.icon,
    label: isRTL ? s.labelAr : s.labelEn,
  }));

  const ocrLines = isRTL
    ? ["عقد تجاري رقم ٤٥٦٧", "شركة الأهلي للتجارة", "بتاريخ ١٥ يناير ٢٠٢٤", "قيمة العقد: ٢٥٠,٠٠٠ درهم", "توقيع الطرفين معتمد"]
    : ["Commercial Contract #4567", "Al Ahly Trading Company", "Dated January 15, 2024", "Contract value: AED 250,000", "Signatures verified"];

  const tags = isRTL
    ? ["عقد", "تجاري", "عربي", "موقّع", "٢٠٢٤", "قانوني", "AED", "معتمد"]
    : ["Contract", "Commercial", "Arabic", "Signed", "2024", "Legal", "AED", "Verified"];

  return (
    <div ref={sectionRef} className="relative" style={{ height: "500vh" }}>
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Step rail */}
        <div className="relative w-full max-w-3xl px-4 mb-6">
          <div className="relative flex items-start justify-between">
            <div className="absolute top-6 left-[8%] right-[8%] h-0.5 bg-border z-0">
              <motion.div className="h-full bg-accent origin-left" style={{ scaleX: railProgress }} />
            </div>
            {stations.map((station, i) => {
              const Icon = station.icon;
              const isActive = i === activeStep;
              const isPast = i < activeStep;
              return (
                <div key={i} className="relative z-10 flex flex-col items-center" style={{ width: `${100 / stations.length}%` }}>
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                      isActive
                        ? "bg-accent border-accent shadow-lg shadow-accent/30"
                        : isPast
                        ? "bg-accent/10 border-accent"
                        : "bg-card border-border"
                    }`}
                    animate={{ scale: isActive ? 1.15 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Icon
                      size={20}
                      className={isActive ? "text-accent-foreground" : isPast ? "text-accent" : "text-muted-foreground"}
                    />
                  </motion.div>
                  <span
                    className={`mt-2 text-[11px] md:text-xs font-semibold text-center ${
                      isActive ? "text-accent" : isPast ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {station.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browser mockup */}
        <div className="w-full max-w-3xl px-4">
          <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 border-b border-border">
              <span className="w-3 h-3 rounded-full bg-destructive/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="flex-1 mx-3 h-6 rounded-md bg-background border border-border flex items-center px-3">
                <span className="text-[11px] text-muted-foreground truncate">app.infasme.com/documents</span>
              </div>
            </div>

            {/* Stage */}
            <div className="relative h-[420px] md:h-[480px] bg-background">
              {/* ===== Upload scene ===== */}
              <motion.div className="absolute inset-0" style={{ opacity: uploadSceneOpacity }}>
                {/* File cards in "home" positions */}
                {files.map((f, i) => (
                  <motion.div
                    key={f.name}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card shadow-sm"
                    style={{ left: f.home.x, top: f.home.y, opacity: f.t.opacity }}
                  >
                    <FileText size={14} className="text-accent" />
                    <span className="text-[11px] text-foreground whitespace-nowrap">{f.name}</span>
                  </motion.div>
                ))}

                {/* Dragged file follower (attached to cursor between pickup and drop) */}
                {files.map((f, i) => (
                  <motion.div
                    key={`drag-${i}`}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-2 rounded-lg border border-accent bg-accent/10 shadow-lg pointer-events-none"
                    style={{ left: f.t.x, top: f.t.y, opacity: f.t.attached, rotate: -4 }}
                  >
                    <FileText size={14} className="text-accent" />
                    <span className="text-[11px] text-foreground whitespace-nowrap">{f.name}</span>
                  </motion.div>
                ))}

                {/* Drop zone */}
                <motion.div
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-[70%] h-[38%] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2"
                  style={{ left: dropZ.x, top: dropZ.y }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-dashed border-accent bg-accent/10"
                    style={{ opacity: dropGlow }}
                  />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <Upload size={28} className="text-accent" />
                    <p className="text-xs font-medium text-foreground">
                      {isRTL ? "أفلت الملفات هنا" : "Drop files here"}
                    </p>
                  </div>
                </motion.div>

                {/* Upload button */}
                <motion.button
                  type="button"
                  className="absolute -translate-x-1/2 -translate-y-1/2 px-5 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold shadow-md"
                  style={{ left: btn.x, top: btn.y, scale: btnScale, boxShadow: btnGlow.get ? undefined : undefined }}
                >
                  {isRTL ? "رفع الملفات" : "Upload Files"}
                </motion.button>

                {/* Upload progress bar (appears near end of upload phase) */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 bottom-3 h-1.5 w-[70%] bg-muted rounded-full overflow-hidden"
                  style={{ opacity: useTransform(scrollYProgress, [T.press[1], T.upload[0]], [0, 1], { clamp: true }) }}
                >
                  <motion.div className="h-full bg-accent origin-left" style={{ scaleX: uploadX }} />
                </motion.div>
              </motion.div>

              {/* ===== Scan / OCR scene ===== */}
              <motion.div className="absolute inset-0 p-6" style={{ opacity: scanSceneOpacity }}>
                <div className="relative h-full rounded-xl border border-border bg-card p-5 overflow-hidden">
                  <motion.div
                    className="absolute left-0 right-0 h-[2px] bg-accent shadow-[0_0_12px_hsl(var(--accent))] z-10"
                    style={{ top: useTransform(scrollYProgress, [T.scan[0], T.scan[1]], ["0%", "100%"], { clamp: true }) }}
                  />
                  <div className="space-y-3">
                    {ocrLines.map((line, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 transition-opacity duration-300"
                        style={{ opacity: i < ocrShown ? 1 : 0.15 }}
                      >
                        <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center">
                          <CheckCircle size={10} className="text-accent" />
                        </div>
                        <span className="text-sm text-foreground">{line}</span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-4 left-5 right-5 flex items-center gap-2">
                    <div className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                      99% {isRTL ? "دقة" : "accuracy"}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {isRTL ? "عربي + إنجليزي" : "Arabic + English"}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* ===== Classify scene ===== */}
              <motion.div className="absolute inset-0 p-6" style={{ opacity: classifySceneOpacity }}>
                <div className="h-full rounded-xl border border-border bg-card p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain size={20} className="text-accent" />
                    <span className="text-sm font-semibold text-foreground">
                      {isRTL ? "تصنيف تلقائي..." : "Auto-classifying..."}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium flex items-center gap-1 transition-all duration-300"
                        style={{
                          opacity: i < tagsShown ? 1 : 0,
                          transform: i < tagsShown ? "scale(1)" : "scale(0.6)",
                        }}
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ===== Ready scene ===== */}
              <motion.div
                className="absolute inset-0 p-6 flex items-center justify-center"
                style={{ opacity: readySceneOpacity }}
              >
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    <CheckCircle size={40} className="text-accent" />
                  </motion.div>
                  <p className="text-lg font-semibold text-foreground">
                    {isRTL ? "المستند جاهز!" : "Document Ready!"}
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    {isRTL ? "قابل للبحث • قابل للمشاركة • مؤرشف بأمان" : "Searchable • Shareable • Securely Archived"}
                  </p>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {["< 5s", isRTL ? "مؤمّن" : "Encrypted", isRTL ? "نسخة احتياطية" : "Backed up"].map((badge, i) => (
                      <span key={i} className="px-2.5 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Cursor (overlay on top of everything during upload scene) */}
              <motion.div
                className="absolute z-30 pointer-events-none -translate-x-1 -translate-y-1"
                style={{ left: cx, top: cy, opacity: cursorOpacity }}
              >
                <MousePointer2 className="text-foreground drop-shadow-lg" size={22} fill="currentColor" />
              </motion.div>
            </div>
          </div>

          <p className="text-center text-[11px] text-muted-foreground/70 mt-3">
            {isRTL ? "مرر للأسفل لمشاهدة العملية" : "Scroll to watch the workflow"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScrollDocFlow;
