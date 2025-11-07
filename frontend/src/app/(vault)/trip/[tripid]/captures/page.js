"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useCaptureStore } from "@/store/useCaptureStore";
import { setAuthToken } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, Video, TrendingUp, Loader2 } from "lucide-react";
import UploadCaptureDialog from "@/components/UploadCaptureDialog";
import CapturesGrid from "@/components/CapturesGrid";
import CaptureFilters from "@/components/CaptureFilters";
import MostLikedSection from "@/components/MostLikedSection";
import { toast } from "sonner";

export default function CapturesPage() {
    const params = useParams();
    const tripId = params.tripid;
    const { getToken } = useAuth();
    
    console.log("CapturesPage - Full params:", params);
    console.log("CapturesPage - Extracted tripId:", tripId);
    
    const { 
        captures, 
        loading, 
        fetchCaptures, 
        fetchMostLikedCaptures,
        currentFilters,
        clearCaptures 
    } = useCaptureStore();

    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [showMostLiked, setShowMostLiked] = useState(false);

    useEffect(() => {
        const loadCaptures = async () => {
            if (!tripId || tripId === 'undefined') {
                console.error("Invalid tripId:", tripId);
                toast.error("Invalid trip ID");
                return;
            }

            try {
                const token = await getToken();
                if (token) {
                    setAuthToken(token);
                    console.log("Loading captures for tripId:", tripId);
                    await fetchCaptures(tripId);
                    await fetchMostLikedCaptures(tripId);
                }
            } catch (error) {
                console.error("Error loading captures:", error);
                toast.error("Failed to load captures");
            }
        };

        if (tripId) {
            loadCaptures();
        }

        return () => {
            clearCaptures();
        };
    }, [tripId, getToken]);

    const handleFilterChange = async (filters) => {
        if (!tripId || tripId === 'undefined') {
            console.error("Invalid tripId:", tripId);
            toast.error("Invalid trip ID");
            return;
        }

        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
                await fetchCaptures(tripId, { ...filters, skip: 0 });
            }
        } catch (error) {
            console.error("Error applying filters:", error);
            toast.error("Failed to apply filters");
        }
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card sticky top-0 z-10">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Captures</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Share and view trip photos and videos
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={showMostLiked ? "default" : "outline"}
                                onClick={() => setShowMostLiked(!showMostLiked)}
                                className="gap-2"
                            >
                                <TrendingUp className="w-4 h-4" />
                                Most Liked
                            </Button>
                            <Button
                                onClick={() => setUploadDialogOpen(true)}
                                className="gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Upload
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <CaptureFilters
                        currentFilters={currentFilters}
                        onFilterChange={handleFilterChange}
                    />

                    {/* Stats */}
                    <div className="flex gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ImageIcon className="w-4 h-4" />
                            <span>{captures.filter(c => c.fileType === "image").length} Photos</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Video className="w-4 h-4" />
                            <span>{captures.filter(c => c.fileType === "video").length} Videos</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>•</span>
                            <span>{captures.length} Total</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading && captures.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : showMostLiked ? (
                    <MostLikedSection tripId={tripId} />
                ) : captures.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Upload className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            No captures yet
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Start uploading photos and videos from your trip
                        </p>
                        <Button onClick={() => setUploadDialogOpen(true)}>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload First Capture
                        </Button>
                    </div>
                ) : (
                    <CapturesGrid tripId={tripId} />
                )}
            </div>

            {/* Upload Dialog */}
            <UploadCaptureDialog
                tripId={tripId}
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
            />
        </div>
    );
}