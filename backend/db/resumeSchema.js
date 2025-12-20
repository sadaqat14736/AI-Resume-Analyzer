const mongoose = require("mongoose");
const { Schema } = mongoose;

const resumeSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    originalText: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
        default: ""
    },

    aiImprovedText: {
        type: String,
    },
    aiScore: {
        type: Number,
    },
    atsScore: {
        type: Number,
    },
    suggestions: {
        type: [String],
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Resume", resumeSchema);
