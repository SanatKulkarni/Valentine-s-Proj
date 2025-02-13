const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI('AIzaSyAzJno6phNweWn4MMU4j6LUgcqDfTW_cDk');

async function generatePoem(language = 'telugu', script = 'native', relationshipType = 'general', gender = 'general', senderName = 'sender', receiverName = 'receiver') {
    let prompt = "";

    let relationshipContext = "";
    switch (relationshipType) {
        case "first_time":
            relationshipContext = "for someone experiencing first time love";
            break;
        case "long_term":
            relationshipContext = "for someone in a long-term relationship";
            break;
        case "in_relationship":
            relationshipContext = "for someone who is in a relationship";
            break;
        default:
            relationshipContext = "for a general romantic relationship";
            console.log("Invalid relationship type. Defaulting to general romantic relationship.");
            break;
    }
let genderContext = "";
switch (gender) {
    case "male":
        genderContext = "written by a male";
        break;
    case "female":
        genderContext = "written by a female";
        break;
    default:
        genderContext = "";
        console.log("Invalid gender. Not specifying gender.");
}

switch (language) {
    case "hindi":
        if (script === 'native') {
            prompt = `Write a romantic Valentine's Day love poem in Hindi, using the Devanagari script ${relationshipContext} ${genderContext}, from ${senderName} to ${receiverName}. Provide only the poem without any additional text or explanations.`;
        } else {
            prompt = `Write a romantic Valentine's Day love poem in Hindi, transliterated into English ${relationshipContext} ${genderContext}, from ${senderName} to ${receiverName}. Provide only the poem without any additional text or explanations.`;
        }
        break;
    case "english":
        prompt = `Write a romantic Valentine's Day love poem ${relationshipContext} ${genderContext}, from ${senderName} to ${receiverName}. Provide only the poem without any additional text or explanations.`;
        break;
    case "telugu":
        if (script === 'native') {
            prompt = `Write a romantic Valentine's Day love poem in Telugu, using the Telugu script ${relationshipContext} ${genderContext}, from ${senderName} to ${receiverName}. Provide only the poem without any additional text or explanations.`;
        } else {
            prompt = `Write a romantic Valentine's Day love poem in Telugu, transliterated into English ${relationshipContext} ${genderContext}, from ${senderName} to ${receiverName}. Provide only the poem without any additional text or explanations.`;
        }
        break;
    default:
        if (script === 'native') {
            prompt = `Write a romantic Valentine's Day love poem in Telugu, using the Telugu script ${relationshipContext} ${genderContext}, from ${senderName} to ${receiverName}. Provide only the poem without any additional text or explanations.`;
        } else {
            prompt = `Write a romantic Valentine's Day love poem in Telugu, transliterated into English ${relationshipContext} ${genderContext}, from ${senderName} to ${receiverName}. Provide only the poem without any additional text or explanations.`;
        }
        console.log("Invalid language. Defaulting to Telugu.");
}

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const poem = response.text();
        return poem;
    } catch (error) {
        console.error("Error generating poem:", error);
        throw new Error("Failed to generate poem");
    }
}

module.exports = { generatePoem };
