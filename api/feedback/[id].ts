import type { VercelRequest, VercelResponse } from '@vercel/node';
import firebaseService from '../../src/services/firebase.js';

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
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!authenticateAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized access. Invalid admin session." });
  }

  // DELETE /api/feedback/:id - Delete feedback record
  if (req.method === 'DELETE') {
    try {
      const idToRemove = req.query.id as string;
      const records = await firebaseService.readFeedback();
      
      const exists = records.some((fb) => fb.id === idToRemove);
      if (!exists) {
        return res.status(404).json({ error: "Feedback record not found." });
      }

      const success = await firebaseService.deleteFeedback(idToRemove);

      if (success) {
        return res.json({ success: true, message: "Feedback record deleted successfully." });
      } else {
        return res.status(500).json({ error: "Failed to update storage after deletion." });
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      return res.status(500).json({ error: "Failed to delete feedback record." });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
