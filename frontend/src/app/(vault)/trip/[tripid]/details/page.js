"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useTripStore } from "@/store/useTripStore";
import { useProposalStore } from "@/store/useProposalStore";
import { setAuthToken } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    MapPin, 
    CalendarDays, 
    Users, 
    IndianRupee, 
    Loader2,
    Lightbulb,
    BarChart3,
    Filter
} from "lucide-react";
import CreateProposalDialog from "@/components/CreateProposalDialog";
import ProposalCard from "@/components/ProposalCard";
import { toast } from "sonner";

export default function DetailsPage() {
    const { tripid } = useParams();
    const { getToken } = useAuth();
    const { user } = useUser();
    const { currentTrip, fetchTripById } = useTripStore();
    const { 
        proposals, 
        loading: proposalsLoading, 
        fetchProposals, 
        currentFilter, 
        setFilter,
        clearProposals 
    } = useProposalStore();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();

        return () => {
            clearProposals();
        };
    }, [tripid]);

    const loadData = async () => {
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
                await Promise.all([
                    fetchTripById(tripid),
                    fetchProposals(tripid)
                ]);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Failed to load trip details");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = async (type) => {
        const newFilter = currentFilter === type ? null : type;
        setFilter(newFilter);
        
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
                await fetchProposals(tripid, newFilter);
            }
        } catch (error) {
            console.error("Error filtering proposals:", error);
            toast.error("Failed to filter posts");
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
        }).format(amount);
    };

    const getDateRange = () => {
        if (!currentTrip) return "";
        const start = formatDate(currentTrip.startDate);
        const end = formatDate(currentTrip.endDate);
        return `${start} - ${end}`;
    };

    const getDuration = () => {
        if (!currentTrip) return 0;
        const start = new Date(currentTrip.startDate);
        const end = new Date(currentTrip.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1;
    };

    const filterCounts = {
        all: proposals.length,
        proposal: proposals.filter(p => p.type === "proposal").length,
        poll: proposals.filter(p => p.type === "poll").length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!currentTrip) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Trip not found</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Trip Header */}
            <div className="space-y-4">
                {/* Trip Title and Basic Info */}
                <div>
                    <h1 className="text-4xl font-bold mb-2">{currentTrip.tripName}</h1>
                    {currentTrip.description && (
                        <p className="text-lg text-muted-foreground">
                            {currentTrip.description}
                        </p>
                    )}
                </div>

                {/* Trip Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Destination */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Destination
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{currentTrip.destination}</p>
                        </CardContent>
                    </Card>

                    {/* Duration */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" />
                                Duration
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{getDuration()} Days</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {getDateRange()}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Members */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Members
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {currentTrip.members?.length || 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Traveling together
                            </p>
                        </CardContent>
                    </Card>

                    {/* Budget */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <IndianRupee className="w-4 h-4" />
                                Budget
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {formatCurrency(currentTrip.budget?.total || 0)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {currentTrip.budget?.currency || "INR"}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Members List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Trip Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {currentTrip.members?.map((member) => (
                                <div key={member.userId._id || member.userId} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                    {member.userId.imageUrl ? (
                                        <img
                                            src={member.userId.imageUrl}
                                            alt={member.userId.firstName}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-sm font-medium">
                                                {member.userId.firstName?.[0] || "U"}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                            {member.userId.firstName} {member.userId.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {member.userId.email}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full border ${
                                        member.role === "Admin" 
                                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
                                            : member.role === "Editor"
                                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                                            : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                                    }`}>
                                        {member.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Proposals & Polls Board */}
            <div className="space-y-4">
                {/* Sticky Header Section */}
                <div className="sticky top-0 z-10 bg-background pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Proposals & Polls</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Share proposals and create polls for the trip
                            </p>
                        </div>
                        <CreateProposalDialog tripId={tripid} />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={currentFilter === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFilterChange(null)}
                            className="gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            All Posts ({filterCounts.all})
                        </Button>
                        <Button
                            variant={currentFilter === "proposal" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFilterChange("proposal")}
                            className="gap-2"
                        >
                            <Lightbulb className="w-4 h-4" />
                            Proposals ({filterCounts.proposal})
                        </Button>
                        <Button
                            variant={currentFilter === "poll" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFilterChange("poll")}
                            className="gap-2"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Polls ({filterCounts.poll})
                        </Button>
                    </div>
                </div>

                {/* Proposals List */}
                {proposalsLoading && proposals.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : proposals.length === 0 ? (
                    <Card className="p-12">
                        <div className="text-center">
                            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Be the first to share a proposal or create a poll!
                            </p>
                            <CreateProposalDialog tripId={tripid} />
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {proposals.map((proposal) => (
                            <ProposalCard
                                key={proposal._id}
                                proposal={proposal}
                                tripCreatorId={currentTrip.createdBy._id || currentTrip.createdBy}
                                currentUserId={user?.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
