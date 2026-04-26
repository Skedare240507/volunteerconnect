import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const API_KEY = process.env.GEMINI_API_KEY || "";

/**
 * These model names were verified via diagnostic script in this environment.
 * The environment seems to use experimental/latest aliases.
 */
const MODELS_TO_TRY = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest"
];

const STATIC_KNOWLEDGE: Record<string, string> = {
  "help": "I'm the VolunteerConnect AI. I can help you manage NGO resources, track coordinator tasks, and view crisis heatmaps. What would you like to know?",
  "how it works": "VolunteerConnect streamlines disaster relief by allowing NGOs to broadcast resource needs, which our AI then matches with nearby field coordinators. Coordinators use our mobile-first panel to accept tasks and report status in real-time.",
  "mission": "Our mission is to bridge the coordination gap in disaster response using real-time data and AI-driven matching to save lives and optimize aid distribution.",
  "about": "VolunteerConnect was architected by Sahil Kedare to solve coordination challenges in the NGO sector. We use Next.js, Firebase, and Gemini AI.",
  "resource": "To add a resource, go to your NGO Dashboard, click 'Resources', then 'Broadcast Need'. You can add details like location, quantity, and affected count.",
  "task": "Tasks are assigned to coordinators. You can see them in the 'Coordinators' tab or directly on the 'Heatmap' by clicking a coordinator marker.",
  "map": "The Heatmap shows real-time resource needs (red) and coordinator locations (blue). Click any marker to view details or assign tasks.",
  "id card": "Coordinators can view and download their official ID cards from the 'Profile' section in their coordinator dashboard.",
  "sdg": "VolunteerConnect aligns with UN Sustainable Development Goals: Goal 2 (Zero Hunger), Goal 3 (Good Health), and Goal 11 (Sustainable Cities).",
  "founder": "VolunteerConnect was founded by Sahil Kedare with a mission to streamline disaster response and aid distribution.",
};

function getStaticReply(message: string): string | null {
  const msg = message.toLowerCase();
  for (const [key, value] of Object.entries(STATIC_KNOWLEDGE)) {
    if (msg.includes(key)) return value;
  }
  return "I'm currently operating in optimized mode. I can help with 'How it works', Mission, Resources, Tasks, or ID Cards. How can I assist you today?";
}

async function generateWithFallback(prompt: string) {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is missing from environment");
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  let lastError: any = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
      ]) as any;
      
      const text = result.response.text();
      if (text) return text;
    } catch (err: any) {
      lastError = err;
      const msg = err.message?.toLowerCase() || "";
      if (msg.includes("404") || msg.includes("not found") || msg.includes("400") || msg.includes("timeout")) {
        continue;
      }
      break; 
    }
  }
  throw lastError || new Error("All model fallback attempts failed.");
}

function isRateLimitError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return msg.includes("429") || msg.includes("quota") || msg.includes("rate limit");
}

export async function GET() {
  try {
    const resourcesSnap = await getDocs(query(collection(db, "resources"), orderBy("createdAt", "desc"), limit(10)));
    const resources = resourcesSnap.docs.map(d => d.data());

    const prompt = `System: NGO Manager Briefing. Data: ${JSON.stringify(resources)}. Concise status summary in 2 sentences. JSON: {"briefing": "...", "recommendation": "..."}`;
    const text = await generateWithFallback(prompt);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return NextResponse.json(JSON.parse(jsonMatch ? jsonMatch[0] : text));
  } catch (error: any) {
    return NextResponse.json({ 
      briefing: "System update in progress. Resource density remains stable in active zones.",
      recommendation: "Review the live Heatmap for cluster analysis."
    });
  }
}

export async function POST(req: Request) {
  const { message, context, history } = await req.json();
  try {
    const contextStr = typeof context === 'object' ? JSON.stringify(context) : context;
    const historyStr = history ? history.map((h: any) => `${h.role}: ${h.content}`).slice(-3).join("\n") : "";

    const userRole = context?.userRole || "User";
    const userName = context?.userName || "Unknown";
    
    let systemInstruction = `System: AI Disaster Assistant for VolunteerConnect.
You are an intelligent, helpful, and empathetic assistant tailored for the ${userRole} named ${userName}.
You have comprehensive knowledge about the VolunteerConnect platform, which connects NGOs with local field coordinators for disaster relief. Use the context and history to give precise, role-specific answers.
- If the user is an NGO, focus on resource management, coordinate assignment, and overall status.
- If the user is a Coordinator, focus on their specific tasks, safety, and on-ground reporting.
- Give a natural, conversational response exactly addressing the prompt.
Do not use JSON formatting.`;

    const prompt = `${systemInstruction}
Context data: ${contextStr}
History: ${historyStr}

User says: "${message}"`;

    const text = await generateWithFallback(prompt);
    
    // Clean up potential markdown formatting that Gemini sometimes adds
    const cleanText = text.replace(/^```\s*/, "").replace(/```\s*$/, "").trim();
    
    return NextResponse.json({ reply: cleanText });
  } catch (error: any) {
    console.error("AI Error, triggering static fallback:", error.message);
    const staticReply = getStaticReply(message);
    return NextResponse.json({ reply: staticReply });
  }
}
