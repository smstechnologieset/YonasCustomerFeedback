import React, { useState } from "react";
import { motion } from "motion/react";
import YonasLogo from "./YonasLogo";
import { Star, MessageSquareCode, Check, Send, Sparkles } from "lucide-react";

interface RatingScreenProps {
  onSubmit: (rating: number, emoji: string, category: string, text: string) => void;
  isSubmitting: boolean;
  onOpenAdmin: () => void;
}

const EMOJI_OPTIONS = [
  { rating: 1, emoji: "😢", label: "Poor", color: "#EF4444", bgClass: "hover:bg-red-950/20 hover:border-red-500/40" },
  { rating: 2, emoji: "😕", label: "Fair", color: "#F97316", bgClass: "hover:bg-orange-950/20 hover:border-orange-500/40" },
  { rating: 3, emoji: "😐", label: "Neutral", color: "#EAB308", bgClass: "hover:bg-yellow-950/20 hover:border-yellow-500/40" },
  { rating: 4, emoji: "😊", label: "Good", color: "#84CC16", bgClass: "hover:bg-lime-950/20 hover:border-lime-500/40" },
  { rating: 5, emoji: "🤩", label: "Excellent", color: "#10B981", bgClass: "hover:bg-emerald-950/20 hover:border-emerald-500/40" }
];



