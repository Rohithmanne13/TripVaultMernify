import { create } from "zustand";
import {
    getTripCaptures as fetchTripCapturesAPI,
    getMostLikedCaptures as fetchMostLikedCapturesAPI,
    uploadCapture as uploadCaptureAPI,
    deleteCapture as deleteCaptureAPI,
    toggleLikeCapture as toggleLikeCaptureAPI,
    renameCapture as renameCaptureAPI,
    updateCaptureDescription as updateCaptureDescriptionAPI
} from "@/lib/api/captures";

export const useCaptureStore = create((set, get) => ({
    captures: [],
    mostLikedCaptures: [],
    loading: false,
    uploading: false,
    totalCount: 0,
    hasMore: false,
    currentFilters: {
        fileType: null,
        sortBy: "createdAt",
        order: "desc",
        limit: 50,
        skip: 0
    },

    // Fetch captures for a trip
    fetchCaptures: async (tripId, options = {}) => {
        console.log("useCaptureStore.fetchCaptures called with tripId:", tripId, "options:", options);
        set({ loading: true });
        try {
            const filters = { ...get().currentFilters, ...options };
            console.log("Calling fetchTripCapturesAPI with tripId:", tripId);
            const data = await fetchTripCapturesAPI(tripId, filters);
            
            if (filters.skip === 0) {
                // First page - replace captures
                set({
                    captures: data.captures,
                    totalCount: data.totalCount,
                    hasMore: data.hasMore,
                    currentFilters: filters,
                    loading: false
                });
            } else {
                // Load more - append captures
                set({
                    captures: [...get().captures, ...data.captures],
                    totalCount: data.totalCount,
                    hasMore: data.hasMore,
                    currentFilters: filters,
                    loading: false
                });
            }
        } catch (error) {
            console.error("Error in useCaptureStore.fetchCaptures:", error);
            set({ loading: false });
            throw error;
        }
    },

    // Fetch most liked captures
    fetchMostLikedCaptures: async (tripId, limit = 10) => {
        try {
            const data = await fetchMostLikedCapturesAPI(tripId, limit);
            set({ mostLikedCaptures: data.captures });
        } catch (error) {
            console.error("Error fetching most liked captures:", error);
            throw error;
        }
    },

    // Upload a new capture
    uploadCapture: async (tripId, file, description, captureDate) => {
        set({ uploading: true });
        try {
            const data = await uploadCaptureAPI(tripId, file, description, captureDate);
            
            // Add to beginning of captures list
            set({
                captures: [data.capture, ...get().captures],
                totalCount: get().totalCount + 1,
                uploading: false
            });
            
            return data.capture;
        } catch (error) {
            set({ uploading: false });
            throw error;
        }
    },

    // Delete a capture
    deleteCapture: async (captureId) => {
        try {
            await deleteCaptureAPI(captureId);
            
            // Remove from captures list
            set({
                captures: get().captures.filter(c => c._id !== captureId),
                mostLikedCaptures: get().mostLikedCaptures.filter(c => c._id !== captureId),
                totalCount: Math.max(0, get().totalCount - 1)
            });
        } catch (error) {
            throw error;
        }
    },

    // Toggle like on a capture
    toggleLike: async (captureId) => {
        try {
            const data = await toggleLikeCaptureAPI(captureId);
            
            // Update capture in both lists
            const updateCapture = (capture) => {
                if (capture._id === captureId) {
                    return data.capture;
                }
                return capture;
            };
            
            set({
                captures: get().captures.map(updateCapture),
                mostLikedCaptures: get().mostLikedCaptures.map(updateCapture)
            });
            
            return data.isLiked;
        } catch (error) {
            throw error;
        }
    },

    // Rename a capture
    renameCapture: async (captureId, fileName) => {
        try {
            const data = await renameCaptureAPI(captureId, fileName);
            
            // Update capture in both lists
            const updateCapture = (capture) => {
                if (capture._id === captureId) {
                    return data.capture;
                }
                return capture;
            };
            
            set({
                captures: get().captures.map(updateCapture),
                mostLikedCaptures: get().mostLikedCaptures.map(updateCapture)
            });
        } catch (error) {
            throw error;
        }
    },

    // Update capture description
    updateDescription: async (captureId, description) => {
        try {
            const data = await updateCaptureDescriptionAPI(captureId, description);
            
            // Update capture in both lists
            const updateCapture = (capture) => {
                if (capture._id === captureId) {
                    return data.capture;
                }
                return capture;
            };
            
            set({
                captures: get().captures.map(updateCapture),
                mostLikedCaptures: get().mostLikedCaptures.map(updateCapture)
            });
        } catch (error) {
            throw error;
        }
    },

    // Set filters
    setFilters: (filters) => {
        set({
            currentFilters: { ...get().currentFilters, ...filters }
        });
    },

    // Reset filters
    resetFilters: () => {
        set({
            currentFilters: {
                fileType: null,
                sortBy: "createdAt",
                order: "desc",
                limit: 50,
                skip: 0
            }
        });
    },

    // Clear all captures
    clearCaptures: () => {
        set({
            captures: [],
            mostLikedCaptures: [],
            totalCount: 0,
            hasMore: false
        });
    }
}));
