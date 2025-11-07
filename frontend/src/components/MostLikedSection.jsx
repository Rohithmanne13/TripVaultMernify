"use client";

import { useState, useEffect } from "react";
import { useCaptureStore } from "@/store/useCaptureStore";
import CaptureCard from "@/components/CaptureCard";
import CaptureViewModal from "@/components/CaptureViewModal";
import { Trophy, Loader2 } from "lucide-react";

export default function MostLikedSection({ tripId }) {
    const { mostLikedCaptures, fetchMostLikedCaptures } = useCaptureStore();
    const [loading, setLoading] = useState(true);
    const [selectedCapture, setSelectedCapture] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);

    useEffect(() => {
        const loadMostLiked = async () => {
            try {
                setLoading(true);
                await fetchMostLikedCaptures(tripId, 20);
            } catch (error) {
                console.error("Error loading most liked captures:", error);
            } finally {
                setLoading(false);
            }
        };

        loadMostLiked();
    }, [tripId]);

    const handleCaptureClick = (capture) => {
        setSelectedCapture(capture);
        setViewModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (mostLikedCaptures.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    No liked captures yet
                </h3>
                <p className="text-sm text-muted-foreground">
                    Start liking captures to see them featured here
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">Most Liked Captures</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    The most popular captures from this trip
                </p>
            </div>

            {/* Masonry Grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {mostLikedCaptures.map((capture) => (
                    <div key={capture._id} className="break-inside-avoid">
                        <CaptureCard
                            capture={capture}
                            tripId={tripId}
                            onClick={() => handleCaptureClick(capture)}
                        />
                    </div>
                ))}
            </div>

            {/* View Modal */}
            <CaptureViewModal
                capture={selectedCapture}
                tripId={tripId}
                open={viewModalOpen}
                onOpenChange={setViewModalOpen}
            />
        </>
    );
}
