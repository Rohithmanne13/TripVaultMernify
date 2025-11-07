"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useTripStore } from "@/store/useTripStore";
import { setAuthToken } from "@/lib/apiClient";
import TripCard from "@/components/TripCard";
import CreateTripDialog from "@/components/CreateTripDialog";
import JoinTripDialog from "@/components/JoinTripDialog";
import { toast } from "sonner";
import { Loader2, Luggage } from "lucide-react";

export default function ConsolePage() {
  const { getToken } = useAuth();
  const { trips, loading, error, fetchTrips, clearError } = useTripStore();

  useEffect(() => {
    const initializeTrips = async () => {
      try {
        // Get Clerk authentication token
        const token = await getToken();
        if (token) {
          // Set token for all API requests
          setAuthToken(token);
          // Fetch trips
          await fetchTrips();
        }
      } catch (err) {
        console.error("Error initializing trips:", err);
        toast.error("Failed to load trips. Please try again.");
      }
    };

    initializeTrips();
  }, [getToken, fetchTrips]);

  const handleTripCreated = () => {
    // Trip will be automatically added to store by the createTrip action
    // No need to manually refresh
  };

  const handleTripJoined = () => {
    // Trips already refreshed in JoinTripDialog
  };

  const handleRetry = async () => {
    clearError();
    try {
      const token = await getToken();
      if (token) {
        setAuthToken(token);
        await fetchTrips();
      }
    } catch (err) {
      toast.error("Failed to load trips. Please try again.");
    }
  };

  // Loading State
  if (loading && trips.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your trips...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State (only show if no trips loaded)
  if (error && trips.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
            <p className="text-muted-foreground mt-2">
              Manage and view all your trips in one place
            </p>
          </div>
          <CreateTripDialog onTripCreated={handleTripCreated} />
        </div>
        
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Trips</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
          <p className="text-muted-foreground mt-2">
            {trips.length === 0
              ? "Create your first trip to get started"
              : `You have ${trips.length} ${trips.length === 1 ? "trip" : "trips"}`}
          </p>
        </div>
        <div className="flex gap-3">
          <JoinTripDialog onTripJoined={handleTripJoined} />
          <CreateTripDialog onTripCreated={handleTripCreated} />
        </div>
      </div>

      {/* Trips Grid */}
      {trips.length === 0 ? (
        // Empty State
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Luggage className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">No trips yet</h3>
            <p className="text-muted-foreground mb-6">
              Start planning your next adventure by creating your first trip. 
              You can add destinations, dates, members, and manage everything in one place.
            </p>
            <CreateTripDialog onTripCreated={handleTripCreated} />
          </div>
        </div>
      ) : (
        // Trips Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip._id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}

