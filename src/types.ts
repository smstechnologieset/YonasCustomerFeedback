/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FeedbackRecord {
  id: string;
  rating: number; // 1 to 5 star equivalent
  emoji: string;  // e.g. '😢', '😕', '😐', '😊', '🤩'
  category: string; // label of rating e.g., "Excellent", "Good", "Neutral", "Fair", "Poor"
  textFeedback: string;
  createdAt: string; // ISO date string
  timestamp: number;
}

export interface RatingStats {
  totalCount: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  satisfactionRate: number; // Percentage of 4+5 ratings
}
