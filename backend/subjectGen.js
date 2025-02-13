const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI('AIzaSyAzJno6phNweWn4MMU4j6LUgcqDfTW_cDk');

async function generateSubject() {
    const prompt = "Write a single romantic subject line text for a Valentine's Day love letter. Provide only the subject line without any additional text or explanations.";

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const subject = response.text();
        return subject;
    } catch (error) {
        console.error("Error generating subject:", error);
        throw new Error("Failed to generate subject");
    }
}

module.exports = { generateSubject };