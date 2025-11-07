"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Users, Edit } from "lucide-react";
import EditTripDialog from "@/components/EditTripDialog";

const TripCard = ({ trip }) => {
    const router = useRouter();
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "Admin":
                return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "Editor":
                return "bg-green-500/10 text-green-500 border-green-500/20";
            case "Viewer":
                return "bg-gray-500/10 text-gray-500 border-gray-500/20";
            default:
                return "bg-gray-500/10 text-gray-500 border-gray-500/20";
        }
    };

    const handleCardClick = () => {
        router.push(`/trip/${trip._id}/details`);
    };

    const handleEditClick = (e) => {
        e.stopPropagation(); // Prevent card click
        setEditDialogOpen(true);
    };

    const isAdmin = trip.userRole === "Admin";

    return (
        <>
            <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
                onClick={handleCardClick}
            >
                {/* Cover Image or Placeholder */}
                <div className="relative w-full h-40 overflow-hidden rounded-t-xl bg-linear-to-br from-blue-500 via-purple-500 to-pink-500">
                    {trip.coverImage ? (
                        <img 
                            src={trip.coverImage} 
                            alt={trip.tripName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-12 h-12 text-white/80" />
                        </div>
                    )}
                    
                    {/* Role Badge */}
                    <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border backdrop-blur-sm ${getRoleBadgeColor(trip.userRole)}`}>
                            {trip.userRole}
                        </span>
                    </div>

                    {/* Edit Button - Only for Admins */}
                    {isAdmin && (
                        <div className="absolute top-3 left-3">
                            <Button
                                size="icon-sm"
                                variant="secondary"
                                className="h-8 w-8 backdrop-blur-sm bg-white/90 hover:bg-white shadow-sm"
                                onClick={handleEditClick}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>

                <CardHeader className="pb-3">
                    <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                        {trip.tripName}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    {/* Destination */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-1">{trip.destination}</span>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-1">
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </span>
                    </div>

                    {/* Members Count */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4 shrink-0" />
                        <span>
                            {trip.members?.length || 0} {trip.members?.length === 1 ? "member" : "members"}
                        </span>
                    </div>
                </CardContent>

                <CardFooter className="pt-0">
                    {trip.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {trip.description}
                        </p>
                    )}
                </CardFooter>
            </Card>

            {/* Edit Dialog */}
            <EditTripDialog 
                trip={trip} 
                open={editDialogOpen} 
                onOpenChange={setEditDialogOpen}
            />
        </>
    );
};

export default TripCard;
