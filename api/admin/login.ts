import type { VercelRequest, VercelResponse } from '@vercel/node';

const ADMIN_TOKEN = "yonas-gold-premium-token-2026";
const getAdminPassword = () => process.env.ADMIN_PASSWORD || "yonas123";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required." });
    }

    const expectedPassword = getAdminPassword();
    if (password === expectedPassword) {
      return res.json({ success: true, token: ADMIN_TOKEN });
    } else {
      return res.status(401).json({ error: "Invalid admin password. Please try again." });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
