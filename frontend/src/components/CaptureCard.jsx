"use client";

import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCaptureStore } from "@/store/useCaptureStore";
import { useTripStore } from "@/store/useTripStore";
import { setAuthToken } from "@/lib/apiClient";
import { downloadCapture } from "@/lib/api/captures";
import { Button } from "@/components/ui/button";
import { 
    Heart, 
    Download, 
    Trash2, 
    Edit, 
    Video, 
    MoreVertical,
    Loader2 
} from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CaptureCard({ capture, tripId, onClick }) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { toggleLike, deleteCapture } = useCaptureStore();
    const { trips } = useTripStore();
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const trip = trips.find(t => t._id === tripId);
    const isUploader = capture.uploadedBy?._id === user?.id || capture.uploadedBy === user?.id;
    const isCreator = trip?.createdBy === user?.id;
    const canDelete = isUploader || isCreator;
    const isLiked = capture.likes?.some(like => like.userId === user?.id);

    const handleLikeClick = async (e) => {
        e.stopPropagation();
        if (isLiking) return;

        setIsLiking(true);
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
            }
            await toggleLike(capture._id);
        } catch (error) {
            console.error("Error toggling like:", error);
            toast.error("Failed to update like");
        } finally {
            setIsLiking(false);
        }
    };

    const handleDownload = async (e) => {
        e.stopPropagation();
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
            }
            const fileUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8747'}${capture.fileUrl}`;
            await downloadCapture(fileUrl, capture.originalFileName || capture.fileName);
            toast.success("Download started");
        } catch (error) {
            console.error("Error downloading capture:", error);
            toast.error("Failed to download capture");
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!canDelete) return;

        if (!confirm("Are you sure you want to delete this capture?")) {
            return;
        }

        setIsDeleting(true);
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
            }
            await deleteCapture(capture._id);
            toast.success("Capture deleted successfully");
        } catch (error) {
            console.error("Error deleting capture:", error);
            toast.error("Failed to delete capture");
        } finally {
            setIsDeleting(false);
        }
    };

    const imageUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8747'}${capture.fileUrl}`;
    const isVideo = capture.fileType === "video";

    return (
        <div 
            className="group relative bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={onClick}
        >
            {/* Media Preview */}
            <div className="relative aspect-square bg-muted">
                {isVideo ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <video
                            src={imageUrl}
                            className="w-full h-full object-cover"
                            muted
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="bg-black/60 rounded-full p-3">
                                <Video className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <img
                        src={imageUrl}
                        alt={capture.fileName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                        {/* Like Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLikeClick}
                            disabled={isLiking}
                            className={`gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm ${
                                isLiked ? "text-red-500" : "text-white"
                            }`}
                        >
                            <Heart 
                                className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                            />
                            <span className="text-xs font-medium">{capture.likeCount || 0}</span>
                        </Button>

                        {/* Actions Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleDownload}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </DropdownMenuItem>
                                {canDelete && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4 mr-2" />
                                            )}
                                            Delete
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="p-3">
                <p className="text-sm font-medium text-foreground truncate">
                    {capture.fileName}
                </p>
                {capture.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {capture.description}
                    </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{capture.uploadedBy?.name}</span>
                    <span>•</span>
                    <span>{new Date(capture.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}
