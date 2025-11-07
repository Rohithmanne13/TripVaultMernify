import mongoose from "mongoose";

const paymentSettingsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "User ID is required"],
        unique: true,
        index: true
    },
    upiId: {
        type: String,
        trim: true,
        default: ""
    },
    qrCodeUrl: {
        type: String,
        default: ""
    },
    phoneNumber: {
        type: String,
        trim: true,
        default: ""
    },
    bankName: {
        type: String,
        trim: true,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const PaymentSettings = mongoose.model("PaymentSettings", paymentSettingsSchema);
export default PaymentSettings;
