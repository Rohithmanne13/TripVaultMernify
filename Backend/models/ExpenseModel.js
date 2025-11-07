import mongoose from "mongoose";

const splitSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: "Users"
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date
    }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Trip ID is required"],
        ref: "Trip",
        index: true
    },
    title: {
        type: String,
        required: [true, "Expense title is required"],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount must be positive"]
    },
    currency: {
        type: String,
        default: "INR",
        uppercase: true
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: ["travel", "food", "accommodation", "others"],
        lowercase: true
    },
    paidBy: {
        type: String,
        required: [true, "Paid by user ID is required"],
        ref: "Users",
        index: true
    },
    billImageUrl: {
        type: String,
        default: ""
    },
    splits: [splitSchema],
    expenseDate: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true,
        default: ""
    }
}, {
    timestamps: true
});

// Indexes for faster queries
expenseSchema.index({ tripId: 1, createdAt: -1 });
expenseSchema.index({ tripId: 1, category: 1 });
expenseSchema.index({ tripId: 1, paidBy: 1 });
expenseSchema.index({ "splits.userId": 1 });

// Virtual to calculate total split amount
expenseSchema.virtual('totalSplitAmount').get(function() {
    return this.splits.reduce((sum, split) => sum + split.amount, 0);
});

// Method to check if all splits are paid
expenseSchema.methods.isFullyPaid = function() {
    return this.splits.every(split => split.isPaid);
};

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
