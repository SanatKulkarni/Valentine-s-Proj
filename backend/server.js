const express = require('express');
const cors = require('cors');
const { generatePoem } = require('./poemGen');
const { generateSubject } = require('./subjectGen');
const { generateLetter } = require('./letterGen');
require("dotenv").config();

const app = express();
const port = 3000;

app.use(cors());

app.get('/poem', async (req, res) => {
    const language = req.query.language || 'telugu'; // Default to Telugu
    const script = req.query.script || 'native'; // Default to native
    const relationshipType = req.query.relationshipType || 'general'; // Default to general
    const gender = req.query.gender || 'general'; // Default to general
    const senderName = req.query.senderName || 'sender'; // Default to sender
    const receiverName = req.query.receiverName || 'receiver'; // Default to receiver

    try {
        // const poem = await generatePoem(language, script, relationshipType, gender, senderName, receiverName);
        // const subject = await generateSubject();
        // res.json({ poem, subject });
        const letter = await generateLetter(language, script, relationshipType, gender, senderName, receiverName);
        res.json({ letter });
    } catch (error) {
        console.error("Error generating poem:", error);
        res.status(500).json({ error: "Failed to generate poem" });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});