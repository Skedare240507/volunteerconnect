import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
    const key = "AIzaSyC8pzExGQqhg39kNqrXKn0J6rPVzpuuPIY"; // NEW KEY
    const genAI = new GoogleGenerativeAI(key);
    
    try {
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];
        
        for (const m of models) {
            console.log(`Testing ${m}...`);
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("Hi");
                console.log(`SUCCESS with ${m}:`, result.response.text());
                return; 
            } catch (e: any) {
                console.log(`FAILED ${m}: ${e.message}`);
            }
        }
    } catch (e: any) {
        console.error("List Error:", e.message);
    }
}

listModels();
