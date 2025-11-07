import { Router } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import multer from "multer";
import fs from "fs";
import {
    uploadCapture,
    getTripCaptures,
    getMostLikedCaptures,
    renameCapture,
    deleteCapture,
    toggleLikeCapture,
    updateCaptureDescription,
    getCaptureById
} from "../controllers/CapturesController.js";

const capturesRoutes = Router();

// Ensure uploads directory exists
if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads", { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads"),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, `capture-${uniqueSuffix}.${ext}`);
    }
});

// File filter for images and videos only
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|webm/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed!'));
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Upload a capture to a trip
capturesRoutes.post(
    "/trip/:tripId/upload", 
    ClerkExpressRequireAuth(), 
    upload.single("file"), 
    uploadCapture
);

// Get all captures for a trip (with filters and sorting)
capturesRoutes.get(
    "/trip/:tripId",
    ClerkExpressRequireAuth(),
    getTripCaptures
);

// Get most liked captures for a trip
capturesRoutes.get(
    "/trip/:tripId/most-liked",
    ClerkExpressRequireAuth(),
    getMostLikedCaptures
);

// Get single capture by ID
capturesRoutes.get(
    "/:captureId",
    ClerkExpressRequireAuth(),
    getCaptureById
);

// Rename a capture
capturesRoutes.put(
    "/:captureId/rename",
    ClerkExpressRequireAuth(),
    renameCapture
);

// Update capture description
capturesRoutes.put(
    "/:captureId/description",
    ClerkExpressRequireAuth(),
    updateCaptureDescription
);

// Toggle like on a capture
capturesRoutes.post(
    "/:captureId/like",
    ClerkExpressRequireAuth(),
    toggleLikeCapture
);

// Delete a capture
capturesRoutes.delete(
    "/:captureId",
    ClerkExpressRequireAuth(),
    deleteCapture
);

export default capturesRoutes;
