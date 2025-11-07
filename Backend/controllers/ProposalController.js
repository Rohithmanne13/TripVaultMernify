import Proposal from "../models/ProposalModel.js";
import Trip from "../models/TripModel.js";
import fs from "fs/promises";
import path from "path";

// Create a new proposal/discussion
export const createProposal = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.auth.userId;
        const { title, description, type, links, pollOptions, allowMultipleVotes, pollEndsAt } = req.body;

        // Validate tripId
        if (!tripId || tripId === 'undefined' || tripId === 'null') {
            if (req.files) {
                await Promise.all(req.files.map(file => fs.unlink(file.path).catch(console.error)));
            }
            return res.status(400).json({ message: "Invalid trip ID" });
        }

        // Verify trip exists and user is a member
        const trip = await Trip.findById(tripId);
        if (!trip) {
            if (req.files) {
                await Promise.all(req.files.map(file => fs.unlink(file.path).catch(console.error)));
            }
            return res.status(404).json({ message: "Trip not found" });
        }

        const isMember = trip.members.some(member => member.userId === userId) || trip.createdBy === userId;
        if (!isMember) {
            if (req.files) {
                await Promise.all(req.files.map(file => fs.unlink(file.path).catch(console.error)));
            }
            return res.status(403).json({ message: "You are not a member of this trip" });
        }

        // Parse links if provided as string
        let parsedLinks = [];
        if (links) {
            try {
                parsedLinks = typeof links === 'string' ? JSON.parse(links) : links;
            } catch (error) {
                parsedLinks = [];
            }
        }

        // Parse poll options if provided
        let parsedPollOptions = [];
        if (pollOptions) {
            try {
                const options = typeof pollOptions === 'string' ? JSON.parse(pollOptions) : pollOptions;
                parsedPollOptions = options.map(opt => ({
                    optionText: opt.optionText || opt,
                    votes: [],
                    voteCount: 0
                }));
            } catch (error) {
                parsedPollOptions = [];
            }
        }

        // Handle uploaded images
        const images = req.files ? req.files.map(file => ({
            fileName: file.filename,
            fileUrl: `${process.env.ORIGIN_BACKEND || 'http://localhost:8747'}/uploads/${file.filename}`,
            uploadedAt: new Date()
        })) : [];

        // Create proposal
        const proposal = new Proposal({
            tripId,
            title,
            description,
            type: type || "discussion",
            createdBy: userId,
            images,
            links: parsedLinks,
            pollOptions: type === "poll" ? parsedPollOptions : [],
            allowMultipleVotes: type === "poll" ? (allowMultipleVotes === 'true' || allowMultipleVotes === true) : false,
            pollEndsAt: type === "poll" && pollEndsAt ? new Date(pollEndsAt) : null,
            isPollActive: type === "poll"
        });

        await proposal.save();

        // Populate creator info
        await proposal.populate("createdBy", "firstName lastName email imageUrl");

        return res.status(201).json({
            message: "Proposal created successfully",
            proposal
        });
    } catch (error) {
        console.error("Error creating proposal:", error);
        if (req.files) {
            try {
                await Promise.all(req.files.map(file => fs.unlink(file.path).catch(console.error)));
            } catch (unlinkError) {
                console.error("Error deleting files:", unlinkError);
            }
        }
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get all proposals for a trip
export const getTripProposals = async (req, res) => {
    try {
        const { tripId } = req.params;
        const userId = req.auth.userId;
        const { type } = req.query;

        // Validate tripId
        if (!tripId || tripId === 'undefined' || tripId === 'null') {
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
        if (type && ["discussion", "proposal", "poll"].includes(type)) {
            query.type = type;
        }

        const proposals = await Proposal.find(query)
            .sort({ createdAt: -1 })
            .populate("createdBy", "firstName lastName email imageUrl");

        return res.status(200).json({ proposals });
    } catch (error) {
        console.error("Error fetching proposals:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get single proposal by ID
export const getProposalById = async (req, res) => {
    try {
        const { proposalId } = req.params;
        const userId = req.auth.userId;

        const proposal = await Proposal.findById(proposalId)
            .populate("createdBy", "firstName lastName email imageUrl");

        if (!proposal) {
            return res.status(404).json({ message: "Proposal not found" });
        }

        // Verify user is a member of the trip
        const trip = await Trip.findById(proposal.tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const isMember = trip.members.some(member => member.userId === userId) || trip.createdBy === userId;
        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this trip" });
        }

        return res.status(200).json({ proposal });
    } catch (error) {
        console.error("Error fetching proposal:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update a proposal
export const updateProposal = async (req, res) => {
    try {
        const { proposalId } = req.params;
        const userId = req.auth.userId;
        const { title, description, links, pollOptions, allowMultipleVotes, pollEndsAt, isPollActive } = req.body;

        const proposal = await Proposal.findById(proposalId);
        if (!proposal) {
            if (req.files) {
                await Promise.all(req.files.map(file => fs.unlink(file.path).catch(console.error)));
            }
            return res.status(404).json({ message: "Proposal not found" });
        }

        // Only creator can edit
        if (proposal.createdBy !== userId) {
            if (req.files) {
                await Promise.all(req.files.map(file => fs.unlink(file.path).catch(console.error)));
            }
            return res.status(403).json({ message: "Only the creator can edit this proposal" });
        }

        // Update fields
        if (title) proposal.title = title;
        if (description) proposal.description = description;
        
        // Parse and update links
        if (links !== undefined) {
            try {
                proposal.links = typeof links === 'string' ? JSON.parse(links) : links;
            } catch (error) {
                // Keep existing links if parse fails
            }
        }

        // Handle poll options update
        if (pollOptions && proposal.type === "poll") {
            try {
                const options = typeof pollOptions === 'string' ? JSON.parse(pollOptions) : pollOptions;
                // Preserve existing votes when updating options
                const existingOptions = proposal.pollOptions;
                proposal.pollOptions = options.map((opt, index) => {
                    const existing = existingOptions.find(eo => eo.optionText === opt.optionText || eo._id.toString() === opt._id);
                    return {
                        _id: existing?._id || undefined,
                        optionText: opt.optionText || opt,
                        votes: existing?.votes || [],
                        voteCount: existing?.voteCount || 0
                    };
                });
            } catch (error) {
                console.error("Error parsing poll options:", error);
            }
        }

        if (allowMultipleVotes !== undefined && proposal.type === "poll") {
            proposal.allowMultipleVotes = allowMultipleVotes === 'true' || allowMultipleVotes === true;
        }

        if (pollEndsAt !== undefined && proposal.type === "poll") {
            proposal.pollEndsAt = pollEndsAt ? new Date(pollEndsAt) : null;
        }

        if (isPollActive !== undefined && proposal.type === "poll") {
            proposal.isPollActive = isPollActive === 'true' || isPollActive === true;
        }

        // Handle new images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                fileName: file.filename,
                fileUrl: `${process.env.ORIGIN_BACKEND || 'http://localhost:8747'}/uploads/${file.filename}`,
                uploadedAt: new Date()
            }));
            proposal.images = [...proposal.images, ...newImages];
        }

        await proposal.save();
        await proposal.populate("createdBy", "firstName lastName email imageUrl");

        return res.status(200).json({
            message: "Proposal updated successfully",
            proposal
        });
    } catch (error) {
        console.error("Error updating proposal:", error);
        if (req.files) {
            try {
                await Promise.all(req.files.map(file => fs.unlink(file.path).catch(console.error)));
            } catch (unlinkError) {
                console.error("Error deleting files:", unlinkError);
            }
        }
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Delete a proposal
export const deleteProposal = async (req, res) => {
    try {
        const { proposalId } = req.params;
        const userId = req.auth.userId;

        const proposal = await Proposal.findById(proposalId);
        if (!proposal) {
            return res.status(404).json({ message: "Proposal not found" });
        }

        // Verify trip
        const trip = await Trip.findById(proposal.tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // Only creator or trip creator can delete
        const isProposalCreator = proposal.createdBy === userId;
        const isTripCreator = trip.createdBy === userId;

        if (!isProposalCreator && !isTripCreator) {
            return res.status(403).json({ message: "You don't have permission to delete this proposal" });
        }

        // Delete associated images
        if (proposal.images && proposal.images.length > 0) {
            for (const image of proposal.images) {
                const filePath = path.join(process.cwd(), "uploads", image.fileName);
                try {
                    await fs.unlink(filePath);
                } catch (fileError) {
                    console.error("Error deleting image file:", fileError);
                }
            }
        }

        await Proposal.findByIdAndDelete(proposalId);

        return res.status(200).json({
            message: "Proposal deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting proposal:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Vote on a poll
export const voteOnPoll = async (req, res) => {
    try {
        const { proposalId, optionId } = req.params;
        const userId = req.auth.userId;

        const proposal = await Proposal.findById(proposalId);
        if (!proposal) {
            return res.status(404).json({ message: "Proposal not found" });
        }

        // Verify it's a poll
        if (proposal.type !== "poll") {
            return res.status(400).json({ message: "This is not a poll" });
        }

        // Check if poll is active
        if (!proposal.isPollActive) {
            return res.status(400).json({ message: "This poll is closed" });
        }

        // Check if poll has ended
        if (proposal.pollEndsAt && new Date() > proposal.pollEndsAt) {
            proposal.isPollActive = false;
            await proposal.save();
            return res.status(400).json({ message: "This poll has ended" });
        }

        // Verify user is a member of the trip
        const trip = await Trip.findById(proposal.tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const isMember = trip.members.some(member => member.userId === userId) || trip.createdBy === userId;
        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this trip" });
        }

        // Find the option
        const option = proposal.pollOptions.id(optionId);
        if (!option) {
            return res.status(404).json({ message: "Poll option not found" });
        }

        // Check if user has already voted
        const hasVoted = proposal.hasUserVoted(userId);

        if (hasVoted && !proposal.allowMultipleVotes) {
            // Remove previous vote
            proposal.pollOptions.forEach(opt => {
                const voteIndex = opt.votes.findIndex(v => v.userId === userId);
                if (voteIndex > -1) {
                    opt.votes.splice(voteIndex, 1);
                    opt.voteCount = Math.max(0, opt.voteCount - 1);
                }
            });
        }

        // Check if user already voted for this option
        const alreadyVotedForOption = option.votes.some(v => v.userId === userId);

        if (alreadyVotedForOption) {
            // Remove vote (toggle)
            const voteIndex = option.votes.findIndex(v => v.userId === userId);
            option.votes.splice(voteIndex, 1);
            option.voteCount = Math.max(0, option.voteCount - 1);
        } else {
            // Add vote
            option.votes.push({
                userId,
                votedAt: new Date()
            });
            option.voteCount += 1;
        }

        // Recalculate total votes
        proposal.totalVotes = proposal.pollOptions.reduce((sum, opt) => sum + opt.voteCount, 0);

        await proposal.save();
        await proposal.populate("createdBy", "firstName lastName email imageUrl");

        return res.status(200).json({
            message: alreadyVotedForOption ? "Vote removed" : "Vote recorded",
            proposal
        });
    } catch (error) {
        console.error("Error voting on poll:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Remove an image from proposal
export const removeProposalImage = async (req, res) => {
    try {
        const { proposalId, imageId } = req.params;
        const userId = req.auth.userId;

        const proposal = await Proposal.findById(proposalId);
        if (!proposal) {
            return res.status(404).json({ message: "Proposal not found" });
        }

        // Only creator can remove images
        if (proposal.createdBy !== userId) {
            return res.status(403).json({ message: "Only the creator can remove images" });
        }

        // Find and remove image
        const imageIndex = proposal.images.findIndex(img => img._id.toString() === imageId);
        if (imageIndex === -1) {
            return res.status(404).json({ message: "Image not found" });
        }

        const image = proposal.images[imageIndex];
        
        // Delete file from filesystem
        const filePath = path.join(process.cwd(), "uploads", image.fileName);
        try {
            await fs.unlink(filePath);
        } catch (fileError) {
            console.error("Error deleting image file:", fileError);
        }

        // Remove from array
        proposal.images.splice(imageIndex, 1);
        await proposal.save();

        return res.status(200).json({
            message: "Image removed successfully",
            proposal
        });
    } catch (error) {
        console.error("Error removing image:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
