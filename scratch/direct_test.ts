import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGemini() {
    const key = "AIzaSyDvie0iwN_DLekgkLcJb4wu7i96wW4SiKQ";
    console.log("Testing Key...");
    
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello");
        console.log("SUCCESS! Response:", result.response.text());
    } catch (e: any) {
        console.error("FAILURE! Error Code:", e.status || "Unknown");
        console.error("Error Message:", e.message);
    }
}

testGemini();
