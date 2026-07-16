import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Check,
  ArrowUp,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useMotionPreference } from "@/hooks/useReducedMotion";
import AnimatedDocFlow from "./AnimatedDocFlow";

/* ============================================================
   Stage machine
   ============================================================ */
type Stage =
  | "idle"
  | "sel0" | "sel1" | "sel2"
  | "drag" | "dropped"
  | "upload" | "scan" | "classify" | "ready"
  | "reset";

const SEQ: { stage: Stage; ms: number }[] = [
  { stage: "idle",     ms: 500  },
  { stage: "sel0",     ms: 900  },
  { stage: "sel1",     ms: 900  },
  { stage: "sel2",     ms: 900  },
  { stage: "drag",     ms: 1600 },
  { stage: "dropped",  ms: 1400 }, // files queued visible before stepper starts advancing
  { stage: "upload",   ms: 2000 },
  { stage: "scan",     ms: 2000 },
  { stage: "classify", ms: 2000 },
  { stage: "ready",    ms: 2400 },
  { stage: "reset",    ms: 500  },
];

/* activeStep in the top stepper */
const stepperFor = (s: Stage): number => {
  switch (s) {
    case "idle":
    case "sel0":
    case "sel1":
    case "sel2":
    case "drag":     return 0;
    case "dropped":
    case "upload":   return 1;
    case "scan":     return 2;
    case "classify": return 3;
    case "ready":    return 4;
    default:         return 0;
  }
};

/* Cursor target per stage (percent of main pane) */
const POS = {
  idle:  { x: 22, y: 14 },
  f0:    { x: 20, y: 32 },
  f1:    { x: 50, y: 32 },
  f2:    { x: 80, y: 32 },
  drop:  { x: 50, y: 72 },
  btn:   { x: 88, y: 94 },
};
const cursorFor = (s: Stage) => {
  switch (s) {
    case "sel0": return POS.f0;
    case "sel1": return POS.f1;
    case "sel2": return POS.f2;
    case "drag": return POS.drop;
    case "dropped":
    case "upload":
    case "scan":
    case "classify":
    case "ready": return POS.btn;
    default: return POS.idle;
  }
};

/* ============================================================
   Top Stepper
   ============================================================ */
