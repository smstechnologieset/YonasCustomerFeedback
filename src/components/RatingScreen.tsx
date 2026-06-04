import React, { useState } from "react";
import YonasLogo from "./YonasLogo";

interface RatingScreenProps {
  onSubmit: (rating: number, emoji: string, category: string, text: string) => void;
  isSubmitting: boolean;
  onOpenAdmin: () => void;
}

import sadImg from "/sad.png";
import happyImg from "/happy.png";

const EMOJI_OPTIONS = [
  { rating: 1, emoji: "sad.png", image: sadImg, label: "Unhappy", color: "#EF4444" },
  { rating: 2, emoji: "happy.png", image: happyImg, label: "Happy", color: "#10B981" }
];



export default function RatingScreen({ onSubmit, isSubmitting, onOpenAdmin }: RatingScreenProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedOption = EMOJI_OPTIONS.find((o) => o.rating === selectedRating);

  const handleSelectRating = (rating: number) => {
    setSelectedRating(rating);
    setShowConfirmation(true);
    setErrorMessage("");
  };

  const handleConfirmSubmit = () => {
    if (!selectedRating || !selectedOption) {
      setErrorMessage("Please select an emoji rating.");
      return;
    }

    // Submit with empty text feedback
    onSubmit(
      selectedOption.rating,
      selectedOption.emoji,
      selectedOption.label,
      ""
    );

    // Reset
    setSelectedRating(null);
    setShowConfirmation(false);
    setErrorMessage("");
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedRating(null);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 flex flex-col py-3 px-2 sm:px-4 relative overflow-hidden" id="yonas-Feedback-page">
      {/* Background glow filters */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#D4AF37]/2 rounded-full filter blur-[100px] pointer-events-none" />

      {/* HEADER BAR */}
      <header className="w-full flex justify-between items-center z-10 py-2 border-b border-[#D4AF37]/10" id="Feedback-header">
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
      <main className="w-full mx-auto flex flex-col items-center justify-center pt-1 pb-4 z-10 select-none" id="Feedback-main">
        {/* EMOJI SELECTION ONLY - NO FORM */}
        <div className="w-full flex flex-col items-center px-4" id="rating-section">
          {/* UNIFIED FEEDBACK CARD - LANDSCAPE TABLET OPTIMIZED */}
          <div className="w-full max-w-7xl bg-[#111] border border-[#D4AF37]/30 rounded-2xl p-4 sm:p-6 shadow-2xl">
            
            {/* EMOJI SELECT CONTAINER */}
            <div className="mb-6">
              <h3 className="text-lg uppercase tracking-wider text-[#D4AF37] font-serif mb-6 text-center font-bold">
                How was your experience?
              </h3>
              <div className="w-full flex flex-row justify-center gap-16 lg:gap-32" id="emoji-row">
                {EMOJI_OPTIONS.map((opt) => {
                  const isSelected = selectedRating === opt.rating;
                  return (
                    <button
                      key={opt.rating}
                      type="button"
                      onClick={() => handleSelectRating(opt.rating)}
                      style={{
                        borderColor: opt.color,
                        boxShadow: `0 0 40px ${opt.color}99, inset 0 0 30px ${opt.color}40`,
                        transform: isSelected ? "scale(1.05)" : "scale(1)"
                      }}
                      className={`relative flex flex-col items-center justify-center w-[500px] h-[500px] rounded-[3rem] border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                        isSelected
                          ? "bg-black"
                          : "bg-black/50 border-white/10"
                      }`}
                      id={`emoji-btn-${opt.rating}`}
                    >
                      {/* Large emoji image */}
                      <img src={opt.image} alt={opt.label} className="w-[380px] h-[380px] object-contain mb-8" />
                      <span className={`text-2xl uppercase tracking-tight font-bold absolute bottom-6 ${
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
          </div>
        </div>
      </main>

      {/* CONFIRMATION POPUP - SUBMIT FEEDBACK */}
      {showConfirmation && selectedOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" id="confirmation-popup-overlay">
          <div className="max-w-md w-full bg-[#111] border-2 border-[#D4AF37] rounded-3xl p-8 shadow-[0_0_50px_rgba(212,175,55,0.25)] text-center">
            {/* Selected emoji display */}
            <div className="mb-6 flex justify-center">
              <img src={selectedOption.image} alt={selectedOption.label} className="w-48 h-48 object-contain" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-serif text-[#D4AF37] mb-2 font-bold">
              Confirm Feedback
            </h2>

            {/* Message */}
            <p className="text-gray-400 text-sm mb-8">
              You selected <span style={{ color: selectedOption.color }} className="font-bold">{selectedOption.label}</span>. Submit this feedback?
            </p>

            {/* Buttons */}
            <div className="flex gap-4 justify-center">
              {/* Cancel Button */}
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-lg font-sans font-bold uppercase tracking-widest text-sm bg-gray-900 text-gray-300 border border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              {/* Submit Button */}
              <button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-lg font-sans font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                  !isSubmitting
                    ? "bg-[#D4AF37] text-black hover:bg-[#C5A028] shadow-[0_0_25px_rgba(212,175,55,0.4)]"
                    : "bg-[#D4AF37]/50 text-black/50 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
