import React, { useState } from "react";
import YonasLogo from "./YonasLogo";
import { Send } from "lucide-react";

interface RatingScreenProps {
  onSubmit: (rating: number, emoji: string, category: string, text: string) => void;
  isSubmitting: boolean;
  onOpenAdmin: () => void;
}

const EMOJI_OPTIONS = [
  { rating: 1, emoji: "😢", label: "Unhappy", color: "#EF4444" },
  { rating: 2, emoji: "😊", label: "Happy", color: "#10B981" }
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
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 flex flex-col py-3 px-2 sm:px-4 relative overflow-hidden" id="yonas-Feedback-page">
      {/* Background glow filters */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#D4AF37]/2 rounded-full filter blur-[100px] pointer-events-none" />

      {/* HEADER BAR */}
      <header className="w-full flex justify-between items-center z-10 py-2 border-b border-[#D4AF37]/10 mb-3" id="Feedback-header">
        <YonasLogo size="sm" />
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAdmin}
            className="p-1.5 text-gray-400 text-[#D4AF37] bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Admin"
            id="admin-portal-trigger"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/><path d="m9 12 2 2 4-4"/></svg>
          </button>
        </div>
      </header>

      {/* CORE FORM SECTION */}
      <main className="w-full mx-auto flex flex-col items-center justify-center py-4 z-10 select-none" id="Feedback-main">
        <div className="w-full text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-serif text-[#D4AF37] font-bold" id="main-greeting">
            Rate Your Experience
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Tap your feedback
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center px-4" id="rating-form">
          {/* ERROR STATUS */}
          {errorMessage && (
            <div className="text-red-400 font-medium text-xs text-center mb-3 bg-red-950/20 border border-red-500/20 py-2 px-3 rounded-lg w-full max-w-7xl">
              {errorMessage}
            </div>
          )}

          {/* UNIFIED FEEDBACK CARD - LANDSCAPE TABLET OPTIMIZED */}
          <div className="w-full max-w-7xl bg-[#111] border border-[#D4AF37]/30 rounded-2xl p-8 shadow-2xl">
            
            {/* EMOJI SELECT CONTAINER */}
            <div className="mb-6">
              <h3 className="text-lg uppercase tracking-wider text-gray-300 font-serif mb-6 text-center">
                How was your experience?
              </h3>
              <div className="w-full flex flex-row justify-center gap-80" id="emoji-row">
                {EMOJI_OPTIONS.map((opt) => {
                  const isSelected = selectedRating === opt.rating;
                  return (
                    <button
                      key={opt.rating}
                      type="button"
                      onClick={() => handleSelectRating(opt.rating)}
                      style={isSelected ? {
                        borderColor: opt.color,
                        boxShadow: `0 0 30px ${opt.color}99, inset 0 0 20px ${opt.color}40`,
                        transform: "scale(1.1)"
                      } : {}}
                      className={`relative flex flex-col items-center justify-center py-10 px-16 rounded-3xl border-2 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-black"
                          : "bg-black/50 border-white/10"
                      }`}
                      id={`emoji-btn-${opt.rating}`}
                    >
                      {/* Large emoji */}
                      <span className="text-9xl mb-3 block">
                        {opt.emoji}
                      </span>
                      <span className={`text-sm uppercase tracking-tight font-bold ${
                        isSelected ? "font-bold" : "text-gray-400"
                      }`}
                      style={isSelected ? { color: opt.color } : {}}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DIVIDER */}
            <div className="border-t border-white/5 my-3"></div>

            {/* COMPACT FEEDBACK & SUBMIT TOGETHER */}
            <div className={`transition-opacity duration-200 ${selectedRating !== null ? "opacity-100" : "opacity-40"}`}>
              <textarea
                value={writtenFeedback}
                disabled={selectedRating === null}
                onChange={(e) => setWrittenFeedback(e.target.value)}
                placeholder={selectedRating ? "Add comments... (Optional)" : "Select rating first"}
                className="w-full bg-black border border-gray-800 rounded-lg p-4 text-sm focus:border-[#D4AF37] outline-none h-28 placeholder-gray-600 font-sans text-white focus:ring-1 focus:ring-[#D4AF37]/20 transition-all resize-none disabled:opacity-40 mb-3"
                maxLength={200}
              />
              
              <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
                <span className="font-mono">{writtenFeedback.length}/200</span>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={selectedRating === null || isSubmitting}
                className={`w-full py-4 px-8 rounded-lg font-sans font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                  selectedRating !== null && !isSubmitting
                    ? "bg-[#D4AF37] text-black hover:bg-[#C5A028] shadow-[0_0_25px_rgba(212,175,55,0.4)]"
                    : "bg-gray-950 text-gray-600 border border-white/5 opacity-40 cursor-not-allowed"
                }`}
                id="submit-feedback-btn"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* FOOTER BAR */}
      {/* <footer className="w-full text-center border-t border-white/5 pt-2 text-gray-600 text-[10px] z-10 mt-3" id="Feedback-footer">
        <p className="flex items-center justify-center gap-1 font-mono">
          <span>Tablet Mode</span>
          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
        </p>
      </footer> */}
    </div>
  );
}
