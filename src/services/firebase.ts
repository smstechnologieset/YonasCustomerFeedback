/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Firebase Realtime Database Service
 */

const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Initialize Firebase Admin SDK
function initializeFirebase() {
  // Check if already initialized
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Get credentials from environment
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  console.log("[Firebase] Checking credentials...");
  console.log("[Firebase] FIREBASE_SERVICE_ACCOUNT_KEY:", serviceAccountKey ? "✓ Set" : "✗ Missing");
  console.log("[Firebase] FIREBASE_DATABASE_URL:", databaseURL || "✗ Missing");

  if (!serviceAccountKey || !databaseURL) {
    throw new Error(
      "Firebase credentials not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY and FIREBASE_DATABASE_URL environment variables."
    );
  }

  let serviceAccount: any;
  try {
    // Handle both inline JSON and multiline JSON
    // Remove newlines and extra whitespace, then parse
    const cleanedKey = serviceAccountKey
      .replace(/\n/g, "\\n")
      .replace(/\s+/g, " ")
      .trim();
    
    serviceAccount = JSON.parse(cleanedKey);
  } catch (error) {
    try {
      // If that fails, try parsing as-is
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

  console.log("✓ Firebase initialized successfully");
  return admin.app();
}

// Initialize on module load
initializeFirebase();

const db = admin.database();

/**
 * Read all feedback records from Firestore
 */
export async function readFeedback(): Promise<FeedbackRecord[]> {
  try {
    console.log("[Firebase] Reading feedback from database...");
    const snapshot = await db.ref("feedback").get();
    
    if (!snapshot.exists()) {
      console.log("[Firebase] No feedback data found in database");
      return [];
    }

    const data = snapshot.val();
    console.log("[Firebase] Retrieved data:", Object.keys(data || {}).length, "records");
    
    // Convert object to array and sort by timestamp descending
    const records: FeedbackRecord[] = Object.values(data).map((record: any) => ({
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
    console.error("[Firebase] Error reading feedback:", error instanceof Error ? error.message : error);
    return [];
  }
}

/**
 * Write a new feedback record to Firebase
 */
export async function writeFeedback(
  newRecord: FeedbackRecord
): Promise<boolean> {
  try {
    console.log(`[Firebase] Writing feedback record: ${newRecord.id}`, {
      rating: newRecord.rating,
      category: newRecord.category,
      hasText: newRecord.textFeedback?.length > 0
    });
    
    // Use the record ID as the key for direct access
    await db.ref(`feedback/${newRecord.id}`).set(newRecord);
    console.log(`✓ [Firebase] Feedback record saved successfully: ${newRecord.id}`);
    return true;
  } catch (error) {
    console.error(`✗ [Firebase] Error writing feedback (${newRecord.id}):`, error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Delete a feedback record from Firebase
 */
export async function deleteFeedback(recordId: string): Promise<boolean> {
  try {
    await db.ref(`feedback/${recordId}`).remove();
    console.log(`✓ Feedback record deleted: ${recordId}`);
    return true;
  } catch (error) {
    console.error("Error deleting feedback from Firebase:", error);
    return false;
  }
}

/**
 * Add multiple feedback records (for seeding)
 */
export async function seedFeedback(records: FeedbackRecord[]): Promise<boolean> {
  try {
    const updates: { [key: string]: FeedbackRecord } = {};
    records.forEach((record) => {
      updates[`feedback/${record.id}`] = record;
    });

    await db.ref().update(updates);
    console.log(`✓ Seeded ${records.length} feedback records`);
    return true;
  } catch (error) {
    console.error("Error seeding feedback to Firebase:", error);
    return false;
  }
}

export default {
  readFeedback,
  writeFeedback,
  deleteFeedback,
  seedFeedback,
};
