import { GoogleGenerativeAI } from "@google/generative-ai";

async function testFinal() {
    const key = "AIzaSyC8pzExGQqhg39kNqrXKn0J6rPVzpuuPIY";
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    try {
        const result = await model.generateContent("Hi");
        console.log("FINAL TEST SUCCESS!", result.response.text());
    } catch (e: any) {
        console.error("FINAL TEST FAILED:", e.message);
    }
}

testFinal();
