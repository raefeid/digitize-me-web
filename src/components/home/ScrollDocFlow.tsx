import { useEffect, useRef, useState } from "react";
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

const fadeRange = (p: MotionValue<number>, inStart: number, inEnd: number, outStart: number, outEnd: number) => {
  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  const a = clamp(inStart);
  const b = Math.max(a, clamp(inEnd));
  const c = Math.max(b, clamp(outStart));
  const d = Math.max(c, clamp(outEnd));
  return useTransform(p, [a, b, c, d], [0, 1, 1, 0], { clamp: true });
};

// Scroll segments control WHICH scene is visible, not the drag animation.
const T = {
  upload:  [0.00, 0.55] as const,
  scan:    [0.55, 0.72] as const,
  classify:[0.72, 0.88] as const,
  ready:   [0.88, 1.00] as const,
};

/* =========================================================================
   Self-contained looping upload animation
   ========================================================================= */
// Loop timing (seconds). Total ~13s.
const LOOP = 13;
const K = {
  idle:    0.00,
  sel1:    0.06,   // cursor arrives at file 1
  sel1End: 0.12,
  sel2:    0.18,
  sel2End: 0.24,
  sel3:    0.30,
  sel3End: 0.36,
  dragEnd: 0.55,   // arrives at drop zone
  drop:    0.60,   // stack absorbed
  btnAt:   0.70,   // arrives at upload button
  press:   0.74,
  progEnd: 0.90,
  reset:   1.00,
};
const t = (k: number) => k * LOOP;

// Percentage coords on the main pane (right of sidebar)
// Grid: 3 cols × 2 rows using p-4 gap-3 layout
const P = {
  idle:   { x: "28%", y: "12%" },
  file1:  { x: "18%", y: "27%" },
  file2:  { x: "50%", y: "27%" },
  file3:  { x: "82%", y: "27%" },
  drop:   { x: "50%", y: "72%" },
  btn:    { x: "88%", y: "95%" },
};

