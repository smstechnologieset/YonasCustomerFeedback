import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThumbsUp, X, Sparkles, Trophy } from "lucide-react";

interface ThumbsUpPopupProps {
  isOpen: boolean;
  onClose: () => void;
  autoDismissSeconds?: number;
}

export default function ThumbsUpPopup({ isOpen, onClose, autoDismissSeconds = 6 }: ThumbsUpPopupProps) {
  const [timeLeft, setTimeLeft] = useState(autoDismissSeconds);

  useEffect(() => {
    if (!isOpen) return;
    
    setTimeLeft(autoDismissSeconds);
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, autoDismissSeconds, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" id="thanks-popup-overlay">
        {/* Animated Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="relative max-w-lg w-full bg-[#111] border-2 border-[#D4AF37] rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(212,175,55,0.25)] text-center overflow-hidden flex flex-col items-center"
          id="thanks-popup-card"
        >
          {/* Internal Glow Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#D4AF37]/10 rounded-full filter blur-[40px] pointer-events-none" />

          {/* Close button in corner */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>

          {/* Giant Gold Floating Thumbs Up Emblem */}
          <div className="relative mb-6 mt-4 flex items-center justify-center">
            {/* Pulsing ring background */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5"
            />
            {/* Second outer ring */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.1, 0.4, 0.1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
              className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-yellow-500/10"
            />

            {/* Main Circle badge with gold gradients */}
            <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center justify-center">
              <motion.div
                initial={{ rotate: -20, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", delay: 0.1, stiffness: 220 }}
              >
                <ThumbsUp className="w-10 h-10 sm:w-12 sm:h-12 text-black" strokeWidth={2.5} />
              </motion.div>
            </div>

            {/* Sparkles around badge */}
            <Sparkles className="absolute top-0 right-0 w-5 h-5 text-yellow-300 animate-pulse" />
            <Sparkles className="absolute bottom-2 left-0 w-6 h-6 text-[#D4AF37] animate-pulse" />
          </div>

          {/* Header Title */}
          <h2 className="text-3xl font-serif text-[#D4AF37] mb-2 tracking-wide font-bold">
            Thank You!
          </h2>

          {/* Gratitude Statement */}
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-sm mb-6">
            Your feedback has been recorded successfully.<br />Have a wonderful day.
          </p>

          {/* Progress bar countdown */}
          <div className="w-full max-w-xs bg-white/5 h-1 rounded-full mb-8 overflow-hidden">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: autoDismissSeconds, ease: "linear" }}
              className="h-full bg-gradient-to-r from-yellow-300 to-[#D4AF37]"
            />
          </div>

          {/* Large Gold Button for Tablet Navigation */}
          <button
            onClick={onClose}
            className="px-8 py-2.5 border border-[#D4AF37] text-[#D4AF37] rounded-full text-xs uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all font-bold cursor-pointer"
            id="dismiss-thanks-btn"
          >
            Dismiss
          </button>

          {/* Countdown subtext */}
          <p className="mt-4 text-xs font-mono text-gray-500">
            Automatically returning to Feedback in <span className="text-[#D4AF37] font-semibold">{timeLeft}s</span>
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
