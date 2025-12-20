const express = require("express");
const { addJob, getJobs, updateJob, deleteJob } = require("../controller/job");
const  authMiddleware  = require("../middleware/authentication"); 

const router = express.Router();


// Add new job
router.post("/jobs", authMiddleware, addJob);

// Get all jobs of logged-in user
router.get("/jobs", authMiddleware, getJobs);

// Update job by ID
router.put("/jobs/:id", authMiddleware, updateJob);

// Delete job by ID
router.delete("/jobs/:id", authMiddleware, deleteJob);

module.exports = router;
