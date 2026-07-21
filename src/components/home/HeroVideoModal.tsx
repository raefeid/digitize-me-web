import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import promoVideo from "@/assets/digitizeme-promo-58s.mp4.asset.json";

/**
 * Hero brand video: shows a poster with play button; opens a fullscreen
 * modal with the self-hosted promo video.
 * Video: DigitizeMe brand + walkthrough.
 */
const VIDEO_URL = promoVideo.url;

const HeroVideoModal = () => {
  const { isRTL } = useLanguage();
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        whileHover={{ scale: 1.01 }}
        className="group relative block w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border bg-gradient-to-br from-dm-navy-light via-card to-dm-coral-light aspect-video"
        aria-label={isRTL ? "شغل فيديو المنتج" : "Play product video"}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-2xl"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="absolute inset-0 rounded-full bg-accent/40 animate-ping" />
            <Play size={36} className="relative ml-1" fill="currentColor" />
          </motion.div>
        </div>
        <div className="absolute bottom-0 inset-x-0 p-4 md:p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent text-start">
          <div className="text-white font-semibold text-sm md:text-base">
            {isRTL ? "شاهد كيف يعمل DigitizeMe" : "See how DigitizeMe works"}
          </div>
          <div className="text-white/70 text-xs md:text-sm">
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
                preload="auto"
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