export default function RatingScreen({ onSubmit, isSubmitting, onOpenAdmin }: RatingScreenProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [writtenFeedback, setWrittenFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedOption = EMOJI_OPTIONS.find((o) => o.rating === selectedRating);

  const handleSelectRating = (rating: number) => {
    setSelectedRating(rating);
    setErrorMessage("");
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRating || !selectedOption) {
      setErrorMessage("Please select an emoji rating to share your experience.");
      return;
    }

    onSubmit(
      selectedOption.rating,
      selectedOption.emoji,
      selectedOption.label,
      writtenFeedback
    );

    // Reset states
    setSelectedRating(null);
    setWrittenFeedback("");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 flex flex-col justify-between py-6 px-4 sm:px-6 md:px-8 relative overflow-hidden" id="yonas-Feedback-page">
      {/* Background glow filters */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#D4AF37]/2 rounded-full filter blur-[100px] pointer-events-none" />

      {/* HEADER BAR */}
      <header className="max-w-4xl w-full mx-auto flex justify-between items-center z-10 py-3 border-b border-[#D4AF37]/10" id="Feedback-header">
        <YonasLogo size="md" />
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAdmin}
            className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Open Secure Admin Portal"
            id="admin-portal-trigger"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/><path d="m9 12 2 2 4-4"/></svg>
          </button>
        </div>
      </header>

      {/* CORE FORM SECTION */}
      <main className="max-w-4xl w-full mx-auto my-auto flex flex-col items-center justify-center py-6 sm:py-10 z-10 select-none" id="Feedback-main">
        <div className="w-full text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#D4AF37] mb-2 tracking-wide font-bold" id="main-greeting">
            Rate Your Experience
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto font-sans">
            Your feedback helps us remain premium.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center" id="rating-form">
          {/* ERROR STATUS */}
          {errorMessage && (
            <div className="text-red-400 font-medium text-sm text-center mb-4 bg-red-950/20 border border-red-500/20 py-2.5 px-4 rounded-xl max-w-2xl w-full mx-auto">
              {errorMessage}
            </div>
          )}

          {/* UNIFIED FEEDBACK CARD */}
          <div className="w-full max-w-2xl bg-[#111] border border-[#D4AF37]/30 rounded-3xl p-6 md:p-10 shadow-2xl">
            
            {/* EMOJI SELECT CONTAINER */}
            <div className="mb-8">
              <h3 className="text-sm uppercase tracking-wider text-gray-300 font-serif mb-4 text-center">
                How was your experience?
              </h3>
              <div className="w-full flex flex-row flex-nowrap justify-between gap-2 sm:gap-3 md:gap-4" id="emoji-row">
                {EMOJI_OPTIONS.map((opt) => {
                  const isSelected = selectedRating === opt.rating;
                  return (
                    <button
                      key={opt.rating}
                      type="button"
                      onClick={() => handleSelectRating(opt.rating)}
                      className={`relative flex flex-col items-center justify-center flex-1 py-3 sm:py-5 px-1 sm:px-3 rounded-2xl border transition-all duration-300 transform cursor-pointer ${
                        isSelected
                          ? "bg-black border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-105"
                          : "bg-black/50 border-white/5 text-gray-400 hover:text-white hover:scale-102 hover:border-[#D4AF37]/30"
                      }`}
                      id={`emoji-btn-${opt.rating}`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-[#D4AF37] text-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center p-0.5">
                          <Check size={10} className="sm:w-3 sm:h-3" strokeWidth={3} />
                        </div>
                      )}
                      {/* Large animated emoji */}
                      <span
                        className={`text-2xl sm:text-3xl md:text-4xl mb-2 block transition-transform duration-300 ${
                          isSelected ? "scale-110 rotate-2" : "hover:scale-105"
                        }`}
                      >
                        {opt.emoji}
                      </span>
                      <span
                        className={`text-[8px] sm:text-[9px] uppercase tracking-tighter ${
                          isSelected ? "text-[#D4AF37] font-bold" : "text-gray-400"
                        }`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DIVIDER */}
            <div className="border-t border-white/5 my-6"></div>

            {/* FEEDBACK TEXT AREA */}
            <div className={`transition-opacity duration-300 ${selectedRating !== null ? "opacity-100" : "opacity-50"}`}>
              <div className="flex items-center gap-2 text-white font-medium mb-4">
                <MessageSquareCode size={18} className="text-[#D4AF37]" />
                <h3 className="text-sm uppercase tracking-wider text-gray-300 font-serif">
                  {selectedRating ? `Tell us more about your '${selectedOption?.label}' rating?` : "Additional Comments"}
                </h3>
                <span className="text-xs text-gray-500 ml-auto">(Optional)</span>
              </div>

              <textarea
                value={writtenFeedback}
                disabled={selectedRating === null}
                onChange={(e) => setWrittenFeedback(e.target.value)}
                placeholder={selectedRating ? "Share your thoughts... (Optional)" : "Select a rating first"}
                className="w-full bg-black border border-gray-800 rounded-xl p-4 text-sm focus:border-[#D4AF37] outline-none h-24 placeholder-gray-600 font-sans text-white focus:ring-1 focus:ring-[#D4AF37]/20 transition-all resize-none disabled:opacity-50"
                maxLength={300}
              />
              
              <div className="flex justify-end items-center mt-3 text-[11px] text-gray-500">
                <span className={writtenFeedback.length >= 250 ? "text-[#D4AF37]" : ""}>
                  {writtenFeedback.length}/300 characters
                </span>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={selectedRating === null || isSubmitting}
                className={`w-full py-4 px-6 rounded-xl font-sans font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transform transition-all duration-300 cursor-pointer ${
                  selectedRating !== null && !isSubmitting
                    ? "bg-[#D4AF37] text-black hover:bg-[#C5A028] shadow-[0_0_30px_rgba(212,175,55,0.35)] hover:-translate-y-0.5 active:translate-y-0"
                    : "bg-gray-950 text-gray-600 border border-white/5 opacity-55 cursor-not-allowed"
                }`}
                id="submit-feedback-btn"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving Feedback...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Submit Rating
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* FOOTER BAR */}
      <footer className="max-w-4xl w-full mx-auto text-center border-t border-white/5 pt-4 text-gray-600 text-xs flex flex-col sm:flex-row justify-between items-center gap-2 z-10" id="Feedback-footer">
        <p>© 2026 Yonas Mobile Customer Satisfaction Terminal.</p>
        <p className="flex items-center gap-1 font-mono text-[10px]">
          <span>Optimized for Tablet Device In-Store</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </p>
      </footer>
    </div>
  );
}
