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
  FileSpreadsheet,
  FileSignature,
  FileImage,
  Folder,
  FolderOpen,
  Search,
  Home,
  Star,
  Clock,
  Trash2,
  Plus,
  Grid3x3,
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
  // Selection phase — cursor clicks each file
  sel1:    [0.02, 0.08] as const,
  sel2:    [0.08, 0.14] as const,
  sel3:    [0.14, 0.20] as const,
  // Drag stack down to drop zone
  drag:    [0.20, 0.36] as const,
  // Move to Upload button + press
  moveBtn: [0.40, 0.48] as const,
  press:   [0.48, 0.52] as const,
  upload:  [0.52, 0.68] as const,
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

  if (reduced || mobile) return <AnimatedDocFlow />;

  const [activeStep, setActiveStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    let idx = 0;
    if (v >= T.moveBtn[0]) idx = 1;
    if (v >= T.scan[0]) idx = 2;
    if (v >= T.classify[0]) idx = 3;
    if (v >= T.ready[0]) idx = 4;
    if (idx !== activeStep) setActiveStep(idx);
  });

  const railProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // ---- Layout coords ----
  // Sidebar ~24% wide. Grid 3 cols x 2 rows. Column centers 40/61/82%. Row centers 30/54%.
  const file1 = { x: "40%", y: "30%" };
  const file2 = { x: "61%", y: "30%" };
  const file3 = { x: "82%", y: "30%" };
  const dropZ = { x: "61%", y: "80%" };
  const btn   = { x: "84%", y: "94%" };
  const start = { x: "28%", y: "18%" };

  // Cursor path — clicks each file in turn, then drags the stack to the drop zone, then to Upload btn
  const cx = useTransform(
    scrollYProgress,
    [0, T.sel1[1], T.sel2[1], T.sel3[1], T.drag[1], T.moveBtn[1], T.press[1], 1],
    [start.x, file1.x, file2.x, file3.x, dropZ.x, btn.x, btn.x, btn.x],
  );
  const cy = useTransform(
    scrollYProgress,
    [0, T.sel1[1], T.sel2[1], T.sel3[1], T.drag[1], T.moveBtn[1], T.press[1], 1],
    [start.y, file1.y, file2.y, file3.y, dropZ.y, btn.y, btn.y, btn.y],
  );
  const cursorOpacity = useTransform(
    scrollYProgress,
    [0, 0.01, T.upload[0] - 0.01, T.upload[0]],
    [0, 1, 1, 0],
    { clamp: true },
  );

  // Per-file selected state (blue glow ring)
  const sel1On = useTransform(scrollYProgress, [T.sel1[1] - 0.005, T.sel1[1]], [0, 1], { clamp: true });
  const sel2On = useTransform(scrollYProgress, [T.sel2[1] - 0.005, T.sel2[1]], [0, 1], { clamp: true });
  const sel3On = useTransform(scrollYProgress, [T.sel3[1] - 0.005, T.sel3[1]], [0, 1], { clamp: true });

  // Source tiles fade after the stack drops
  const sourceOpacity = useTransform(
    scrollYProgress,
    [T.drag[1] - 0.01, T.drag[1] + 0.01],
    [1, 0.15],
    { clamp: true },
  );

  // Dragged stack — visible from end of sel3 through drag phase
  const stackOpacity = useTransform(
    scrollYProgress,
    [T.sel3[1] - 0.01, T.sel3[1], T.drag[1] - 0.005, T.drag[1] + 0.01],
    [0, 1, 1, 0],
    { clamp: true },
  );
  const stackX = useTransform(
    scrollYProgress,
    [T.sel3[1], T.drag[1]],
    [file2.x, dropZ.x],
    { clamp: true },
  );
  const stackY = useTransform(
    scrollYProgress,
    [T.sel3[1], T.drag[1]],
    [file2.y, dropZ.y],
    { clamp: true },
  );

  // Drop zone glow when the stack hovers over it
  const dropGlow = useTransform(
    scrollYProgress,
    [T.drag[0] + (T.drag[1] - T.drag[0]) * 0.6, T.drag[1], T.drag[1] + 0.02],
    [0, 1, 0],
    { clamp: true },
  );

  // Button press + glow
  const btnScale = useTransform(scrollYProgress, [T.press[0], T.press[0] + 0.02, T.press[1]], [1, 0.92, 1], { clamp: true });
  const btnGlow = useTransform(scrollYProgress, [T.moveBtn[0], T.moveBtn[1]], [0, 1], { clamp: true });

  // Upload progress bar
  const uploadX = useTransform(scrollYProgress, [T.upload[0], T.upload[1]], [0, 1], { clamp: true });
  const uploadBarOpacity = useTransform(scrollYProgress, [T.press[1], T.upload[0]], [0, 1], { clamp: true });

  // Scene fades
  const uploadSceneOpacity = fadeRange(scrollYProgress, 0, 0.01, T.upload[1] - 0.02, T.upload[1]);
  const scanSceneOpacity = fadeRange(scrollYProgress, T.upload[1] - 0.02, T.scan[0], T.scan[1] - 0.02, T.scan[1]);
  const classifySceneOpacity = fadeRange(scrollYProgress, T.scan[1] - 0.02, T.classify[0], T.classify[1] - 0.02, T.classify[1]);
  const readySceneOpacity = fadeRange(scrollYProgress, T.classify[1] - 0.02, T.ready[0], 1, 1);

  // OCR + tag reveal
  const ocrCount = useTransform(scrollYProgress, [T.scan[0], T.scan[1]], [0, 5]);
  const [ocrShown, setOcrShown] = useState(0);
  useMotionValueEvent(ocrCount, "change", (v) => setOcrShown(Math.min(5, Math.max(0, Math.floor(v)))));

  const tagCount = useTransform(scrollYProgress, [T.classify[0], T.classify[1]], [0, 8]);
  const [tagsShown, setTagsShown] = useState(0);
  useMotionValueEvent(tagCount, "change", (v) => setTagsShown(Math.min(8, Math.max(0, Math.floor(v)))));

  // Files-ready counter — increments as each file gets selected
  const [filesReady, setFilesReady] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const n = v >= T.sel3[1] ? 3 : v >= T.sel2[1] ? 2 : v >= T.sel1[1] ? 1 : 0;
    if (n !== filesReady) setFilesReady(n);
  });

  const topFiles = [
    { name: "Invoice_Q3.pdf",     size: "1.2 MB", updated: "Sep 10", ext: "PDF",  icon: FileSpreadsheet, tint: "bg-emerald-100 text-emerald-600",   home: file1, sel: sel1On },
    { name: "Contract_2024.pdf",  size: "864 KB", updated: "Sep 05", ext: "PDF",  icon: FileSignature,   tint: "bg-sky-100 text-sky-600",           home: file2, sel: sel2On },
    { name: "Meeting_Notes.docx", size: "320 KB", updated: "Sep 12", ext: "DOCX", icon: FileText,        tint: "bg-violet-100 text-violet-600",     home: file3, sel: sel3On },
  ];
  const bottomFiles = [
    { name: "Budget_FY24.xlsx",   size: "3.1 MB", updated: "Sep 08", ext: "XLSX", icon: FileSpreadsheet, tint: "bg-emerald-100 text-emerald-600", x: "40%", y: "54%" },
    { name: "Project_Logo.png",   size: "4.5 MB", updated: "Sep 01", ext: "PNG",  icon: FileImage,       tint: "bg-amber-100 text-amber-600",      x: "61%", y: "54%" },
    { name: "Client_Forecast.pdf",size: "1.8 MB", updated: "Sep 14", ext: "PDF",  icon: FileText,        tint: "bg-sky-100 text-sky-600",          x: "82%", y: "54%" },
  ];

  const stations = STATION_DEFAULTS.map((s) => ({ icon: s.icon, label: isRTL ? s.labelAr : s.labelEn }));

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
                    <Icon size={20} className={isActive ? "text-accent-foreground" : isPast ? "text-accent" : "text-muted-foreground"} />
                  </motion.div>
                  <span className={`mt-2 text-[11px] md:text-xs font-semibold text-center ${isActive ? "text-accent" : isPast ? "text-foreground" : "text-muted-foreground"}`}>
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
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F9FAFB] border-b border-border">
              <span className="w-3 h-3 rounded-full bg-destructive/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="flex-1 mx-3 h-6 rounded-md bg-background border border-border flex items-center px-3">
                <span className="text-[11px] text-muted-foreground truncate">app.infasme.com/documents</span>
              </div>
            </div>

            {/* Stage */}
            <div className="relative h-[440px] md:h-[500px] bg-white">
              {/* ===== Upload scene ===== */}
              <motion.div className="absolute inset-0 flex" style={{ opacity: uploadSceneOpacity }}>
                {/* Sidebar */}
                <div className="w-[24%] border-r border-border bg-[#F9FAFB] flex flex-col py-4">
                  <div className="px-4 pb-3 border-b border-border/60 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
                      <FolderOpen size={13} className="text-accent-foreground" />
                    </div>
                    <span className="text-[11px] font-bold text-foreground tracking-tight">Infasme Docs</span>
                  </div>
                  <nav className="flex flex-col gap-0.5 mt-3 px-2 text-[11px]">
                    {[
                      { icon: Home, label: isRTL ? "الرئيسية" : "Home" },
                      { icon: FolderOpen, label: isRTL ? "المستندات" : "Documents", active: true },
                      { icon: Star, label: isRTL ? "المفضلة" : "Starred" },
                      { icon: Clock, label: isRTL ? "الأخيرة" : "Recent" },
                      { icon: Trash2, label: isRTL ? "المحذوفة" : "Trash" },
                    ].map((item, i) => {
                      const Ic = item.icon;
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${
                            item.active ? "bg-[hsl(var(--dm-coral-light))] text-accent font-semibold" : "text-muted-foreground"
                          }`}
                        >
                          <Ic size={12} />
                          <span>{item.label}</span>
                        </div>
                      );
                    })}
                  </nav>
                  <div className="mt-4 px-3">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-1.5 font-semibold">
                      {isRTL ? "المجلدات" : "Folders"}
                    </p>
                    {["Legal", "Finance", "HR"].map((f) => (
                      <div key={f} className="flex items-center gap-2 px-1 py-1 text-[11px] text-foreground/80">
                        <Folder size={11} className="text-muted-foreground" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main pane */}
                <div className="flex-1 flex flex-col min-w-0 relative">
                  {/* Toolbar */}
                  <div className="h-11 border-b border-border flex items-center gap-2 px-4 bg-white">
                    <span className="text-[11px] text-muted-foreground">Documents</span>
                    <span className="text-[11px] text-muted-foreground/50">/</span>
                    <span className="text-[11px] font-semibold text-foreground">Inbox</span>
                    <div className="flex-1" />
                    <div className="hidden md:flex items-center gap-1.5 h-6 px-2 rounded-md border border-border bg-[#F9FAFB] text-muted-foreground w-40">
                      <Search size={11} />
                      <span className="text-[10px]">{isRTL ? "بحث..." : "Search files..."}</span>
                    </div>
                    <div className="h-6 w-6 rounded-md border border-border flex items-center justify-center text-muted-foreground">
                      <Grid3x3 size={11} />
                    </div>
                    <div className="h-6 px-2 rounded-md bg-foreground text-background flex items-center gap-1 text-[10px] font-semibold">
                      <Plus size={11} />
                      <span>{isRTL ? "جديد" : "New"}</span>
                    </div>
                  </div>

                  {/* Content area */}
                  <div className="relative flex-1 bg-white">
                    <div className="absolute left-4 top-2.5 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
                      {isRTL ? "الملفات الحديثة" : "Recent files"}
                    </div>

                    {/* Top row — draggable, get blue selection ring */}
                    {topFiles.map((f) => {
                      const Ic = f.icon;
                      return (
                        <motion.div
                          key={f.name}
                          className="absolute -translate-x-1/2 -translate-y-1/2 w-[17%] rounded-xl border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_-6px_rgba(15,23,42,0.10)] p-2.5 flex flex-col gap-2 overflow-hidden"
                          style={{ left: f.home.x, top: f.home.y, opacity: sourceOpacity }}
                        >
                          {/* Blue selection glow */}
                          <motion.div
                            className="absolute inset-0 rounded-xl ring-2 ring-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] pointer-events-none"
                            style={{ opacity: f.sel }}
                          />
                          <div className={`aspect-[4/3] rounded-lg flex items-center justify-center ${f.tint}`}>
                            <Ic size={26} strokeWidth={1.6} />
                          </div>
                          <div className="min-w-0 px-0.5">
                            <p className="text-[10.5px] font-semibold text-foreground truncate leading-tight">{f.name}</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">{f.size}</p>
                            <p className="text-[9px] text-muted-foreground/70 mt-0.5">
                              {isRTL ? "آخر تحديث" : "Last updated"} {f.updated}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Bottom row — decorative */}
                    {bottomFiles.map((f) => {
                      const Ic = f.icon;
                      return (
                        <div
                          key={f.name}
                          className="absolute -translate-x-1/2 -translate-y-1/2 w-[17%] rounded-xl border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_-6px_rgba(15,23,42,0.10)] p-2.5 flex flex-col gap-2 overflow-hidden"
                          style={{ left: f.x, top: f.y }}
                        >
                          <div className={`aspect-[4/3] rounded-lg flex items-center justify-center ${f.tint}`}>
                            <Ic size={26} strokeWidth={1.6} />
                          </div>
                          <div className="min-w-0 px-0.5">
                            <p className="text-[10.5px] font-semibold text-foreground truncate leading-tight">{f.name}</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">{f.size}</p>
                            <p className="text-[9px] text-muted-foreground/70 mt-0.5">
                              {isRTL ? "آخر تحديث" : "Last updated"} {f.updated}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Drop zone — always visible */}
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-[70%] h-[24%]"
                      style={{ left: dropZ.x, top: dropZ.y }}
                    >
                      <motion.div
                        className="relative w-full h-full rounded-2xl border-2 border-dashed border-accent/60 bg-[hsl(var(--dm-coral-light))] flex flex-col items-center justify-center gap-1.5"
                        animate={{}}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            opacity: dropGlow,
                            boxShadow: "0 0 30px rgba(255,90,95,0.55), inset 0 0 0 2px hsl(var(--accent))",
                          }}
                        />
                        <div className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <Upload size={18} className="text-accent" />
                        </div>
                        <p className="relative text-[12px] font-semibold text-foreground">
                          {isRTL ? "أفلت الملفات هنا" : "Drop files to upload"}
                        </p>
                        <p className="relative text-[10px] text-muted-foreground">
                          {isRTL ? "PDF, DOCX, PNG, JPG حتى 50 ميجا" : "PDF, DOCX, PNG, JPG up to 50MB"}
                        </p>
                      </motion.div>
                    </div>

                    {/* Dragged stack of cards + count badge */}
                    <motion.div
                      className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ left: stackX, top: stackY, opacity: stackOpacity }}
                    >
                      <div className="relative w-[110px] h-[80px]">
                        {topFiles.map((f, i) => {
                          const Ic = f.icon;
                          const rot = [-6, -1, 4][i];
                          const off = [-8, 0, 8][i];
                          return (
                            <div
                              key={`stack-${i}`}
                              className="absolute inset-0 rounded-xl border border-border bg-white shadow-lg p-2 flex items-center gap-2"
                              style={{ transform: `translate(${off}px, ${off}px) rotate(${rot}deg)` }}
                            >
                              <div className={`w-9 h-9 rounded-md flex items-center justify-center ${f.tint}`}>
                                <Ic size={16} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-semibold text-foreground truncate">{f.name}</p>
                                <p className="text-[8px] text-muted-foreground">{f.size}</p>
                              </div>
                            </div>
                          );
                        })}
                        {/* Count badge */}
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[9px] font-bold shadow-md">
                          3 {isRTL ? "ملفات" : "Files"}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Bottom action bar */}
                  <div className="h-12 border-t border-border flex items-center justify-between px-4 bg-[#F9FAFB]">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      <span className="font-medium text-foreground">
                        {filesReady}
                        {isRTL ? " ملفات جاهزة" : " files ready"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded-md text-[10px] text-muted-foreground hover:bg-muted">
                        {isRTL ? "إلغاء" : "Cancel"}
                      </button>
                      <motion.button
                        type="button"
                        className="relative px-4 py-1.5 rounded-md bg-accent text-accent-foreground text-[11px] font-semibold shadow-md flex items-center gap-1.5"
                        style={{ scale: btnScale }}
                      >
                        <motion.span
                          className="absolute inset-0 rounded-md bg-accent"
                          style={{ opacity: btnGlow, filter: "blur(10px)" }}
                        />
                        <Upload size={11} className="relative z-10" />
                        <span className="relative z-10">{isRTL ? "رفع الملفات" : "Upload Files"}</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Upload progress bar */}
                  <motion.div
                    className="absolute left-4 right-4 bottom-1 h-1 bg-muted rounded-full overflow-hidden"
                    style={{ opacity: uploadBarOpacity }}
                  >
                    <motion.div className="h-full bg-accent origin-left" style={{ scaleX: uploadX }} />
                  </motion.div>
                </div>
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
                      <div key={i} className="flex items-center gap-2 transition-opacity duration-300" style={{ opacity: i < ocrShown ? 1 : 0.15 }}>
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
                    <span className="text-[10px] text-muted-foreground">{isRTL ? "عربي + إنجليزي" : "Arabic + English"}</span>
                  </div>
                </div>
              </motion.div>

              {/* ===== Classify scene ===== */}
              <motion.div className="absolute inset-0 p-6" style={{ opacity: classifySceneOpacity }}>
                <div className="h-full rounded-xl border border-border bg-card p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain size={20} className="text-accent" />
                    <span className="text-sm font-semibold text-foreground">{isRTL ? "تصنيف تلقائي..." : "Auto-classifying..."}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium flex items-center gap-1 transition-all duration-300"
                        style={{ opacity: i < tagsShown ? 1 : 0, transform: i < tagsShown ? "scale(1)" : "scale(0.6)" }}
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ===== Ready scene ===== */}
              <motion.div className="absolute inset-0 p-6 flex items-center justify-center" style={{ opacity: readySceneOpacity }}>
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    <CheckCircle size={40} className="text-accent" />
                  </motion.div>
                  <p className="text-lg font-semibold text-foreground">{isRTL ? "المستند جاهز!" : "Document Ready!"}</p>
                  <p className="text-sm text-muted-foreground text-center">
                    {isRTL ? "قابل للبحث • قابل للمشاركة • مؤرشف بأمان" : "Searchable • Shareable • Securely Archived"}
                  </p>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {["< 5s", isRTL ? "مؤمّن" : "Encrypted", isRTL ? "نسخة احتياطية" : "Backed up"].map((badge, i) => (
                      <span key={i} className="px-2.5 py-1 bg-accent/10 text-accent rounded text-xs font-medium">{badge}</span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Cursor overlay */}
              <motion.div
                className="absolute z-40 pointer-events-none -translate-x-1 -translate-y-1"
                style={{ left: cx, top: cy, opacity: cursorOpacity }}
              >
                <MousePointer2 className="text-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" size={22} fill="currentColor" />
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
