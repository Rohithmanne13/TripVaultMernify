"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTripStore } from "@/store/useTripStore";
import { setAuthToken } from "@/lib/apiClient";
import { joinTripByInvite } from "@/lib/api/trips";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";

const JoinTripDialog = ({ onTripJoined }) => {
    const { getToken } = useAuth();
    const { fetchTrips } = useTripStore();
    const [open, setOpen] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleJoinTrip = async (e) => {
        e.preventDefault();
        
        if (!inviteCode.trim()) {
            toast.error("Please enter an invite code");
            return;
        }

        setLoading(true);
        
        try {
            // Get fresh token
            const token = await getToken();
            if (token) {
                setAuthToken(token);
            }

            const response = await joinTripByInvite(inviteCode.trim().toUpperCase());
            
            if (response.success) {
                toast.success("Successfully joined the trip!");
                
                // Refresh trips list
                await fetchTrips();
                
                // Reset and close
                setInviteCode("");
                setOpen(false);
                
                // Callback
                if (onTripJoined) {
                    onTripJoined(response.trip);
                }
            }
        } catch (error) {
            console.error("Error joining trip:", error);
            toast.error(error.message || "Failed to join trip. Please check the invite code.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen) => {
        if (!loading) {
            setOpen(newOpen);
            if (!newOpen) {
                setInviteCode("");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Join Trip
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleJoinTrip}>
                    <DialogHeader>
                        <DialogTitle>Join a Trip</DialogTitle>
                        <DialogDescription>
                            Enter the invite code shared by your trip organizer to join the trip.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="inviteCode">
                                Invite Code <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="inviteCode"
                                placeholder="Enter 8-character invite code"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                disabled={loading}
                                maxLength={8}
                                className="uppercase font-mono text-lg tracking-wider text-center"
                                required
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground">
                                The invite code is case-insensitive and typically 8 characters long.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handleOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !inviteCode.trim()}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                "Join Trip"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default JoinTripDialog;
