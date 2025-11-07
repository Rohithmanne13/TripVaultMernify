import { Router } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import multer from "multer";
import {
    createExpense,
    getTripExpenses,
    getExpenseStatistics,
    getUserBalanceSummary,
    markSplitAsPaid,
    deleteExpense,
    updateExpense,
    getPaymentSettings,
    updatePaymentSettings,
    getUserPaymentSettings
} from "../controllers/ExpensesController.js";

const expensesRoutes = Router();

// Configure multer for file uploads (bills and QR codes)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads"),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        const prefix = file.fieldname === 'qrCode' ? 'qr' : 'bill';
        cb(null, `${prefix}-${uniqueSuffix}.${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image and PDF files are allowed!'));
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Expense Routes

// Create a new expense
expensesRoutes.post(
    "/trip/:tripId",
    ClerkExpressRequireAuth(),
    upload.single("billImage"),
    createExpense
);

// Get all expenses for a trip
expensesRoutes.get(
    "/trip/:tripId",
    ClerkExpressRequireAuth(),
    getTripExpenses
);

// Get expense statistics for a trip
expensesRoutes.get(
    "/trip/:tripId/statistics",
    ClerkExpressRequireAuth(),
    getExpenseStatistics
);

// Get user balance summary for a trip
expensesRoutes.get(
    "/trip/:tripId/balance",
    ClerkExpressRequireAuth(),
    getUserBalanceSummary
);

// Mark a split as paid
expensesRoutes.put(
    "/:expenseId/splits/:splitUserId/paid",
    ClerkExpressRequireAuth(),
    markSplitAsPaid
);

// Update an expense
expensesRoutes.put(
    "/:expenseId",
    ClerkExpressRequireAuth(),
    updateExpense
);

// Delete an expense
expensesRoutes.delete(
    "/:expenseId",
    ClerkExpressRequireAuth(),
    deleteExpense
);

// Payment Settings Routes

// Get current user's payment settings
expensesRoutes.get(
    "/payment-settings",
    ClerkExpressRequireAuth(),
    getPaymentSettings
);

// Update current user's payment settings
expensesRoutes.put(
    "/payment-settings",
    ClerkExpressRequireAuth(),
    upload.single("qrCode"),
    updatePaymentSettings
);

// Get payment settings for a specific user
expensesRoutes.get(
    "/payment-settings/:userId",
    ClerkExpressRequireAuth(),
    getUserPaymentSettings
);

export default expensesRoutes;
