 const express = require("express");
const fileUpload = require("express-fileupload");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow all origins for testing
app.use(express.json());
app.use(fileUpload());
app.use(express.static("public"));

// PDF Upload & Analyze Route
app.post("/upload", async (req, res) => {
    try {
        // 1️⃣ Check if file is uploaded
        if (!req.files || !req.files.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // 2️⃣ Extract text from PDF
        const data = new Uint8Array(req.files.file.data);
        const pdf = await pdfjsLib.getDocument({ data }).promise;

        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(" ") + "\n\n";
        }

        // 3️⃣ Check GEMINI_KEY
        if (!process.env.GEMINI_KEY) {
            return res.status(500).json({ success: false, message: "GEMINI_KEY not set in environment" });
        }

        // 4️⃣ Initialize Google Gemini AI
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        const prompt = `
You are an AI resume expert.
Analyze the resume text below and return JSON with:
1. Resume Score (out of 100)
2. ATS Score
3. Match Percentage
4. Missing Skills (array)
5. Suggestions (array)
6. Improved Resume Text

Resume:
${text}
        `;

        // 5️⃣ Call Gemini API
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ text: prompt }]
        });

        const aiText = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No AI response";

        // 6️⃣ Send JSON response to client
        res.json({ success: true, extractedText: text, aiAnalysis: aiText });

    } catch (err) {
        console.error("Error processing PDF or AI:", err);
        res.status(500).json({ success: false, message: "Error processing PDF or AI", details: err.message });
    }
});

// Start Server
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));