import type { VercelRequest, VercelResponse } from '@vercel/node';
import firebaseService from '../../src/services/firebase.js';
import type { FeedbackRecord } from '../../src/types.js';

const ADMIN_TOKEN = "yonas-gold-premium-token-2026";

function authenticateAdmin(req: VercelRequest): boolean {
  const authHeader = req.headers.authorization;
  const token = req.query.token;
  return authHeader === `Bearer ${ADMIN_TOKEN}` || token === ADMIN_TOKEN;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!authenticateAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized access. Invalid admin session." });
  }

  if (req.method === 'POST') {
    const mockRatings = [
      { rating: 5, emoji: "🤩", category: "Excellent", textFeedback: "Yonas Mobile is the absolute best phone repair shop in town! Fixed my cracked iPhone screen in under 20 minutes, and the price was very fair. Super professional staff!" },
      { rating: 5, emoji: "🤩", category: "Excellent", textFeedback: "Got a premium gold case and a tempered glass screen protector. Extremely elegant look!" },
      { rating: 4, emoji: "😊", category: "Good", textFeedback: "Helpful service, they diagnosed my battery issue quickly. Will come back." },
      { rating: 3, emoji: "😐", category: "Neutral", textFeedback: "A bit of a queue wait, but the overall diagnostics was accurate. Decent experience." },
      { rating: 2, emoji: "😕", category: "Fair", textFeedback: "Called in for a repair estimate and took long to answer, though the repair itself was solid." },
      { rating: 5, emoji: "🤩", category: "Excellent", textFeedback: "Yonas himself was incredibly polite and helpful. Excellent customer service, very honest!" },
      { rating: 4, emoji: "😊", category: "Good", textFeedback: "Clean shop, nice staff. Keep it up!" },
      { rating: 1, emoji: "😢", category: "Poor", textFeedback: "Repair took slightly longer than promised, but they did discount the price for the delay." },
      { rating: 5, emoji: "🤩", category: "Excellent", textFeedback: "Perfect experience. Quick tablet triage, and they gave me a free charging cable." }
    ];

    try {
      const now = Date.now();

      const seeded: FeedbackRecord[] = mockRatings.map((mock, index) => {
        const timestamp = now - (index * 4 * 3600 * 1000) - (Math.random() * 3600 * 1000);
        return {
          id: "fb_seed_" + timestamp + "_" + index,
          rating: mock.rating,
          emoji: mock.emoji,
          category: mock.category,
          textFeedback: mock.textFeedback,
          createdAt: new Date(timestamp).toISOString(),
          timestamp
        };
      });

      const success = await firebaseService.seedFeedback(seeded);

      if (success) {
        return res.json({ success: true, count: seeded.length, data: seeded });
      } else {
        return res.status(500).json({ error: "Failed to seed mock data." });
      }
    } catch (error) {
      console.error("Error seeding mock data:", error);
      return res.status(500).json({ error: "Failed to seed mock data." });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
