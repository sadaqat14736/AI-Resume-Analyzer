const Job = require("../db/jobSchema");

// ===============================
// POST /api/jobs  → Add new job
// ===============================
const addJob = async (req, res) => {
    try {
        const { company, position, jobDescription, status, notes } = req.body;
        const userId = req.user.id;

        if (!company || !position) {
            return res.status(400).json({
                status: 400,
                message: "Company and position are required"
            });
        }

        const newJob = new Job({
            userId,
            company,
            position,
            jobDescription,
            status: status || "Applied",
            notes
        });

        await newJob.save();

        res.status(201).json({
            status: 201,
            message: "Job added successfully",
            data: newJob
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        });
    }
};

// ===============================
// GET /api/jobs → Get all jobs of user
// ===============================
const getJobs = async (req, res) => {
    try {
        const userId = req.user.id;
        const jobs = await Job.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            status: 200,
            data: jobs
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        });
    }
};

// ===============================
// PUT /api/jobs/:id → Update job
// ===============================
const updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user.id;
        const updateData = req.body;

        const updatedJob = await Job.findOneAndUpdate(
            { _id: jobId, userId },
            updateData,
            { new: true }
        );

        if (!updatedJob) {
            return res.status(404).json({
                status: 404,
                message: "Job not found"
            });
        }

        res.status(200).json({
            status: 200,
            message: "Job updated successfully",
            data: updatedJob
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        });
    }
};

// ===============================
// DELETE /api/jobs/:id → Delete job
// ===============================
const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user.id;

        const deletedJob = await Job.findOneAndDelete({ _id: jobId, userId });

        if (!deletedJob) {
            return res.status(404).json({
                status: 404,
                message: "Job not found"
            });
        }

        res.status(200).json({
            status: 200,
            message: "Job deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            message: err.message
        });
    }
};

module.exports = { addJob, getJobs, updateJob, deleteJob };
