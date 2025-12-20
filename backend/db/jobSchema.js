const mongoose = require("mongoose");


const jobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    company: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["Applied", "Interviewing", "Rejected", "Offered"],
        default: "Applied"
    },
    notes: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Jobs", jobSchema);
