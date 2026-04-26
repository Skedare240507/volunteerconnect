import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { resourceId, title, description, category, location } = await req.json();

    // 1. Fetch available coordinators
    const q = query(collection(db, "coordinators"), where("availability", "==", "online"));
    const snapshot = await getDocs(q);
    const coordinators = snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));

    if (coordinators.length === 0) {
      return NextResponse.json({ message: "No coordinators available" }, { status: 200 });
    }

    // 2. Use Gemini to find the best match
    const prompt = `
      You are an AI coordinator for VolunteerConnect. 
      Analyze the following resource request and match it to the most suitable coordinator.

      RESOURCE:
      Title: ${title}
      Type: ${category}
      Description: ${description}
      Location: ${location}

      AVAILABLE COORDINATORS:
      ${JSON.stringify(coordinators)}

      CRITERIA:
      1. Matching skills (e.g. Medical, Logistics).
      2. Geographic proximity (Zone match).

      Return ONLY a JSON object in this format:
      {
        "coordinatorId": "The 'id' field of the chosen coordinator",
        "reason": "Short explanation of why they were chosen"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // Clean JSON from potential markdown blocks
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const response = JSON.parse(cleanJson);

    // 3. Create the task in Firestore
    const taskData = {
      resourceId,
      coordinatorId: response.coordinatorId,
      title: title,
      location: location,
      status: "assigned",
      aiReason: response.reason,
      createdAt: serverTimestamp(),
    };

    const taskRef = await addDoc(collection(db, "tasks"), taskData);

    // 4. Update resource status to Matched
    await updateDoc(doc(db, "resources", resourceId), {
      status: "Matched",
      matchedTaskId: taskRef.id
    });

    // Log Activity
    const { logActivity } = await import("@/lib/activity");
    await logActivity({
      user: "System AI",
      action: "Matched coordinator",
      target: title,
      type: "success"
    });

    return NextResponse.json({ 
      success: true, 
      coordinatorId: response.coordinatorId,
      reason: response.reason 
    });
  } catch (error) {
    console.error("Matching error:", error);
    return NextResponse.json({ error: "Failed to match" }, { status: 500 });
  }
}
