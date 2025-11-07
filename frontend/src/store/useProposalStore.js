import { create } from "zustand";
import {
    getTripProposals as fetchTripProposalsAPI,
    getProposalById as fetchProposalByIdAPI,
    createProposal as createProposalAPI,
    updateProposal as updateProposalAPI,
    deleteProposal as deleteProposalAPI,
    voteOnPoll as voteOnPollAPI,
    removeProposalImage as removeProposalImageAPI
} from "@/lib/api/proposals";

export const useProposalStore = create((set, get) => ({
    proposals: [],
    currentProposal: null,
    loading: false,
    creating: false,
    currentFilter: null, // "discussion", "proposal", "poll", or null for all

    // Fetch all proposals for a trip
    fetchProposals: async (tripId, type = null) => {
        set({ loading: true });
        try {
            const data = await fetchTripProposalsAPI(tripId, type);
            set({
                proposals: data.proposals,
                currentFilter: type,
                loading: false
            });
        } catch (error) {
            console.error("Error fetching proposals:", error);
            set({ loading: false });
            throw error;
        }
    },

    // Fetch single proposal by ID
    fetchProposalById: async (proposalId) => {
        set({ loading: true });
        try {
            const data = await fetchProposalByIdAPI(proposalId);
            set({
                currentProposal: data.proposal,
                loading: false
            });
            return data.proposal;
        } catch (error) {
            console.error("Error fetching proposal:", error);
            set({ loading: false });
            throw error;
        }
    },

    // Create a new proposal
    createProposal: async (tripId, proposalData, images = []) => {
        set({ creating: true });
        try {
            const data = await createProposalAPI(tripId, proposalData, images);
            
            // Add to beginning of proposals list
            set({
                proposals: [data.proposal, ...get().proposals],
                creating: false
            });

            return data.proposal;
        } catch (error) {
            set({ creating: false });
            throw error;
        }
    },

    // Update a proposal
    updateProposal: async (proposalId, proposalData, newImages = []) => {
        try {
            const data = await updateProposalAPI(proposalId, proposalData, newImages);
            
            // Update proposal in list
            set({
                proposals: get().proposals.map(proposal =>
                    proposal._id === proposalId ? data.proposal : proposal
                ),
                currentProposal: get().currentProposal?._id === proposalId 
                    ? data.proposal 
                    : get().currentProposal
            });

            return data.proposal;
        } catch (error) {
            throw error;
        }
    },

    // Delete a proposal
    deleteProposal: async (proposalId) => {
        try {
            await deleteProposalAPI(proposalId);
            
            // Remove from proposals list
            set({
                proposals: get().proposals.filter(p => p._id !== proposalId),
                currentProposal: get().currentProposal?._id === proposalId 
                    ? null 
                    : get().currentProposal
            });
        } catch (error) {
            throw error;
        }
    },

    // Vote on a poll
    voteOnPoll: async (proposalId, optionId) => {
        try {
            const data = await voteOnPollAPI(proposalId, optionId);
            
            // Update proposal in list with new vote data
            set({
                proposals: get().proposals.map(proposal =>
                    proposal._id === proposalId ? data.proposal : proposal
                ),
                currentProposal: get().currentProposal?._id === proposalId 
                    ? data.proposal 
                    : get().currentProposal
            });

            return data.proposal;
        } catch (error) {
            throw error;
        }
    },

    // Remove an image from proposal
    removeImage: async (proposalId, imageId) => {
        try {
            const data = await removeProposalImageAPI(proposalId, imageId);
            
            // Update proposal in list
            set({
                proposals: get().proposals.map(proposal =>
                    proposal._id === proposalId ? data.proposal : proposal
                ),
                currentProposal: get().currentProposal?._id === proposalId 
                    ? data.proposal 
                    : get().currentProposal
            });

            return data.proposal;
        } catch (error) {
            throw error;
        }
    },

    // Set filter
    setFilter: (filter) => {
        set({ currentFilter: filter });
    },

    // Clear all proposals
    clearProposals: () => {
        set({
            proposals: [],
            currentProposal: null,
            currentFilter: null
        });
    }
}));
