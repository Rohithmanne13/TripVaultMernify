import { apiClient } from "../apiClient";

// Create a new proposal/discussion
export const createProposal = async (tripId, proposalData, images = []) => {
    try {
        const formData = new FormData();
        formData.append("title", proposalData.title);
        formData.append("description", proposalData.description);
        formData.append("type", proposalData.type);

        if (proposalData.links && proposalData.links.length > 0) {
            formData.append("links", JSON.stringify(proposalData.links));
        }

        if (proposalData.type === "poll") {
            if (proposalData.pollOptions && proposalData.pollOptions.length > 0) {
                formData.append("pollOptions", JSON.stringify(proposalData.pollOptions));
            }
            if (proposalData.allowMultipleVotes !== undefined) {
                formData.append("allowMultipleVotes", proposalData.allowMultipleVotes);
            }
            if (proposalData.pollEndsAt) {
                formData.append("pollEndsAt", proposalData.pollEndsAt);
            }
        }

        // Append images
        images.forEach((image) => {
            formData.append("images", image);
        });

        const response = await apiClient.post(
            `/api/proposals/trip/${tripId}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to create proposal");
    }
};

// Get all proposals for a trip
export const getTripProposals = async (tripId, type = null) => {
    try {
        const params = new URLSearchParams();
        if (type) params.append("type", type);

        const queryString = params.toString();
        const url = `/api/proposals/trip/${tripId}${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch proposals");
    }
};

// Get single proposal by ID
export const getProposalById = async (proposalId) => {
    try {
        const response = await apiClient.get(`/api/proposals/${proposalId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch proposal");
    }
};

// Update a proposal
export const updateProposal = async (proposalId, proposalData, newImages = []) => {
    try {
        const formData = new FormData();
        
        if (proposalData.title) formData.append("title", proposalData.title);
        if (proposalData.description) formData.append("description", proposalData.description);
        
        if (proposalData.links !== undefined) {
            formData.append("links", JSON.stringify(proposalData.links));
        }

        if (proposalData.pollOptions) {
            formData.append("pollOptions", JSON.stringify(proposalData.pollOptions));
        }
        if (proposalData.allowMultipleVotes !== undefined) {
            formData.append("allowMultipleVotes", proposalData.allowMultipleVotes);
        }
        if (proposalData.pollEndsAt !== undefined) {
            formData.append("pollEndsAt", proposalData.pollEndsAt || "");
        }
        if (proposalData.isPollActive !== undefined) {
            formData.append("isPollActive", proposalData.isPollActive);
        }

        // Append new images
        newImages.forEach((image) => {
            formData.append("images", image);
        });

        const response = await apiClient.put(
            `/api/proposals/${proposalId}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to update proposal");
    }
};

// Delete a proposal
export const deleteProposal = async (proposalId) => {
    try {
        const response = await apiClient.delete(`/api/proposals/${proposalId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to delete proposal");
    }
};

// Vote on a poll
export const voteOnPoll = async (proposalId, optionId) => {
    try {
        const response = await apiClient.post(
            `/api/proposals/${proposalId}/vote/${optionId}`
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to vote");
    }
};

// Remove an image from proposal
export const removeProposalImage = async (proposalId, imageId) => {
    try {
        const response = await apiClient.delete(
            `/api/proposals/${proposalId}/images/${imageId}`
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to remove image");
    }
};
