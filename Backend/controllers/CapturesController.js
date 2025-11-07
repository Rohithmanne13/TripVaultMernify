import Capture from "../models/CaptureModel.js";
import Trip from "../models/TripModel.js";
import fs from "fs/promises";
import path from "path";

// Upload a new capture (photo/video)
export const uploadCapture = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.auth.userId;
        const { description, captureDate } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Validate tripId
        if (!tripId || tripId === 'undefined' || tripId === 'null') {
            console.error("Invalid tripId received:", tripId);
            await fs.unlink(req.file.path);
            return res.status(400).json({ message: "Invalid trip ID" });
        }

        // Verify trip exists and user is a member
        const trip = await Trip.findById(tripId);
        if (!trip) {
            // Delete uploaded file if trip not found
            await fs.unlink(req.file.path);
            return res.status(404).json({ message: "Trip not found" });
        }

        const isMember = trip.members.some(member => member.userId === userId) || trip.createdBy === userId;
        if (!isMember) {
            await fs.unlink(req.file.path);
            return res.status(403).json({ message: "You are not a member of this trip" });
        }

        // Determine file type
        const mimeType = req.file.mimetype;
        let fileType = "image";
        if (mimeType.startsWith("video/")) {
            fileType = "video";
        } else if (!mimeType.startsWith("image/")) {
            await fs.unlink(req.file.path);
            return res.status(400).json({ message: "Only image and video files are allowed" });
        }

        // Create capture document
        const capture = new Capture({
            tripId,
            fileName: req.file.filename,
            originalFileName: req.file.originalname,
            fileUrl: `/uploads/${req.file.filename}`,
            fileType,
            mimeType,
            fileSize: req.file.size,
            uploadedBy: userId,
            description: description || "",
            captureDate: captureDate || new Date()
        });

        await capture.save();

        // Populate uploader info
        await capture.populate("uploadedBy", "name email profilePicture");

        return res.status(201).json({
            message: "Capture uploaded successfully",
            capture
        });
    } catch (error) {
        console.error("Error uploading capture:", error);
        // Clean up file on error
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error("Error deleting file:", unlinkError);
            }
        }
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get all captures for a trip with filters and sorting
export const getTripCaptures = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.auth.userId;
        const { 
            fileType, 
            sortBy = "createdAt", 
            order = "desc",
            limit = 50,
            skip = 0
        } = req.query;

        // Validate tripId
        if (!tripId || tripId === 'undefined' || tripId === 'null') {
            console.error("Invalid tripId received:", tripId);
            return res.status(400).json({ message: "Invalid trip ID" });
        }

        // Verify trip exists and user is a member
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const isMember = trip.members.some(member => member.userId === userId) || trip.createdBy === userId;
        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this trip" });
        }

        // Build query
        const query = { tripId };
        if (fileType && ["image", "video"].includes(fileType)) {
            query.fileType = fileType;
        }

        // Build sort object
        const sortOptions = {};
        const validSortFields = ["createdAt", "likeCount", "fileSize", "captureDate", "fileName"];
        if (validSortFields.includes(sortBy)) {
            sortOptions[sortBy] = order === "asc" ? 1 : -1;
        } else {
            sortOptions.createdAt = -1;
        }

        // Execute query
        const captures = await Capture.find(query)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .populate("uploadedBy", "name email profilePicture");

        const totalCount = await Capture.countDocuments(query);

        return res.status(200).json({
            captures,
            totalCount,
            hasMore: parseInt(skip) + captures.length < totalCount
        });
    } catch (error) {
        console.error("Error fetching captures:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get most liked captures for a trip
export const getMostLikedCaptures = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.auth.userId;
        const { limit = 10 } = req.query;

        // Validate tripId
        if (!tripId || tripId === 'undefined' || tripId === 'null') {
            console.error("Invalid tripId received:", tripId);
            return res.status(400).json({ message: "Invalid trip ID" });
        }

        // Verify trip exists and user is a member
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const isMember = trip.members.some(member => member.userId === userId) || trip.createdBy === userId;
        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this trip" });
        }

        const captures = await Capture.find({ tripId, likeCount: { $gt: 0 } })
            .sort({ likeCount: -1, createdAt: -1 })
            .limit(parseInt(limit))
            .populate("uploadedBy", "name email profilePicture");

        return res.status(200).json({ captures });
    } catch (error) {
        console.error("Error fetching most liked captures:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Rename a capture
export const renameCapture = async (req, res) => {
    try {
        const { captureId } = req.params;
        const userId = req.auth.userId;
        const { fileName } = req.body;

        if (!fileName || !fileName.trim()) {
            return res.status(400).json({ message: "File name is required" });
        }

        const capture = await Capture.findById(captureId);
        if (!capture) {
            return res.status(404).json({ message: "Capture not found" });
        }

        // Verify trip and permissions
        const trip = await Trip.findById(capture.tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // Only uploader or trip creator can rename
        const isUploader = capture.uploadedBy === userId;
        const isCreator = trip.createdBy === userId;
        
        if (!isUploader && !isCreator) {
            return res.status(403).json({ message: "You don't have permission to rename this capture" });
        }

        capture.fileName = fileName.trim();
        await capture.save();

        await capture.populate("uploadedBy", "name email profilePicture");

        return res.status(200).json({
            message: "Capture renamed successfully",
            capture
        });
    } catch (error) {
        console.error("Error renaming capture:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Delete a capture
export const deleteCapture = async (req, res) => {
    try {
        const { captureId } = req.params;
        const userId = req.auth.userId;

        const capture = await Capture.findById(captureId);
        if (!capture) {
            return res.status(404).json({ message: "Capture not found" });
        }

        // Verify trip and permissions
        const trip = await Trip.findById(capture.tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // Only uploader or trip creator can delete
        const isUploader = capture.uploadedBy === userId;
        const isCreator = trip.createdBy === userId;
        
        if (!isUploader && !isCreator) {
            return res.status(403).json({ message: "You don't have permission to delete this capture" });
        }

        // Delete file from filesystem
        const filePath = path.join(process.cwd(), "uploads", capture.fileName);
        try {
            await fs.unlink(filePath);
        } catch (fileError) {
            console.error("Error deleting file from filesystem:", fileError);
            // Continue with database deletion even if file deletion fails
        }

        await Capture.findByIdAndDelete(captureId);

        return res.status(200).json({
            message: "Capture deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting capture:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Toggle like on a capture
export const toggleLikeCapture = async (req, res) => {
    try {
        const { captureId } = req.params;
        const userId = req.auth.userId;

        const capture = await Capture.findById(captureId);
        if (!capture) {
            return res.status(404).json({ message: "Capture not found" });
        }

        // Verify user is a member of the trip
        const trip = await Trip.findById(capture.tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const isMember = trip.members.some(member => member.userId === userId) || trip.createdBy === userId;
        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this trip" });
        }

        // Check if user has already liked
        const likeIndex = capture.likes.findIndex(like => like.userId === userId);

        if (likeIndex > -1) {
            // Unlike
            capture.likes.splice(likeIndex, 1);
            capture.likeCount = Math.max(0, capture.likeCount - 1);
        } else {
            // Like
            capture.likes.push({ userId, likedAt: new Date() });
            capture.likeCount += 1;
        }

        await capture.save();
        await capture.populate("uploadedBy", "name email profilePicture");

        return res.status(200).json({
            message: likeIndex > -1 ? "Capture unliked" : "Capture liked",
            capture,
            isLiked: likeIndex === -1
        });
    } catch (error) {
        console.error("Error toggling like:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update capture description
export const updateCaptureDescription = async (req, res) => {
    try {
        const { captureId } = req.params;
        const userId = req.auth.userId;
        const { description } = req.body;

        const capture = await Capture.findById(captureId);
        if (!capture) {
            return res.status(404).json({ message: "Capture not found" });
        }

        // Only uploader can update description
        if (capture.uploadedBy !== userId) {
            return res.status(403).json({ message: "Only the uploader can update the description" });
        }

        capture.description = description || "";
        await capture.save();

        await capture.populate("uploadedBy", "name email profilePicture");

        return res.status(200).json({
            message: "Description updated successfully",
            capture
        });
    } catch (error) {
        console.error("Error updating description:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get single capture details
export const getCaptureById = async (req, res) => {
    try {
        const { captureId } = req.params;
        const userId = req.auth.userId;

        const capture = await Capture.findById(captureId)
            .populate("uploadedBy", "name email profilePicture");

        if (!capture) {
            return res.status(404).json({ message: "Capture not found" });
        }

        // Verify user is a member of the trip
        const trip = await Trip.findById(capture.tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const isMember = trip.members.some(member => member.userId === userId) || trip.createdBy === userId;
        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this trip" });
        }

        return res.status(200).json({ capture });
    } catch (error) {
        console.error("Error fetching capture:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Legacy function for compatibility
export const uplodFile = uploadCapture;