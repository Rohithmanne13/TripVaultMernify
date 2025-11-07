import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: "Users"
    },
    likedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const captureSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Trip ID is required"],
        ref: "Trip",
        index: true
    },
    fileName: {
        type: String,
        required: [true, "File name is required"],
        trim: true
    },
    originalFileName: {
        type: String,
        required: true,
        trim: true
    },
    fileUrl: {
        type: String,
        required: [true, "File URL is required"]
    },
    fileType: {
        type: String,
        enum: ["image", "video"],
        required: [true, "File type is required"]
    },
    mimeType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: [true, "File size is required"]
    },
    uploadedBy: {
        type: String,
        required: [true, "Uploader ID is required"],
        ref: "Users",
        index: true
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    likes: [likeSchema],
    likeCount: {
        type: Number,
        default: 0
    },
    captureDate: {
        type: Date,
        default: Date.now
    },
    metadata: {
        width: Number,
        height: Number,
        duration: Number, // for videos in seconds
        format: String
    }
}, {
    timestamps: true
});

// Indexes for faster queries
captureSchema.index({ tripId: 1, createdAt: -1 });
captureSchema.index({ tripId: 1, likeCount: -1 });
captureSchema.index({ tripId: 1, fileType: 1 });
captureSchema.index({ tripId: 1, fileSize: 1 });
captureSchema.index({ tripId: 1, captureDate: -1 });
captureSchema.index({ uploadedBy: 1 });

// Virtual to check if a user has liked
captureSchema.methods.isLikedBy = function(userId) {
    return this.likes.some(like => like.userId === userId);
};


const Capture = mongoose.model("Capture", captureSchema);
export default Capture;
