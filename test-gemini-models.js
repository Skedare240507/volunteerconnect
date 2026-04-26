const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
  const genAI = new GoogleGenerativeAI("AIzaSyC8pzExGQqhg39kNqrXKn0J6rPVzpuuPIY");
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyC8pzExGQqhg39kNqrXKn0J6rPVzpuuPIY");
    const data = await response.json();
    console.log("Models:", data.models.map(m => m.name).join(", "));
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
