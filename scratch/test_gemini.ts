import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testGemini() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API Key found in .env.local!");
        return;
    }

    console.log("Testing with Key:", key.substring(0, 10) + "...");
    const genAI = new GoogleGenerativeAI(key);
    
    // Test multiple model common names
    const models = ["gemini-1.5-flash", "gemini-pro"];
    
    for (const modelName of models) {
        try {
            console.log(`Checking model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`✅ ${modelName} works! Response:`, result.response.text());
            return; // stop if one works
        } catch (e: any) {
            console.error(`❌ ${modelName} failed:`, e.message);
        }
    }
    
    console.log("\nPossible solutions:");
    console.log("1. Ensure 'Generative Language API' is enabled in Google Cloud Console.");
    console.log("2. Check if your API key from AI Studio is correct.");
    console.log("3. Your region might not support these models yet (unlikely).");
}

testGemini();
