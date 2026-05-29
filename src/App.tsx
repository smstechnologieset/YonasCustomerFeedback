/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import RatingScreen from "./components/RatingScreen";
import ThumbsUpPopup from "./components/ThumbsUpPopup";
import AdminPortal from "./components/AdminPortal";
import { FeedbackRecord } from "./types";

export default function App() {
  const [feedbackRecords, setFeedbackRecords] = useState<FeedbackRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Modal controllers
  const [showThanks, setShowThanks] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync data whenever admin opens or performs actions
  const fetchFeedback = async () => {
    const token = localStorage.getItem("yonas_admin_token");
    if (!token) return;

    try {
      const response = await fetch("/api/feedback", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setFeedbackRecords(result.data);
        }
      }
    } catch (err) {
      console.error("Failed to load feedback logs:", err);
    }
  };

  // Fetch feedback records when admin portal opens
  useEffect(() => {
    if (isAdminOpen) {
      fetchFeedback();
    }
  }, [isAdminOpen]);

  // Submit Feedback entry
  const handleSubmitFeedback = async (rating: number, emoji: string, category: string, text: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          emoji,
          category,
          textFeedback: text
        })
      });

      if (response.ok) {
        setShowThanks(true); // Open the gold Thumbs Up Popup!
        // If admin happens to be logged in concurrently, sync
        fetchFeedback();
      } else {
        const err = await response.json();
        alert(`Failed to save feedback: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      alert("Host connection error. Please verify the network is active.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Feedback record (Secure Admin)
  const handleDeleteFeedback = async (id: string) => {
    const token = localStorage.getItem("yonas_admin_token");
    if (!token) return;

    setIsActionLoading(true);
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Instant updates
        setFeedbackRecords(prev => prev.filter(fb => fb.id !== id));
      } else {
        const err = await response.json();
        alert(`Failed to delete record: ${err.error}`);
      }
    } catch (err) {
      alert("Failed to connect to admin directory.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Seed sample analytics lists
  const handleSeedMockData = async () => {
    const token = localStorage.getItem("yonas_admin_token");
    if (!token) return;

    setIsActionLoading(true);
    try {
      const response = await fetch("/api/feedback/seed", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchFeedback(); // Reload lists
      } else {
        alert("Failed to seed database.");
      }
    } catch (err) {
      alert("Failed to connect to database terminal.");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303]" id="yonas-app-root">
      
      {/* 1. Main Customer facing Feedback terminal */}
      <RatingScreen
        onSubmit={handleSubmitFeedback}
        isSubmitting={isSubmitting}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 2. Thumbs Up Pop-up popup confirmations */}
      <ThumbsUpPopup
        isOpen={showThanks}
        onClose={() => setShowThanks(false)}
        autoDismissSeconds={6}
      />

      {/* 3. Secure Admin dashboard gate */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        feedbackRecords={feedbackRecords}
        onDeleteRecord={handleDeleteFeedback}
        onSeedData={handleSeedMockData}
        isActionLoading={isActionLoading}
      />

    </div>
  );
}
