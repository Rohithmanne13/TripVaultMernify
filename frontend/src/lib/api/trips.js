import { apiClient } from "@/lib/apiClient";

// Helper function to handle API errors
const handleApiError = (error, defaultMessage) => {
    console.error(defaultMessage, error);
    const errorMessage = error.response?.data?.message || error.message || defaultMessage;
    throw new Error(errorMessage);
};

// Search user by email
export const searchUserByEmail = async (email) => {
    try {
        const response = await apiClient.get(`/api/trips/search-user?email=${encodeURIComponent(email)}`);
        return response.data;
    } catch (error) {
        handleApiError(error, "Error searching user");
    }
};

// Create a new trip
export const createTrip = async (tripData) => {
    try {
        const response = await apiClient.post("/api/trips", tripData);
        return response.data;
    } catch (error) {
        handleApiError(error, "Error creating trip");
    }
};

// Get all trips for the current user
export const getUserTrips = async () => {
    try {
        const response = await apiClient.get("/api/trips");
        return response.data;
    } catch (error) {
        handleApiError(error, "Error fetching trips");
    }
};

// Get a single trip by ID
export const getTripById = async (tripId) => {
    try {
        const response = await apiClient.get(`/api/trips/${tripId}`);
        return response.data;
    } catch (error) {
        handleApiError(error, "Error fetching trip");
    }
};

// Update a trip
export const updateTrip = async (tripId, updates) => {
    try {
        const response = await apiClient.put(`/api/trips/${tripId}`, updates);
        return response.data;
    } catch (error) {
        handleApiError(error, "Error updating trip");
    }
};

// Delete a trip
export const deleteTrip = async (tripId) => {
    try {
        const response = await apiClient.delete(`/api/trips/${tripId}`);
        return response.data;
    } catch (error) {
        handleApiError(error, "Error deleting trip");
    }
};

// Add member to trip by email
export const addMemberByEmail = async (tripId, email, role = "Viewer") => {
    try {
        const response = await apiClient.post(`/api/trips/${tripId}/members`, {
            email,
            role
        });
        return response.data;
    } catch (error) {
        handleApiError(error, "Error adding member");
    }
};

// Join trip using invite code
export const joinTripByInvite = async (inviteCode) => {
    try {
        const response = await apiClient.post(`/api/trips/join/${inviteCode}`);
        return response.data;
    } catch (error) {
        handleApiError(error, "Error joining trip");
    }
};

// Remove member from trip
export const removeMemberFromTrip = async (tripId, memberId) => {
    try {
        const response = await apiClient.delete(`/api/trips/${tripId}/members/${memberId}`);
        return response.data;
    } catch (error) {
        handleApiError(error, "Error removing member");
    }
};
