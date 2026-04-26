import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

admin.initializeApp();
const db = admin.firestore();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Triggers when a new resource is posted by an NGO.
 * Uses AI to find the best matching coordinator and creates a broadcast notice.
 */
export const onResourceCreated = functions.firestore
  .document("resources/{resourceId}")
  .onCreate(async (snap, context) => {
    const resource = snap.data();
    const resourceId = context.params.resourceId;

    try {
      // 1. Get all active coordinators in the region
      const coordSnap = await db.collection("users")
        .where("role", "==", "coordinator")
        .where("status", "==", "online")
        .get();

      const coordinators = coordSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        skills: doc.data().skills || [],
        location: doc.data().location
      }));

      // 2. Use Gemini to find the best match
      const prompt = `
        Given a resource: "${resource.title}" (${resource.description}) 
        Type: ${resource.type}
        NGO: ${resource.ngoName}
        
        And these available coordinators:
        ${JSON.stringify(coordinators)}
        
        Who is the best match based on skills and proximity? 
        Return ONLY a JSON array of coordinator IDs, sorted by match score.
        Format: ["id1", "id2", ...]
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract IDs (simple parsing)
      const matches = JSON.parse(text.match(/\[.*\]/)?.[0] || "[]");

      // 3. Update resource with AI matches
      await db.collection("resources").doc(resourceId).update({
        aiMatches: matches,
        aiMatchTimestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // 4. Send notifications to top matches (Logic for Firebase Cloud Messaging would go here)
      console.log(`Resource ${resourceId} matched with ${matches.length} coordinators.`);

    } catch (err) {
      console.error("AI Matching Error:", err);
    }
  });

/**
 * Audit log cleanup - keep only last 30 days
 */
export const cleanupAuditLogs = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const snap = await db.collection("auditLogs")
      .where("timestamp", "<", thirtyDaysAgo)
      .get();

    const batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    console.log(`Cleaned up ${snap.size} old audit logs.`);
  });
