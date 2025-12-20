const express = require("express");
const { analyzeResume, getResumeHistory } = require("../controller/resume");
const authrization = require("../middleware/authentication");

const router = express.Router();
                                                                                                        
// Analyze Resume (POST)
router.post("/resume/analyze", authrization, analyzeResume);

// Get Resume History (GET)
router.get("/resume", authrization, getResumeHistory);

module.exports = router;
