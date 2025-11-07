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
import { searchUserByEmail } from "@/lib/api/trips";
import { toast } from "sonner";
import { Plus, Loader2, X, UserPlus, Search } from "lucide-react";

const CreateTripDialog = ({ onTripCreated }) => {
    const { getToken } = useAuth();
    const { createTrip, loading } = useTripStore();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        tripName: "",
        destination: "",
        startDate: "",
        endDate: "",
        description: ""
    });
    const [members, setMembers] = useState([]);
    const [memberEmail, setMemberEmail] = useState("");
    const [memberRole, setMemberRole] = useState("Viewer");
    const [searchingUser, setSearchingUser] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddMember = async () => {
        if (!memberEmail.trim()) {
            toast.error("Please enter an email address");
            return;
        }

        // Check if member already added
        if (members.some(m => m.email === memberEmail.toLowerCase())) {
            toast.error("This member is already added");
            return;
        }

        setSearchingUser(true);
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
            }

            const response = await searchUserByEmail(memberEmail);
            
            if (response.success && response.user) {
                setMembers(prev => [...prev, {
                    userId: response.user._id,
                    email: response.user.email,
                    firstName: response.user.firstName,
                    lastName: response.user.lastName,
                    imageUrl: response.user.imageUrl,
                    role: memberRole
                }]);
                setMemberEmail("");
                setMemberRole("Viewer");
                toast.success(`${response.user.email} added as ${memberRole}`);
            }
        } catch (error) {
            console.error("Error searching user:", error);
            toast.error(error.message || "User not found with this email");
        } finally {
            setSearchingUser(false);
        }
    };

    const handleRemoveMember = (email) => {
        setMembers(prev => prev.filter(m => m.email !== email));
        toast.success("Member removed");
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

            // Prepare trip data with members
            const tripData = {
                ...formData,
                members: members.map(m => ({
                    userId: m.userId,
                    role: m.role
                }))
            };

            await createTrip(tripData);
            
            toast.success("Trip created successfully!");
            
            // Reset form and members
            setFormData({
                tripName: "",
                destination: "",
                startDate: "",
                endDate: "",
                description: ""
            });
            setMembers([]);
            setMemberEmail("");
            setMemberRole("Viewer");
            
            // Close dialog
            setOpen(false);
            
            // Callback (if needed for additional actions)
            if (onTripCreated) {
                onTripCreated();
            }
        } catch (error) {
            console.error("Error creating trip:", error);
            toast.error(error.message || "Failed to create trip. Please try again.");
        }
    };

    const handleOpenChange = (newOpen) => {
        if (!loading) {
            setOpen(newOpen);
            // Reset form when dialog closes
            if (!newOpen) {
                setFormData({
                    tripName: "",
                    destination: "",
                    startDate: "",
                    endDate: "",
                    description: ""
                });
                setMembers([]);
                setMemberEmail("");
                setMemberRole("Viewer");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    Create New Trip
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Trip</DialogTitle>
                        <DialogDescription>
                            Fill in the details to create a new trip. You&apos;ll be added as an admin automatically.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        {/* Trip Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="tripName">
                                Trip Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="tripName"
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
                            <Label htmlFor="destination">
                                Destination <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="destination"
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
                                <Label htmlFor="startDate">
                                    Start Date <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="endDate">
                                    End Date <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="endDate"
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
                            <Label htmlFor="description">Description (Optional)</Label>
                            <textarea
                                id="description"
                                name="description"
                                placeholder="Add any additional details about the trip..."
                                value={formData.description}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
                                rows={3}
                            />
                        </div>

                        {/* Add Members Section */}
                        <div className="grid gap-3 border-t pt-4">
                            <Label className="text-base font-semibold">Add Members (Optional)</Label>
                            
                            {/* Add Member Form */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Enter member email"
                                        value={memberEmail}
                                        onChange={(e) => setMemberEmail(e.target.value)}
                                        disabled={loading || searchingUser}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddMember();
                                            }
                                        }}
                                    />
                                </div>
                                <select
                                    value={memberRole}
                                    onChange={(e) => setMemberRole(e.target.value)}
                                    disabled={loading || searchingUser}
                                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Editor">Editor</option>
                                    <option value="Viewer">Viewer</option>
                                </select>
                                <Button
                                    type="button"
                                    size="icon"
                                    onClick={handleAddMember}
                                    disabled={loading || searchingUser || !memberEmail.trim()}
                                >
                                    {searchingUser ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <UserPlus className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>

                            {/* Members List */}
                            {members.length > 0 && (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {members.map((member) => (
                                        <div
                                            key={member.email}
                                            className="flex items-center justify-between p-2 bg-muted rounded-md"
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {member.imageUrl ? (
                                                    <img
                                                        src={member.imageUrl}
                                                        alt={member.firstName}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-xs font-medium">
                                                            {member.firstName?.[0] || member.email[0].toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {member.firstName && member.lastName
                                                            ? `${member.firstName} ${member.lastName}`
                                                            : member.email}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs px-2 py-1 rounded-full bg-background border">
                                                    {member.role}
                                                </span>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6"
                                                    onClick={() => handleRemoveMember(member.email)}
                                                    disabled={loading}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
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
                            onClick={() => handleOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Trip"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTripDialog;
