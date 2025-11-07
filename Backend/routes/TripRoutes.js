import { Router } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import {
    createTrip,
    getUserTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    addMemberByEmail,
    joinTripByInvite,
    searchUserByEmail,
    removeMemberFromTrip
} from "../controllers/TripController.js";

const tripRoutes = Router();

// All routes are protected with Clerk authentication
tripRoutes.get("/search-user", ClerkExpressRequireAuth(), searchUserByEmail);
tripRoutes.post("/", ClerkExpressRequireAuth(), createTrip);
tripRoutes.get("/", ClerkExpressRequireAuth(), getUserTrips);
tripRoutes.get("/:tripId", ClerkExpressRequireAuth(), getTripById);
tripRoutes.put("/:tripId", ClerkExpressRequireAuth(), updateTrip);
tripRoutes.delete("/:tripId", ClerkExpressRequireAuth(), deleteTrip);
tripRoutes.post("/:tripId/members", ClerkExpressRequireAuth(), addMemberByEmail);
tripRoutes.delete("/:tripId/members/:memberId", ClerkExpressRequireAuth(), removeMemberFromTrip);
tripRoutes.post("/join/:inviteCode", ClerkExpressRequireAuth(), joinTripByInvite);

export default tripRoutes;
