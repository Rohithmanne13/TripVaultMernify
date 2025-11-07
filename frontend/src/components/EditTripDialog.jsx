"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTripStore } from "@/store/useTripStore";
import { setAuthToken } from "@/lib/apiClient";
import { searchUserByEmail, addMemberByEmail, removeMemberFromTrip } from "@/lib/api/trips";
import { toast } from "sonner";
import { Loader2, X, UserPlus, Copy, Check } from "lucide-react";

const EditTripDialog = ({ trip, open, onOpenChange }) => {
    const { getToken } = useAuth();
    const { updateTrip, loading } = useTripStore();
    const [formData, setFormData] = useState({
        tripName: "",
        destination: "",
        startDate: "",
        endDate: "",
        description: ""
    });

    // Member management state
    const [members, setMembers] = useState([]);
    const [memberEmail, setMemberEmail] = useState("");
    const [memberRole, setMemberRole] = useState("Viewer");
    const [searchingUser, setSearchingUser] = useState(false);
    const [removingMember, setRemovingMember] = useState(null);
    const [copied, setCopied] = useState(false);

    // Initialize form with trip data when trip changes
    useEffect(() => {
        if (trip) {
            setFormData({
                tripName: trip.tripName || "",
                destination: trip.destination || "",
                startDate: trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : "",
                endDate: trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : "",
                description: trip.description || ""
            });
            setMembers(trip.members || []);
        }
    }, [trip]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.tripName.trim()) {
            toast.error("Trip name is required");
            return false;
        }
        if (!formData.destination.trim()) {
            toast.error("Destination is required");
            return false;
        }
        if (!formData.startDate) {
            toast.error("Start date is required");
            return false;
        }
        if (!formData.endDate) {
            toast.error("End date is required");
            return false;
        }
        
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        
        if (end < start) {
            toast.error("End date must be after start date");
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            // Get fresh token
            const token = await getToken();
            if (token) {
                setAuthToken(token);
            }

            await updateTrip(trip._id, formData);
            
            toast.success("Trip updated successfully!");
            
            // Close dialog
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating trip:", error);
            toast.error(error.message || "Failed to update trip. Please try again.");
        }
    };

    const handleAddMember = async () => {
        if (!memberEmail.trim()) {
            toast.error("Please enter an email address");
            return;
        }

        // Check if member already added
        if (members.some(m => m.userId?.email === memberEmail)) {
            toast.error("This member is already added");
            return;
        }

        setSearchingUser(true);
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
            }

            // Search for user by email
            const user = await searchUserByEmail(memberEmail);
            
            if (!user) {
                toast.error("User not found with this email");
                return;
            }

            // Add member to the trip on backend
            await addMemberByEmail(trip._id, memberEmail, memberRole);

            // Update local members list
            const newMember = {
                userId: user,
                role: memberRole,
                joinedAt: new Date()
            };
            setMembers([...members, newMember]);

            toast.success(`${user.name} added as ${memberRole}`);
            setMemberEmail("");
            setMemberRole("Viewer");
        } catch (error) {
            console.error("Error adding member:", error);
            toast.error(error.message || "Failed to add member");
        } finally {
            setSearchingUser(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!memberId) return;

        // Check if trying to remove the creator
        const memberToRemove = members.find(m => m.userId?._id === memberId);
        if (memberToRemove?.role === "Admin" && trip.createdBy === memberId) {
            toast.error("Cannot remove the trip creator");
            return;
        }

        setRemovingMember(memberId);
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
            }

            await removeMemberFromTrip(trip._id, memberId);

            // Update local members list
            setMembers(members.filter(m => m.userId?._id !== memberId));

            toast.success("Member removed successfully");
        } catch (error) {
            console.error("Error removing member:", error);
            toast.error(error.message || "Failed to remove member");
        } finally {
            setRemovingMember(null);
        }
    };

    const handleCopyInviteCode = () => {
        if (trip?.inviteCode) {
            navigator.clipboard.writeText(trip.inviteCode);
            setCopied(true);
            toast.success("Invite code copied!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onOpenChange(false);
        }
    };

    if (!trip) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Trip Details</DialogTitle>
                        <DialogDescription>
                            Update your trip information and manage members. Only admins can edit trips.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-6 py-4">
                        {/* Trip Details Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground">Trip Information</h3>
                            
                            {/* Trip Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="edit-tripName">
                                    Trip Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-tripName"
                                    name="tripName"
                                    placeholder="e.g., Summer Vacation 2025"
                                    value={formData.tripName}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            {/* Destination */}
                            <div className="grid gap-2">
                                <Label htmlFor="edit-destination">
                                    Destination <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-destination"
                                    name="destination"
                                    placeholder="e.g., Paris, France"
                                    value={formData.destination}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-startDate">
                                        Start Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="edit-startDate"
                                        name="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-endDate">
                                        End Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="edit-endDate"
                                        name="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        min={formData.startDate}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description (Optional)</Label>
                                <textarea
                                    id="edit-description"
                                    name="description"
                                    placeholder="Add any additional details about the trip..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Invite Code Section */}
                        <div className="space-y-3 pt-4 border-t">
                            <h3 className="text-sm font-semibold text-foreground">Invite Code</h3>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={trip?.inviteCode || ""}
                                    readOnly
                                    className="font-mono text-center text-lg tracking-wider"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopyInviteCode}
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Share this code with others to let them join your trip
                            </p>
                        </div>

                        {/* Member Management Section */}
                        <div className="space-y-3 pt-4 border-t">
                            <h3 className="text-sm font-semibold text-foreground">Manage Members</h3>
                            
                            {/* Add Member Form */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        type="email"
                                        placeholder="Enter email address"
                                        value={memberEmail}
                                        onChange={(e) => setMemberEmail(e.target.value)}
                                        disabled={searchingUser}
                                    />
                                </div>
                                <select
                                    value={memberRole}
                                    onChange={(e) => setMemberRole(e.target.value)}
                                    disabled={searchingUser}
                                    className="px-3 py-2 rounded-md border border-input bg-transparent text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="Viewer">Viewer</option>
                                    <option value="Editor">Editor</option>
                                    <option value="Admin">Admin</option>
                                </select>
                                <Button
                                    type="button"
                                    onClick={handleAddMember}
                                    disabled={searchingUser}
                                    size="icon"
                                >
                                    {searchingUser ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <UserPlus className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {/* Members List */}
                            {members.length > 0 && (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {members.map((member) => (
                                        <div
                                            key={member.userId?._id || member.userId}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                                    {member.userId?.name?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {member.userId?.name || "Unknown User"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {member.userId?.email || ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                                                    {member.role}
                                                </span>
                                                {trip.createdBy !== member.userId?._id && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveMember(member.userId?._id)}
                                                        disabled={removingMember === member.userId?._id}
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        {removingMember === member.userId?._id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <X className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Trip"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditTripDialog;
