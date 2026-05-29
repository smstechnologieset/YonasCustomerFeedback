/**
 * Firebase service for Vercel serverless functions
 */
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (!serviceAccountKey || !databaseURL) {
    throw new Error(
      "Firebase credentials not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY and FIREBASE_DATABASE_URL environment variables."
    );
  }

  let serviceAccount: any;
  try {
    const cleanedKey = serviceAccountKey
      .replace(/\n/g, "\\n")
      .replace(/\s+/g, " ")
      .trim();
    serviceAccount = JSON.parse(cleanedKey);
  } catch (error) {
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (innerError) {
      throw new Error(
        `Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${innerError instanceof Error ? innerError.message : String(innerError)}`
      );
    }
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL,
  });

  return admin.app();
}

initializeFirebase();
const db = admin.database();

async function readFeedback() {
  try {
    const snapshot = await db.ref("feedback").get();
    
    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();
    const records = Object.values(data).map((record) => ({
      id: record.id,
      rating: record.rating,
      emoji: record.emoji,
      category: record.category,
      textFeedback: record.textFeedback,
      createdAt: record.createdAt,
      timestamp: record.timestamp,
    }));

    return records.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("[Firebase] Error reading feedback:", error);
    return [];
  }
}

async function writeFeedback(newRecord) {
  try {
    await db.ref(`feedback/${newRecord.id}`).set(newRecord);
    return true;
  } catch (error) {
    console.error(`[Firebase] Error writing feedback:`, error);
    return false;
  }
}

async function deleteFeedback(recordId) {
  try {
    await db.ref(`feedback/${recordId}`).remove();
    return true;
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return false;
  }
}

async function seedFeedback(records) {
  try {
    const updates = {};
    records.forEach((record) => {
      updates[`feedback/${record.id}`] = record;
    });

    await db.ref().update(updates);
    return true;
  } catch (error) {
    console.error("Error seeding feedback:", error);
    return false;
  }
}

module.exports = {
  readFeedback,
  writeFeedback,
  deleteFeedback,
  seedFeedback,
};
