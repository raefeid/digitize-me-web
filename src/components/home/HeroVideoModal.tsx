import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import promoVideo from "@/assets/digitizeme-promo.mp4";
import promoPoster from "@/assets/hero/digitizeme-promo-poster.jpg";

/**
 * Hero brand video: shows a live muted preview with a polished play button;
 * opens a fullscreen modal with the self-hosted promo video.
 * Video: DigitizeMe brand + walkthrough.
 */
const VIDEO_URL = promoVideo;
const POSTER_URL = promoPoster;

const HeroVideoModal = () => {
  const { isRTL } = useLanguage();
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);

  // The promo is a large file, so the hover-preview does not autoplay/preload —
  // the poster is the resting state and the video only streams on hover.
  const playPreview = () => {
    const v = previewRef.current;
    if (v) void v.play().catch(() => {});
  };
  const stopPreview = () => {
    const v = previewRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (open) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [open]);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        onMouseEnter={playPreview}
        onMouseLeave={stopPreview}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        whileHover={{ scale: 1.005 }}
        className="group relative block w-full max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border aspect-video bg-black"
        aria-label={isRTL ? "شغل فيديو المنتج" : "Play product video"}
      >
        {/* Static poster image — always visible as the preview frame */}
        <img
          src={POSTER_URL}
          alt={isRTL ? "معاينة فيديو المنتج" : "Product video preview"}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />

        {/* Muted video preview layered on top of the poster — streams on hover
            only (no autoplay/preload) since the promo is a large file. */}
        <video
          ref={previewRef}
          src={VIDEO_URL}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        />

        {/* Subtle vignette so the play button pops */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-accent/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Center play control */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/95 text-accent flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/30"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="absolute inset-0 rounded-full bg-white/40 animate-ping" />
            <Play size={32} className="relative ml-1" fill="currentColor" />
          </motion.div>
        </div>

        {/* Bottom-left caption */}
        <div className="absolute bottom-0 inset-x-0 p-4 md:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-start">
          <div className="flex items-center gap-2 text-white font-semibold text-sm md:text-base">
            <Play size={14} className="fill-current" />
            {isRTL ? "شاهد كيف يعمل DigitizeMe" : "See how DigitizeMe works"}
          </div>
          <div className="text-white/80 text-xs md:text-sm mt-0.5">
            {isRTL ? "جولة قصيرة داخل المنصة" : "A short walkthrough inside the platform"}
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                aria-label="Close video"
              >
                <X size={20} />
              </button>
              <video
                ref={videoRef}
                src={VIDEO_URL}
                className="w-full h-full"
                controls
                playsInline
                preload="none"
                title="DigitizeMe product video"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HeroVideoModal;
