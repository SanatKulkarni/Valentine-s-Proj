const { generateSubject } = require('./subjectGen');
const { generatePoem } = require('./poemGen');

async function generateLetter(language = 'telugu', script = 'native', relationshipType = 'general', gender = 'general', senderName = 'sender', receiverName = 'receiver') {
    try {
        const subject = await generateSubject();
        const poem = await generatePoem(language, script, relationshipType, gender, senderName, receiverName);

        const letter = `Subject: ${subject}\n\nDear ${receiverName},\n\n${poem}\n\nYour love,\n${senderName}`;
        return letter;
    } catch (error) {
        console.error("Error generating letter:", error);
        throw new Error("Failed to generate letter");
    }
}

module.exports = { generateLetter };