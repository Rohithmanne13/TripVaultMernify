import mongoose from "mongoose";

const linkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });

const pollOptionSchema = new mongoose.Schema({
    optionText: {
        type: String,
        required: true,
        trim: true
    },
    votes: [{
        userId: {
            type: String,
            required: true,
            ref: "Users"
        },
        votedAt: {
            type: Date,
            default: Date.now
        }
    }],
    voteCount: {
        type: Number,
        default: 0
    }
}, { _id: true });

const proposalSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Trip ID is required"],
        ref: "Trip",
        index: true
    },
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        maxlength: [200, "Title cannot exceed 200 characters"]
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true
    },
    type: {
        type: String,
        enum: ["discussion", "proposal", "poll"],
        required: true,
        default: "discussion"
    },
    createdBy: {
        type: String,
        required: [true, "Creator ID is required"],
        ref: "Users",
        index: true
    },
    images: [{
        fileName: String,
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    links: [linkSchema],
    // Poll-specific fields
    pollOptions: [pollOptionSchema],
    allowMultipleVotes: {
        type: Boolean,
        default: false
    },
    pollEndsAt: {
        type: Date
    },
    // Engagement metrics
    totalVotes: {
        type: Number,
        default: 0
    },
    isPollActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for faster queries
proposalSchema.index({ tripId: 1, createdAt: -1 });
proposalSchema.index({ tripId: 1, type: 1 });
proposalSchema.index({ createdBy: 1 });

// Method to check if user has voted in poll
proposalSchema.methods.hasUserVoted = function(userId) {
    return this.pollOptions.some(option => 
        option.votes.some(vote => vote.userId === userId)
    );
};

// Method to get user's vote
proposalSchema.methods.getUserVote = function(userId) {
    for (let option of this.pollOptions) {
        const vote = option.votes.find(v => v.userId === userId);
        if (vote) {
            return option._id;
        }
    }
    return null;
};

const Proposal = mongoose.model("Proposal", proposalSchema);
export default Proposal;
