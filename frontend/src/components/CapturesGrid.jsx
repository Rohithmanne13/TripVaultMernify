"use client";

import { useState } from "react";
import { useCaptureStore } from "@/store/useCaptureStore";
import CaptureCard from "@/components/CaptureCard";
import CaptureViewModal from "@/components/CaptureViewModal";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { setAuthToken } from "@/lib/apiClient";
import { toast } from "sonner";

export default function CapturesGrid({ tripId }) {
    const { getToken } = useAuth();
    const { captures, hasMore, loading, currentFilters, fetchCaptures } = useCaptureStore();
    const [selectedCapture, setSelectedCapture] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);

    const handleCaptureClick = (capture) => {
        setSelectedCapture(capture);
        setViewModalOpen(true);
    };

    const handleLoadMore = async () => {
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
                await fetchCaptures(tripId, {
                    ...currentFilters,
                    skip: captures.length
                });
            }
        } catch (error) {
            console.error("Error loading more captures:", error);
            toast.error("Failed to load more captures");
        }
    };

    return (
        <>
            {/* Masonry Grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {captures.map((capture) => (
                    <div key={capture._id} className="break-inside-avoid">
                        <CaptureCard
                            capture={capture}
                            tripId={tripId}
                            onClick={() => handleCaptureClick(capture)}
                        />
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="flex justify-center mt-8">
                    <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Load More"
                        )}
                    </Button>
                </div>
            )}

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
