import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: "Users"
    },
    role: {
        type: String,
        enum: ["Admin", "Editor", "Viewer"],
        default: "Viewer"
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const budgetSchema = new mongoose.Schema({
    total: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: "INR"
    }
}, { _id: false });

const tripSchema = new mongoose.Schema({
    tripName: {
        type: String,
        required: [true, "Trip name is required"],
        trim: true
    },
    destination: {
        type: String,
        required: [true, "Destination is required"],
        trim: true
    },
    startDate: {
        type: Date,
        required: [true, "Start date is required"]
    },
    endDate: {
        type: Date,
        required: [true, "End date is required"],
        validate: {
            validator: function(value) {
                return value >= this.startDate;
            },
            message: "End date must be after start date"
        }
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    coverImage: {
        type: String,
        default: ""
    },
    createdBy: {
        type: String,
        required: [true, "Creator ID is required"],
        ref: "Users"
    },
    members: [memberSchema],
    inviteCode: {
        type: String,
        unique: true,
        required: true
    },
    budget: {
        type: budgetSchema,
        default: () => ({})
    }
}, {
    timestamps: true
});

// Index for faster queries
tripSchema.index({ createdBy: 1, createdAt: -1 });
tripSchema.index({ "members.userId": 1 });
tripSchema.index({ inviteCode: 1 });

const Trip = mongoose.model("Trip", tripSchema);
export default Trip;
