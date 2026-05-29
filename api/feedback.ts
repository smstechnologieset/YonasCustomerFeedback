const firebaseService = require('./_lib/firebase');

const ADMIN_TOKEN = "yonas-gold-premium-token-2026";

function authenticateAdmin(req: VercelRequest): boolean {
  const authHeader = req.headers.authorization;
  const token = req.query.token;
  return authHeader === `Bearer ${ADMIN_TOKEN}` || token === ADMIN_TOKEN;
}

async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST /api/feedback - Submit new feedback
  if (req.method === 'POST') {
    const { rating, emoji, category, textFeedback } = req.body;

    if (!rating || !emoji || !category) {
      return res.status(400).json({ 
        error: "Missing required fields: rating, emoji, and category are required." 
      });
    }

    try {
      const newFeedback: FeedbackRecord = {
        id: "fb_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        rating: Number(rating),
        emoji: String(emoji),
        category: String(category),
        textFeedback: String(textFeedback || ""),
        createdAt: new Date().toISOString(),
        timestamp: Date.now()
      };

      const success = await firebaseService.writeFeedback(newFeedback);

      if (success) {
        return res.status(201).json({ success: true, data: newFeedback });
      } else {
        return res.status(500).json({ error: "Failed to save feedback on server." });
      }
    } catch (error) {
      console.error("Error saving feedback:", error);
      return res.status(500).json({ error: "Failed to save feedback on server." });
    }
  }

  // GET /api/feedback - Get all feedback (admin only)
  if (req.method === 'GET') {
    if (!authenticateAdmin(req)) {
      return res.status(401).json({ error: "Unauthorized access. Invalid admin session." });
    }

    try {
      const records = await firebaseService.readFeedback();
      return res.json({ success: true, count: records.length, data: records });
    } catch (error) {
      console.error("Error retrieving feedback:", error);
      return res.status(500).json({ error: "Failed to retrieve feedback." });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

module.exports = handler;