const Stepper = ({ activeStep, isRTL }: { activeStep: number; isRTL: boolean }) => {
  const stations = [
    { icon: MousePointer2, en: "Select & Drag",  ar: "اختر واسحب" },
    { icon: Upload,        en: "Upload",         ar: "رفع" },
    { icon: ScanLine,      en: "Scan & OCR",     ar: "مسح ضوئي" },
    { icon: Brain,         en: "Classify",       ar: "تصنيف" },
    { icon: FolderCheck,   en: "Ready",          ar: "جاهز" },
  ];

  return (
    <div className="relative w-full max-w-3xl px-4 mb-6">
      <div className="relative flex items-start justify-between">
        <div className="absolute top-6 left-[8%] right-[8%] h-0.5 bg-border z-0 overflow-hidden">
          <motion.div
            className="h-full bg-accent origin-left"
            animate={{ scaleX: activeStep / 4 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        {stations.map((station, i) => {
          const Icon = station.icon;
          const isActive = i === activeStep;
          const isPast   = i < activeStep;
          const isDone   = activeStep === 4 && i === 4;

          // per-stage icon animation
          let iconAnim: any = {};
          if (isActive && i === 0) iconAnim = { scale: [1, 1.15, 1] };
          if (isActive && i === 1) iconAnim = { y: [0, -3, 0] };
          if (isActive && i === 3) iconAnim = { rotate: [0, 360] };
          if (isDone)              iconAnim = { scale: [1, 1.25, 1] };

          const iconTrans: any =
            i === 3 && isActive
              ? { duration: 3, repeat: Infinity, ease: "linear" }
              : { duration: 1.2, repeat: Infinity, ease: "easeInOut" };

          return (
            <div key={i} className="relative z-10 flex flex-col items-center" style={{ width: `${100 / stations.length}%` }}>
              <motion.div
                className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isDone
                    ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/40"
                    : isActive
                    ? "bg-accent border-accent shadow-lg shadow-accent/30"
                    : isPast
                    ? "bg-accent/10 border-accent"
                    : "bg-card border-border"
                }`}
                animate={{ scale: isActive || isDone ? 1.12 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Stage 3 (Scan): laser sweep */}
                {isActive && i === 2 && (
                  <motion.div
                    className="absolute left-1 right-1 h-[2px] bg-white/90 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)]"
                    animate={{ top: ["15%", "85%", "15%"] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                {/* Stage 4 (Classify): glow */}
                {isActive && i === 3 && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: "0 0 18px hsl(var(--accent))" }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                )}
                <motion.div animate={iconAnim} transition={iconTrans}>
                  {isDone ? (
                    <Check size={22} className="text-white" strokeWidth={3} />
                  ) : (
                    <Icon
                      size={20}
                      className={isActive ? "text-accent-foreground" : isPast ? "text-accent" : "text-muted-foreground"}
                    />
                  )}
                </motion.div>
              </motion.div>
              <span
                className={`mt-2 text-[11px] md:text-xs font-semibold text-center ${
                  isDone ? "text-emerald-600" : isActive ? "text-accent" : isPast ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {isRTL ? station.ar : station.en}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================
   DMS Interactive Scene
   ============================================================ */
type FileItem = {
  name: string; size: string; updated: string; ext: string;
  icon: any; tint: string;
};

const DMSScene = ({ stage, isRTL }: { stage: Stage; isRTL: boolean }) => {
  const topFiles: FileItem[] = [
    { name: "Invoice_Q3.pdf",    size: "1.2 MB", updated: "Sep 10", ext: "PDF",  icon: FileSpreadsheet, tint: "bg-emerald-100 text-emerald-600" },
    { name: "Contract_2024.pdf", size: "864 KB", updated: "Sep 05", ext: "PDF",  icon: FileSignature,   tint: "bg-sky-100 text-sky-600" },
    { name: "Meeting_Notes.docx",size: "320 KB", updated: "Sep 12", ext: "DOCX", icon: FileText,        tint: "bg-violet-100 text-violet-600" },
  ];
  const bottomFiles: FileItem[] = [
    { name: "Budget_FY24.xlsx",   size: "3.1 MB", updated: "Sep 08", ext: "XLSX", icon: FileSpreadsheet, tint: "bg-emerald-100 text-emerald-600" },
    { name: "Project_Logo.png",   size: "4.5 MB", updated: "Sep 01", ext: "PNG",  icon: FileImage,       tint: "bg-amber-100 text-amber-600" },
    { name: "Client_Forecast.pdf",size: "1.8 MB", updated: "Sep 14", ext: "PDF",  icon: FileText,        tint: "bg-sky-100 text-sky-600" },
  ];

  const selected = new Set<number>();
  if (["sel0","sel1","sel2","drag","dropped","upload","scan","classify","ready"].includes(stage)) selected.add(0);
  if (["sel1","sel2","drag","dropped","upload","scan","classify","ready"].includes(stage)) selected.add(1);
  if (["sel2","drag","dropped","upload","scan","classify","ready"].includes(stage)) selected.add(2);

  const isDragging = stage === "drag";
  const isDropped  = ["dropped","upload","scan","classify","ready"].includes(stage);
  const uploadPhase = ["upload","scan","classify","ready"].includes(stage);

  const cursor = cursorFor(stage);
  const stackPos = isDragging ? POS.drop : POS.f2;

  const readyCount = selected.size;

  return (
    <div className="absolute inset-0 flex bg-white select-none">
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

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 gap-4 min-h-0 relative">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
            {isRTL ? "الملفات الحديثة" : "Recent files"}
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {[...topFiles, ...bottomFiles].map((f, i) => {
              const Ic = f.icon;
              const isTop = i < 3;
              const isSelected = isTop && selected.has(i);
              return (
                <motion.div
                  key={f.name}
                  className={`relative rounded-xl border p-2.5 flex flex-col gap-1.5 overflow-hidden transition-colors duration-200 ${
                    isSelected
                      ? "border-transparent ring-2 ring-rose-500 bg-rose-50 shadow-[0_4px_12px_rgba(244,63,94,0.18)]"
                      : "border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                  animate={{ opacity: isTop && isDragging ? 0.35 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Checkmark badge */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                        className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center shadow-md z-10"
                      >
                        <Check size={10} className="text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>

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

          {/* Drop zone */}
          <div className="mt-auto relative">
            <motion.div
              className={`relative w-full h-[92px] rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDropped
                  ? "border-2 border-emerald-400 bg-emerald-50/60"
                  : isDragging
                  ? "border-2 border-accent bg-[hsl(var(--dm-coral-light))]"
                  : "border-2 border-dashed border-accent/50 bg-[hsl(var(--dm-coral-light))]"
              }`}
              animate={{
                boxShadow: isDragging
                  ? "0 0 30px rgba(255,90,95,0.55)"
                  : isDropped
                  ? "0 0 20px rgba(16,185,129,0.25)"
                  : "0 0 0px rgba(0,0,0,0)",
              }}
              transition={{ duration: 0.35 }}
            >
              <AnimatePresence mode="wait">
                {isDropped ? (
                  <motion.div
                    key="dropped"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                      <Check size={16} className="text-white" strokeWidth={3} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        {topFiles.map((f, i) => {
                          const Ic = f.icon;
                          return (
                            <motion.div
                              key={f.name}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 400, damping: 20 }}
                              className={`w-6 h-6 rounded-md flex items-center justify-center ${f.tint}`}
                            >
                              <Ic size={12} />
                            </motion.div>
                          );
                        })}
                      </div>
                      <p className="text-[11px] font-semibold text-foreground mt-1">
                        3 {isRTL ? "ملفات في قائمة المعالجة" : "Files Queued for Processing"}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <div className="relative w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Upload size={16} className="text-accent" />
                    </div>
                    <p className="text-[11px] font-semibold text-foreground">
                      {isRTL ? "أفلت الملفات هنا" : "Drop files to upload"}
                    </p>
                    <p className="text-[9.5px] text-muted-foreground">
                      {isRTL ? "PDF, DOCX, PNG, JPG حتى 50 ميجا" : "PDF, DOCX, PNG, JPG up to 50MB"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="h-11 border-t border-border flex items-center justify-between px-4 bg-white shrink-0">
          <div className="flex items-center gap-2 text-[10.5px]">
            <span className={`w-1.5 h-1.5 rounded-full ${readyCount > 0 ? "bg-accent" : "bg-muted-foreground/40"}`} />
            <span className="font-medium text-foreground">
              {readyCount} {isRTL ? "ملفات جاهزة" : "files ready"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-md text-[10px] text-muted-foreground hover:bg-muted">
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <motion.button
              type="button"
              className="relative px-3.5 py-1.5 rounded-md bg-accent text-accent-foreground text-[10.5px] font-semibold shadow-md flex items-center gap-1.5 overflow-hidden"
              animate={{ scale: uploadPhase ? 0.96 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {uploadPhase && (
                <motion.span
                  className="absolute inset-0 bg-white/25"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
              )}
              <Upload size={11} className="relative z-10" />
              <span className="relative z-10">{isRTL ? "رفع الملفات" : "Upload Files"}</span>
            </motion.button>
          </div>
        </div>

        {/* Dragged floating stack */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              initial={{ left: `${POS.f1.x}%`, top: `${POS.f1.y}%`, opacity: 0, scale: 0.9 }}
              animate={{ left: `${stackPos.x}%`, top: `${stackPos.y}%`, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.25 } }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            >
              <div className="relative w-[130px] h-[68px]">
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
          )}
        </AnimatePresence>

        {/* Cursor overlay */}
        <motion.div
          className="absolute z-40 pointer-events-none -translate-x-1 -translate-y-1"
          initial={{ left: `${POS.idle.x}%`, top: `${POS.idle.y}%` }}
          animate={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
          transition={{ duration: stage === "drag" ? 1.4 : 0.7, ease: "easeInOut" }}
        >
          <MousePointer2
            className="text-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
            size={20}
            fill="currentColor"
          />
        </motion.div>

        {/* Processing overlays */}
        <AnimatePresence>
          {stage === "scan" && (
            <motion.div
              key="scan-ovl"
              className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex items-center justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="relative w-[62%] h-[70%] rounded-xl border border-border bg-card overflow-hidden p-5">
                <motion.div
                  className="absolute left-0 right-0 h-[2px] bg-accent shadow-[0_0_12px_hsl(var(--accent))]"
                  animate={{ top: ["8%", "92%", "8%"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="space-y-2.5">
                  {(isRTL
                    ? ["عقد تجاري #٤٥٦٧", "شركة الأهلي للتجارة", "١٥ يناير ٢٠٢٤", "قيمة: ٢٥٠٬٠٠٠ درهم", "التوقيعات معتمدة"]
                    : ["Commercial Contract #4567","Al Ahly Trading Co.","January 15, 2024","Value: AED 250,000","Signatures verified"]
                  ).map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.25 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle size={12} className="text-accent" />
                      <span className="text-[11px] text-foreground">{line}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="absolute bottom-3 right-4 text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                  99% {isRTL ? "دقة" : "accuracy"}
                </div>
              </div>
            </motion.div>
          )}

          {stage === "classify" && (
            <motion.div
              key="cls-ovl"
              className="absolute inset-0 z-20 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Brain size={30} className="text-accent" />
              </motion.div>
              <div className="flex flex-wrap gap-1.5 justify-center max-w-[70%]">
                {(isRTL
                  ? ["عقد","تجاري","عربي","موقّع","٢٠٢٤","قانوني","AED","معتمد"]
                  : ["Contract","Commercial","Arabic","Signed","2024","Legal","AED","Verified"]
                ).map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.12, type: "spring", stiffness: 400, damping: 18 }}
                    className="px-2.5 py-1 bg-accent/10 text-accent rounded-full text-[10.5px] font-semibold flex items-center gap-1"
                  >
                    <Tag size={9} />
                    {tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {stage === "ready" && (
            <motion.div
              key="ready-ovl"
              className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <CheckCircle size={40} className="text-emerald-500" />
              </motion.div>
              <p className="text-base font-semibold text-foreground">
                {isRTL ? "المستندات جاهزة!" : "Documents Ready!"}
              </p>
              <div className="flex gap-1.5 flex-wrap justify-center">
                {(isRTL
                  ? ["قابل للبحث","قابل للمشاركة","مؤرشف بأمان"]
                  : ["Searchable","Shareable","Securely Archived"]
                ).map((b) => (
                  <span key={b} className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded text-[10.5px] font-semibold">
                    {b}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ============================================================
   Main
   ============================================================ */
const ScrollDocFlow = () => {
  const { isRTL } = useLanguage();
  const { reduced, mobile } = useMotionPreference();

  const [idx, setIdx] = useState(0);
  const stage = SEQ[idx].stage;

  useEffect(() => {
    if (reduced || mobile) return;
    const to = setTimeout(() => setIdx((i) => (i + 1) % SEQ.length), SEQ[idx].ms);
    return () => clearTimeout(to);
  }, [idx, reduced, mobile]);

  if (reduced || mobile) return <AnimatedDocFlow />;

  const activeStep = stepperFor(stage);

  return (
    <div className="relative py-12">
      <div className="flex flex-col items-center justify-center">
        <Stepper activeStep={activeStep} isRTL={isRTL} />

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

            <div className="relative h-[520px] bg-white overflow-hidden">
              <DMSScene stage={stage} isRTL={isRTL} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ScrollDocFlow;