const UploadAnimation = ({ isRTL }: { isRTL: boolean }) => {
  const topFiles = [
    { name: "Invoice_Q3.pdf",     size: "1.2 MB", updated: "Sep 10", ext: "PDF",  icon: FileSpreadsheet, tint: "bg-emerald-100 text-emerald-600" },
    { name: "Contract_2024.pdf",  size: "864 KB", updated: "Sep 05", ext: "PDF",  icon: FileSignature,   tint: "bg-sky-100 text-sky-600" },
    { name: "Meeting_Notes.docx", size: "320 KB", updated: "Sep 12", ext: "DOCX", icon: FileText,        tint: "bg-violet-100 text-violet-600" },
  ];
  const bottomFiles = [
    { name: "Budget_FY24.xlsx",   size: "3.1 MB", updated: "Sep 08", ext: "XLSX", icon: FileSpreadsheet, tint: "bg-emerald-100 text-emerald-600" },
    { name: "Project_Logo.png",   size: "4.5 MB", updated: "Sep 01", ext: "PNG",  icon: FileImage,       tint: "bg-amber-100 text-amber-600" },
    { name: "Client_Forecast.pdf",size: "1.8 MB", updated: "Sep 14", ext: "PDF",  icon: FileText,        tint: "bg-sky-100 text-sky-600" },
  ];

  // ---- Cursor keyframes (looping) ----
  const cursorX = [P.idle.x, P.file1.x, P.file1.x, P.file2.x, P.file2.x, P.file3.x, P.file3.x, P.drop.x, P.drop.x, P.btn.x, P.btn.x, P.btn.x, P.idle.x];
  const cursorY = [P.idle.y, P.file1.y, P.file1.y, P.file2.y, P.file2.y, P.file3.y, P.file3.y, P.drop.y, P.drop.y, P.btn.y, P.btn.y, P.btn.y, P.idle.y];
  const cursorTimes = [K.idle, K.sel1, K.sel1End, K.sel2, K.sel2End, K.sel3, K.sel3End, K.dragEnd, K.drop, K.btnAt, K.press, K.progEnd, K.reset];

  // Per-file selection glow (0 or 1). Selected once cursor lands, cleared on reset.
  const sel1Keys    = [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0];
  const sel2Keys    = [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0];
  const sel3Keys    = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0];
  const selTimes    = cursorTimes;

  // Source tiles fade after stack "drops"
  const sourceOpacityKeys = [1, 1, 1, 1, 1, 1, 1, 1, 0.25, 0.25, 0.25, 0.25, 1];

  // Dragged stack visibility — appears when all 3 selected, disappears at drop
  const stackOpacityKeys  = [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0];
  const stackXKeys        = [P.file3.x, P.file3.x, P.file3.x, P.file3.x, P.file3.x, P.file3.x, P.file3.x, P.drop.x, P.drop.x, P.drop.x, P.drop.x, P.drop.x, P.file3.x];
  const stackYKeys        = [P.file3.y, P.file3.y, P.file3.y, P.file3.y, P.file3.y, P.file3.y, P.file3.y, P.drop.y, P.drop.y, P.drop.y, P.drop.y, P.drop.y, P.file3.y];

  // Drop zone glow — active while stack hovers over it (last ~30% of drag)
  const dropGlowKeys      = [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
  const dropGlowTimes     = [K.idle, K.sel1, K.sel1End, K.sel2, K.sel2End, K.sel3, K.sel3End, K.dragEnd, K.drop + 0.02, K.btnAt, K.press, K.progEnd, K.reset];

  // Files-ready counter — text swap based on discrete keyframes
  const readyKeys         = [0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 0];

  // Button press + glow
  const btnScaleKeys      = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.92, 1, 1];
  const btnGlowKeys       = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0];

  // Upload progress bar (scaleX)
  const progressKeys      = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0];
  const progressOpaKeys   = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0];

  const spring = { duration: LOOP, times: cursorTimes, repeat: Infinity, ease: "easeInOut" as const };
  const step   = { duration: LOOP, times: cursorTimes, repeat: Infinity, ease: "linear" as const };

  const [ready, setReady] = useState(0);

  return (
    <div className="absolute inset-0 flex bg-white">
      {/* Sidebar */}
      <div className="w-[22%] border-r border-border bg-[#F9FAFB] flex flex-col py-3 shrink-0">
        <div className="px-3 pb-2.5 border-b border-border/60 flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center">
            <FolderOpen size={11} className="text-accent-foreground" />
          </div>
          <span className="text-[10.5px] font-bold text-foreground tracking-tight">Infasme Docs</span>
        </div>
        <nav className="flex flex-col gap-0.5 mt-2 px-2 text-[10.5px]">
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
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${
                  item.active ? "bg-[hsl(var(--dm-coral-light))] text-accent font-semibold" : "text-muted-foreground"
                }`}
              >
                <Ic size={11} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
        <div className="mt-3 px-3">
          <p className="text-[8.5px] uppercase tracking-wider text-muted-foreground/70 mb-1 font-semibold">
            {isRTL ? "المجلدات" : "Folders"}
          </p>
          {["Legal", "Finance", "HR"].map((f) => (
            <div key={f} className="flex items-center gap-2 px-1 py-1 text-[10.5px] text-foreground/80">
              <Folder size={10} className="text-muted-foreground" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main pane */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* Toolbar */}
        <div className="h-10 border-b border-border flex items-center gap-2 px-3 bg-white shrink-0">
          <span className="text-[10.5px] text-muted-foreground">Documents</span>
          <span className="text-[10.5px] text-muted-foreground/50">/</span>
          <span className="text-[10.5px] font-semibold text-foreground">Inbox</span>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-1.5 h-6 px-2 rounded-md border border-border bg-[#F9FAFB] text-muted-foreground w-36">
            <Search size={10} />
            <span className="text-[10px]">{isRTL ? "بحث..." : "Search files..."}</span>
          </div>
          <div className="h-6 w-6 rounded-md border border-border flex items-center justify-center text-muted-foreground">
            <Grid3x3 size={10} />
          </div>
          <div className="h-6 px-2 rounded-md bg-foreground text-background flex items-center gap-1 text-[10px] font-semibold">
            <Plus size={10} />
            <span>{isRTL ? "جديد" : "New"}</span>
          </div>
        </div>

        {/* Content — grid + drop zone stacked with breathing room */}
        <div className="flex-1 flex flex-col p-4 gap-4 min-h-0 relative">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
            {isRTL ? "الملفات الحديثة" : "Recent files"}
          </p>

          {/* 3×2 file grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {[...topFiles, ...bottomFiles].map((f, i) => {
              const Ic = f.icon;
              const selKeysArr = [sel1Keys, sel2Keys, sel3Keys][i];
              const isDraggable = i < 3;
              return (
                <motion.div
                  key={f.name}
                  className="relative rounded-xl border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-2.5 flex flex-col gap-1.5 overflow-hidden"
                  animate={isDraggable ? { opacity: sourceOpacityKeys } : undefined}
                  transition={isDraggable ? step : undefined}
                >
                  {isDraggable && (
                    <motion.div
                      className="absolute inset-0 rounded-xl ring-2 ring-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] pointer-events-none"
                      animate={{ opacity: selKeysArr }}
                      transition={step}
                    />
                  )}
                  <div className={`h-14 rounded-lg flex items-center justify-center ${f.tint}`}>
                    <Ic size={22} strokeWidth={1.6} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-foreground truncate leading-tight">{f.name}</p>
                    <p className="text-[8.5px] text-muted-foreground mt-0.5">{f.size}</p>
                    <p className="text-[8.5px] text-muted-foreground/70">
                      {isRTL ? "آخر تحديث" : "Last updated"} {f.updated}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Drop zone — sits below grid, always visible */}
          <div className="mt-auto relative">
            <motion.div
              className="relative w-full h-[88px] rounded-2xl border-2 border-dashed border-accent/50 bg-[hsl(var(--dm-coral-light))] flex flex-col items-center justify-center gap-0.5"
            >
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-accent"
                style={{ boxShadow: "0 0 30px rgba(255,90,95,0.55)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: dropGlowKeys }}
                transition={{ duration: LOOP, times: dropGlowTimes, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Upload size={16} className="text-accent" />
              </div>
              <p className="relative text-[11px] font-semibold text-foreground">
                {isRTL ? "أفلت الملفات هنا" : "Drop files to upload"}
              </p>
              <p className="relative text-[9.5px] text-muted-foreground">
                {isRTL ? "PDF, DOCX, PNG, JPG حتى 50 ميجا" : "PDF, DOCX, PNG, JPG up to 50MB"}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Bottom action bar — pinned bottom */}
        <div className="h-11 border-t border-border flex items-center justify-between px-4 bg-white shrink-0">
          <div className="flex items-center gap-2 text-[10.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
            <motion.span
              className="font-medium text-foreground"
              animate={{ opacity: 1 }}
              onUpdate={() => {}}
            >
              <ReadyCounter isRTL={isRTL} keys={readyKeys} times={selTimes} />
            </motion.span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-md text-[10px] text-muted-foreground hover:bg-muted">
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <motion.button
              type="button"
              className="relative px-3.5 py-1.5 rounded-md bg-accent text-accent-foreground text-[10.5px] font-semibold shadow-md flex items-center gap-1.5"
              animate={{ scale: btnScaleKeys }}
              transition={step}
            >
              <motion.span
                className="absolute inset-0 rounded-md bg-accent -z-0"
                style={{ filter: "blur(10px)" }}
                animate={{ opacity: btnGlowKeys }}
                transition={step}
              />
              <Upload size={11} className="relative z-10" />
              <span className="relative z-10">{isRTL ? "رفع الملفات" : "Upload Files"}</span>
            </motion.button>
          </div>
        </div>

        {/* Upload progress bar */}
        <motion.div
          className="absolute left-3 right-3 bottom-1 h-1 bg-muted rounded-full overflow-hidden"
          animate={{ opacity: progressOpaKeys }}
          transition={step}
        >
          <motion.div
            className="h-full bg-accent origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progressKeys }}
            transition={step}
          />
        </motion.div>

        {/* Dragged floating stack (absolute over main pane) */}
        <motion.div
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          initial={{ opacity: 0, left: P.file3.x, top: P.file3.y }}
          animate={{
            left: stackXKeys as unknown as string[],
            top: stackYKeys as unknown as string[],
            opacity: stackOpacityKeys,
          }}
          transition={step}
        >
          <div className="relative w-[120px] h-[64px]">
            {topFiles.map((f, i) => {
              const Ic = f.icon;
              const rot = [-7, -1, 5][i];
              const off = [-8, 0, 8][i];
              return (
                <div
                  key={`stack-${i}`}
                  className="absolute inset-0 rounded-lg border border-border bg-white shadow-xl p-2 flex items-center gap-2"
                  style={{ transform: `translate(${off}px, ${off * 0.6}px) rotate(${rot}deg)` }}
                >
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${f.tint}`}>
                    <Ic size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold text-foreground truncate">{f.name}</p>
                    <p className="text-[8px] text-muted-foreground">{f.size}</p>
                  </div>
                </div>
              );
            })}
            <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[9px] font-bold shadow-md">
              3 {isRTL ? "ملفات" : "Files"}
            </div>
          </div>
        </motion.div>

        {/* Cursor overlay */}
        <motion.div
          className="absolute z-40 pointer-events-none -translate-x-1 -translate-y-1"
          initial={{ left: P.idle.x, top: P.idle.y }}
          animate={{
            left: cursorX as unknown as string[],
            top: cursorY as unknown as string[],
          }}
          transition={spring}
        >
          <MousePointer2 className="text-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" size={20} fill="currentColor" />
        </motion.div>
      </div>
    </div>
  );
};

