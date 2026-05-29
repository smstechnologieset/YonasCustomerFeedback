require("dotenv/config");
const express = require("express");
const path = require("path");
const { createServer: createViteServer } = require("vite");
const firebaseService = require("./src/services/firebase.js").default;

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Simple Admin Authentication Middleware
const ADMIN_TOKEN = "yonas-gold-premium-token-2026";
const getAdminPassword = () => process.env.ADMIN_PASSWORD || "yonas123";

function authenticateAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${ADMIN_TOKEN}` || req.query.token === ADMIN_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized access. Invalid admin session." });
  }
}

// --- API ROUTES ---

// Submit rating/feedback
app.post("/api/feedback", async (req, res) => {
  const { rating, emoji, category, textFeedback } = req.body;

  if (!rating || !emoji || !category) {
    return res.status(400).json({ error: "Missing required fields: rating, emoji, and category are required." });
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
      res.status(201).json({ success: true, data: newFeedback });
    } else {
      res.status(500).json({ error: "Failed to save feedback on server." });
    }
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ error: "Failed to save feedback on server." });
  }
});

// Admin login
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required." });
  }

  const expectedPassword = getAdminPassword();
  if (password === expectedPassword) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: "Invalid admin password. Please try again." });
  }
});

// Get all ratings (secure)
app.get("/api/feedback", authenticateAdmin, async (req, res) => {
  try {
    const records = await firebaseService.readFeedback();
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    res.status(500).json({ error: "Failed to retrieve feedback." });
  }
});

// Delete feedback record (secure)
app.delete("/api/feedback/:id", authenticateAdmin, async (req, res) => {
  try {
    const idToRemove = req.params.id;
    const records = await firebaseService.readFeedback();
    
    const exists = records.some((fb) => fb.id === idToRemove);
    if (!exists) {
      return res.status(404).json({ error: "Feedback record not found." });
    }

    const success = await firebaseService.deleteFeedback(idToRemove);

    if (success) {
      res.json({ success: true, message: "Feedback record deleted successfully." });
    } else {
      res.status(500).json({ error: "Failed to update storage after deletion." });
    }
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ error: "Failed to delete feedback record." });
  }
});

// Seed mock data for preview/demonstration if empty
app.post("/api/feedback/seed", authenticateAdmin, async (req, res) => {
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
      // Stagger dates backward in time
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
      res.json({ success: true, count: seeded.length, data: seeded });
    } else {
      res.status(500).json({ error: "Failed to seed mock data." });
    }
  } catch (error) {
    console.error("Error seeding mock data:", error);
    res.status(500).json({ error: "Failed to seed mock data." });
  }
});

// --- VITE MIDDLEWARE SETUP ---
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Yonas Mobile feedback server running on http://0.0.0.0:${PORT}`);
  });
}

start();
