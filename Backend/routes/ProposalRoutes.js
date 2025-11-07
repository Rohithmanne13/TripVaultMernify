import { Router } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import multer from "multer";
import {
    createProposal,
    getTripProposals,
    getProposalById,
    updateProposal,
    deleteProposal,
    voteOnPoll,
    removeProposalImage
} from "../controllers/ProposalController.js";

const proposalRoutes = Router();

// Configure multer for proposal image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads"),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, `proposal-${uniqueSuffix}.${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = file.mimetype.startsWith('image/');
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit per image
    }
});

// Create a proposal/discussion for a trip
proposalRoutes.post(
    "/trip/:tripId",
    ClerkExpressRequireAuth(),
    upload.array("images", 5), // Max 5 images
    createProposal
);

// Get all proposals for a trip
proposalRoutes.get(
    "/trip/:tripId",
    ClerkExpressRequireAuth(),
    getTripProposals
);

// Get single proposal by ID
proposalRoutes.get(
    "/:proposalId",
    ClerkExpressRequireAuth(),
    getProposalById
);

// Update a proposal
proposalRoutes.put(
    "/:proposalId",
    ClerkExpressRequireAuth(),
    upload.array("images", 5),
    updateProposal
);

// Delete a proposal
proposalRoutes.delete(
    "/:proposalId",
    ClerkExpressRequireAuth(),
    deleteProposal
);

// Vote on a poll
proposalRoutes.post(
    "/:proposalId/vote/:optionId",
    ClerkExpressRequireAuth(),
    voteOnPoll
);

// Remove an image from proposal
proposalRoutes.delete(
    "/:proposalId/images/:imageId",
    ClerkExpressRequireAuth(),
    removeProposalImage
);

export default proposalRoutes;
