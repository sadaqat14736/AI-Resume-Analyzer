 // const Resume = require("../db/resumeSchema");
// const axios = require("axios");
// require("dotenv").config();

// // Function to call Gemini AI and get structured JSON
// const analyzeWithAI = async (resumeText) => {
//   const prompt = `
// Analyze this resume and return a JSON object with these keys:
// {
//   "aiScore": 0-100,
//   "atsScore": 0-100,
//   "suggestions": ["list of suggestions"],
//   "correctedText": "improved resume text here"
// }

// Resume:
// ${resumeText}
// `;

//   try {
//     const response = await axios.post(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       { contents: [{ parts: [{ text: prompt }] }] }
//     );

//     // Extract the text returned by Gemini
//     const aiText =
//       response.data?.candidates?.[0]?.content?.[0]?.text || "{}";

//     // Parse JSON safely
//     let aiResult;
//     try {
//       aiResult = JSON.parse(aiText);
//     } catch (e) {
//       console.error("Error parsing AI JSON:", e.message);
//       aiResult = {
//         aiScore: 0,
//         atsScore: 0,
//         suggestions: [],
//         correctedText: "AI analysis could not generate text."
//       };
//     }

//     return aiResult; // { aiScore, atsScore, suggestions, correctedText }
//   } catch (err) {
//     console.error("Gemini API error:", err.response?.data || err.message);
//     throw new Error("AI analysis failed");
//   }
// };

// // POST /api/resume/analyze
// const analyzeResume = async (req, res) => {
//   try {
//     const { originalText } = req.body;
//     const userId = req.user.id;

//     if (!originalText) {
//       return res.status(400).json({
//         status: 400,
//         message: "Resume text is required"
//       });
//     }

//     const aiResult = await analyzeWithAI(originalText);

//     // Prepare resume data to save
//     const resumeData = {
//       userId,
//       originalText,
//       aiImprovedText: aiResult.correctedText || "AI analysis could not generate text.",
//       aiScore: aiResult.aiScore || 0,
//       atsScore: aiResult.atsScore || 0,
//       suggestions: aiResult.suggestions || []
//     };

//     const resume = new Resume(resumeData);
//     await resume.save();

//     res.status(200).json({
//       status: 200,
//       message: "Resume analyzed and saved successfully",
//       data: resume
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 500,
//       message: err.message
//     });
//   }
// };

// // GET /api/resume
// const getResumeHistory = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });

//     res.status(200).json({
//       status: 200,
//       data: resumes
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 500,
//       message: err.message
//     });
//   }
// };

// module.exports = { analyzeResume, getResumeHistory };











const Resume = require("../db/resumeSchema");
const axios = require("axios");
require("dotenv").config();

// ===============================
// Function to call Gemini AI
// ===============================
// const analyzeWithAI = async (resumeText) => {
//   const prompt = `
// Analyze this resume and return a JSON object with these keys:
// {
//   "aiScore": 0-100,
//   "atsScore": 0-100,
//   "suggestions": ["list of suggestions"],
//   "correctedText": "improved resume text here"
// }

// Resume:
// ${resumeText}
// `;

//   try {
//     const response = await axios.post(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       { contents: [{ parts: [{ text: prompt }] }] }
//     );

//     // Extract the text returned by Gemini
//     const aiText =
//       response.data?.candidates?.[0]?.content?.[0]?.text || "{}";

//     // Safely parse JSON returned by Gemini
//     let aiResult;
//     try {
//       aiResult = JSON.parse(aiText);
//     } catch (e) {
//       console.error("Error parsing AI JSON:", e.message);
//       aiResult = {
//         aiScore: 0,
//         atsScore: 0,
//         suggestions: [],
//         correctedText: "AI analysis could not generate text."
//       };
//     }

//     return aiResult; // { aiScore, atsScore, suggestions, correctedText }
//   } catch (err) {
//     console.error("Gemini API error:", err.response?.data || err.message);
//     throw new Error("AI analysis failed");
//   }
// };
const analyzeWithAI = async (resumeText, jobDescription) => {
  const prompt = `
You are an ATS resume analyzer.

Analyze the resume according to this job description and return ONLY valid JSON.
Do not add explanation or markdown.

Required JSON format:
{
  "aiScore": number,
  "atsScore": number,
  "suggestions": ["string"],
  "correctedText": "string"
}

Job Description:
${jobDescription}

Resume:
${resumeText}
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );

    let aiText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      throw new Error("Empty AI response");
    }

    // 🔥 CLEAN JSON
    aiText = aiText.replace(/```json|```/g, "").trim();

    const aiResult = JSON.parse(aiText);

    return {
      aiScore: aiResult.aiScore || 0,
      atsScore: aiResult.atsScore || 0,
      suggestions: aiResult.suggestions || [],
      correctedText:
        aiResult.correctedText || "AI could not improve resume"
    };
  } catch (err) {
    console.error("Gemini Error:", err.response?.status, err.message);

    // 🔐 SAFE FALLBACK
    return {
      aiScore: 0,
      atsScore: 0,
      suggestions: ["AI service busy, try again later"],
      correctedText: "AI analysis temporarily unavailable"
    };
  }
};


// ===============================
// POST /api/resume/analyze
// ===============================
// const analyzeResume = async (req, res) => {
//   try {
//     const { originalText } = req.body;
//     const userId = req.user.id;

//     if (!originalText) {
//       return res.status(400).json({
//         status: 400,
//         message: "Resume text is required"
//       });
//     }

//     // ===== Real AI call =====
//     const aiResult = await analyzeWithAI(originalText);

//     // Prepare resume data to save
//     const resumeData = {
//       userId,
//       originalText,
//       aiImprovedText: aiResult.correctedText || "AI analysis could not generate text.",
//       aiScore: aiResult.aiScore || 0,
//       atsScore: aiResult.atsScore || 0,
//       suggestions: aiResult.suggestions || []
//     };

//     const resume = new Resume(resumeData);
//     await resume.save();

//     res.status(200).json({
//       status: 200,
//       message: "Resume analyzed and saved successfully",
//       data: resume
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: 500,
//       message: err.message
//     });
//   }
// };

const analyzeResume = async (req, res) => {
  try {
    const { originalText, jobDescription } = req.body;
    const userId = req.user.id;

    if (!originalText || !jobDescription) {
      return res.status(400).json({
        status: 400,
        message: "Resume text and job description are required"
      });
    }

    const aiResult = await analyzeWithAI(
      originalText,
      jobDescription
    );

    const resumeData = {
      userId,
      originalText,
      jobDescription,
      aiImprovedText: aiResult.correctedText,
      aiScore: aiResult.aiScore,
      atsScore: aiResult.atsScore,
      suggestions: aiResult.suggestions
    };

    const resume = new Resume(resumeData);
    await resume.save();

    res.status(200).json({
      status: 200,
      message: "Resume analyzed and saved successfully",
      data: resume
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message
    });
  }
};



// ===============================
// GET /api/resume
// ===============================
const getResumeHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 200,
      data: resumes
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message
    });
  }
};

module.exports = { analyzeResume, getResumeHistory };