// Small child that flips a counter using an interval synced to loop
const ReadyCounter = ({ isRTL, keys, times }: { isRTL: boolean; keys: number[]; times: number[] }) => {
  const [n, setN] = useState(0);
  const startRef = useRef(Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = ((Date.now() - startRef.current) / 1000) % LOOP;
      const frac = elapsed / LOOP;
      let cur = 0;
      for (let i = 0; i < times.length; i++) {
        if (frac >= times[i]) cur = keys[i];
      }
      setN(cur);
    }, 120);
    return () => clearInterval(id);
  }, [keys, times]);
  return <>{n}{isRTL ? " ملفات جاهزة" : " files ready"}</>;
};

/* =========================================================================
   Main component
   ========================================================================= */
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
    if (v >= T.upload[1] * 0.5) idx = 1;
    if (v >= T.scan[0]) idx = 2;
    if (v >= T.classify[0]) idx = 3;
    if (v >= T.ready[0]) idx = 4;
    if (idx !== activeStep) setActiveStep(idx);
  });

  const railProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const uploadSceneOpacity   = fadeRange(scrollYProgress, 0, 0.01, T.upload[1] - 0.02, T.upload[1]);
  const scanSceneOpacity     = fadeRange(scrollYProgress, T.upload[1] - 0.02, T.scan[0], T.scan[1] - 0.02, T.scan[1]);
  const classifySceneOpacity = fadeRange(scrollYProgress, T.scan[1] - 0.02, T.classify[0], T.classify[1] - 0.02, T.classify[1]);
  const readySceneOpacity    = fadeRange(scrollYProgress, T.classify[1] - 0.02, T.ready[0], 1, 1);

  const ocrCount = useTransform(scrollYProgress, [T.scan[0], T.scan[1]], [0, 5]);
  const [ocrShown, setOcrShown] = useState(0);
  useMotionValueEvent(ocrCount, "change", (v) => setOcrShown(Math.min(5, Math.max(0, Math.floor(v)))));

  const tagCount = useTransform(scrollYProgress, [T.classify[0], T.classify[1]], [0, 8]);
  const [tagsShown, setTagsShown] = useState(0);
  useMotionValueEvent(tagCount, "change", (v) => setTagsShown(Math.min(8, Math.max(0, Math.floor(v)))));

  const stations = STATION_DEFAULTS.map((s) => ({ icon: s.icon, label: isRTL ? s.labelAr : s.labelEn }));

  const ocrLines = isRTL
    ? ["عقد تجاري رقم ٤٥٦٧", "شركة الأهلي للتجارة", "بتاريخ ١٥ يناير ٢٠٢٤", "قيمة العقد: ٢٥٠,٠٠٠ درهم", "توقيع الطرفين معتمد"]
    : ["Commercial Contract #4567", "Al Ahly Trading Company", "Dated January 15, 2024", "Contract value: AED 250,000", "Signatures verified"];

  const tags = isRTL
    ? ["عقد", "تجاري", "عربي", "موقّع", "٢٠٢٤", "قانوني", "AED", "معتمد"]
    : ["Contract", "Commercial", "Arabic", "Signed", "2024", "Legal", "AED", "Verified"];

  return (
    <div ref={sectionRef} className="relative" style={{ height: "400vh" }}>
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
                      isActive ? "bg-accent border-accent shadow-lg shadow-accent/30" : isPast ? "bg-accent/10 border-accent" : "bg-card border-border"
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
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F9FAFB] border-b border-border">
              <span className="w-3 h-3 rounded-full bg-destructive/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="flex-1 mx-3 h-6 rounded-md bg-background border border-border flex items-center px-3">
                <span className="text-[11px] text-muted-foreground truncate">app.infasme.com/documents</span>
              </div>
            </div>

            <div className="relative h-[460px] md:h-[500px] bg-white overflow-hidden">
              {/* Upload scene — self-contained looping animation */}
              <motion.div className="absolute inset-0" style={{ opacity: uploadSceneOpacity }}>
                <UploadAnimation isRTL={isRTL} />
              </motion.div>

              {/* Scan / OCR */}
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

              {/* Classify */}
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

              {/* Ready */}
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
