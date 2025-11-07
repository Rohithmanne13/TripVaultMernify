import { create } from "zustand";
import { getUserTrips, createTrip as createTripAPI, getTripById, updateTrip as updateTripAPI, deleteTrip as deleteTripAPI } from "@/lib/api/trips";

export const useTripStore = create((set, get) => ({
    // State
    trips: [],
    currentTrip: null,
    loading: false,
    error: null,

    // Actions
    setTrips: (trips) => set({ trips }),
    
    setCurrentTrip: (trip) => set({ currentTrip: trip }),
    
    setLoading: (loading) => set({ loading }),
    
    setError: (error) => set({ error }),

    // Fetch all user trips
    fetchTrips: async () => {
        set({ loading: true, error: null });
        try {
            const response = await getUserTrips();
            if (response.success) {
                set({ trips: response.trips || [], loading: false });
                return response.trips;
            }
        } catch (error) {
            console.error("Error fetching trips:", error);
            set({ 
                error: error.message || "Failed to load trips", 
                loading: false 
            });
            throw error;
        }
    },

    // Create a new trip
    createTrip: async (tripData) => {
        set({ loading: true, error: null });
        try {
            const response = await createTripAPI(tripData);
            if (response.success) {
                // Add new trip to the beginning of the list
                set((state) => ({ 
                    trips: [response.trip, ...state.trips],
                    loading: false 
                }));
                return response.trip;
            }
        } catch (error) {
            console.error("Error creating trip:", error);
            set({ 
                error: error.message || "Failed to create trip", 
                loading: false 
            });
            throw error;
        }
    },

    // Fetch single trip by ID
    fetchTripById: async (tripId) => {
        set({ loading: true, error: null });
        try {
            const response = await getTripById(tripId);
            if (response.success) {
                set({ currentTrip: response.trip, loading: false });
                return response.trip;
            }
        } catch (error) {
            console.error("Error fetching trip:", error);
            set({ 
                error: error.message || "Failed to load trip", 
                loading: false 
            });
            throw error;
        }
    },

    // Update a trip
    updateTrip: async (tripId, updates) => {
        set({ loading: true, error: null });
        try {
            const response = await updateTripAPI(tripId, updates);
            if (response.success) {
                // Update trip in the list
                set((state) => ({
                    trips: state.trips.map(trip => 
                        trip._id === tripId ? response.trip : trip
                    ),
                    currentTrip: state.currentTrip?._id === tripId ? response.trip : state.currentTrip,
                    loading: false
                }));
                return response.trip;
            }
        } catch (error) {
            console.error("Error updating trip:", error);
            set({ 
                error: error.message || "Failed to update trip", 
                loading: false 
            });
            throw error;
        }
    },

    // Delete a trip
    deleteTrip: async (tripId) => {
        set({ loading: true, error: null });
        try {
            const response = await deleteTripAPI(tripId);
            if (response.success) {
                // Remove trip from the list
                set((state) => ({
                    trips: state.trips.filter(trip => trip._id !== tripId),
                    currentTrip: state.currentTrip?._id === tripId ? null : state.currentTrip,
                    loading: false
                }));
                return true;
            }
        } catch (error) {
            console.error("Error deleting trip:", error);
            set({ 
                error: error.message || "Failed to delete trip", 
                loading: false 
            });
            throw error;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Reset store
    reset: () => set({ 
        trips: [], 
        currentTrip: null, 
        loading: false, 
        error: null 
    }),
}));
