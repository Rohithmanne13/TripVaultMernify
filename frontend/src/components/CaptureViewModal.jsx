"use client";

import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCaptureStore } from "@/store/useCaptureStore";
import { useTripStore } from "@/store/useTripStore";
import { setAuthToken } from "@/lib/apiClient";
import { downloadCapture } from "@/lib/api/captures";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Heart,
    Download,
    Trash2,
    Edit2,
    Save,
    X,
    Video,
    Loader2,
    Calendar,
    User,
    FileText
} from "lucide-react";
import { toast } from "sonner";

export default function CaptureViewModal({ capture, tripId, open, onOpenChange }) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { toggleLike, deleteCapture, renameCapture, updateDescription } = useCaptureStore();
    const { trips } = useTripStore();
    
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [saving, setSaving] = useState(false);

    if (!capture) return null;

    const trip = trips.find(t => t._id === tripId);
    const isUploader = capture.uploadedBy?._id === user?.id || capture.uploadedBy === user?.id;
    const isCreator = trip?.createdBy === user?.id;
    const canDelete = isUploader || isCreator;
    const canRename = isUploader || isCreator;
    const canEditDescription = isUploader;
    const isLiked = capture.likes?.some(like => like.userId === user?.id);
    const isVideo = capture.fileType === "video";
    const imageUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8747'}${capture.fileUrl}`;

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);
        try {
            const token = await getToken();
            if (token) setAuthToken(token);
            await toggleLike(capture._id);
        } catch (error) {
            toast.error("Failed to update like");
        } finally {
            setIsLiking(false);
        }
    };

    const handleDownload = async () => {
        try {
            const token = await getToken();
            if (token) setAuthToken(token);
            await downloadCapture(imageUrl, capture.originalFileName || capture.fileName);
            toast.success("Download started");
        } catch (error) {
            toast.error("Failed to download");
        }
    };

    const handleDelete = async () => {
        if (!canDelete || !confirm("Are you sure you want to delete this capture?")) return;
        
        setIsDeleting(true);
        try {
            const token = await getToken();
            if (token) setAuthToken(token);
            await deleteCapture(capture._id);
            toast.success("Capture deleted");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to delete");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSaveName = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        try {
            const token = await getToken();
            if (token) setAuthToken(token);
            await renameCapture(capture._id, newName.trim());
            toast.success("Name updated");
            setEditingName(false);
        } catch (error) {
            toast.error("Failed to update name");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDescription = async () => {
        setSaving(true);
        try {
            const token = await getToken();
            if (token) setAuthToken(token);
            await updateDescription(capture._id, newDescription);
            toast.success("Description updated");
            setEditingDescription(false);
        } catch (error) {
            toast.error("Failed to update description");
        } finally {
            setSaving(false);
        }
    };

    const startEditingName = () => {
        setNewName(capture.fileName);
        setEditingName(true);
    };

    const startEditingDescription = () => {
        setNewDescription(capture.description || "");
        setEditingDescription(true);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                <div className="grid md:grid-cols-2 gap-0">
                    {/* Media Section */}
                    <div className="bg-black flex items-center justify-center min-h-96 md:min-h-full">
                        {isVideo ? (
                            <video
                                src={imageUrl}
                                controls
                                className="w-full h-full object-contain"
                                autoPlay
                            />
                        ) : (
                            <img
                                src={imageUrl}
                                alt={capture.fileName}
                                className="w-full h-full object-contain"
                            />
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="flex flex-col p-6">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="flex items-center justify-between">
                                <span className="text-lg font-semibold">Capture Details</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onOpenChange(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </DialogTitle>
                        </DialogHeader>

                        {/* Actions */}
                        <div className="flex gap-2 mb-6">
                            <Button
                                variant={isLiked ? "default" : "outline"}
                                onClick={handleLike}
                                disabled={isLiking}
                                className="flex-1 gap-2"
                            >
                                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                                {capture.likeCount || 0} Likes
                            </Button>
                            <Button variant="outline" onClick={handleDownload} className="gap-2">
                                <Download className="w-4 h-4" />
                                Download
                            </Button>
                            {canDelete && (
                                <Button
                                    variant="outline"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="text-destructive hover:text-destructive"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </Button>
                            )}
                        </div>

                        {/* File Name */}
                        <div className="mb-4">
                            <Label className="flex items-center justify-between mb-2">
                                <span>File Name</span>
                                {canRename && !editingName && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={startEditingName}
                                        className="h-auto p-1"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                    </Button>
                                )}
                            </Label>
                            {editingName ? (
                                <div className="flex gap-2">
                                    <Input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        disabled={saving}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleSaveName}
                                        disabled={saving || !newName.trim()}
                                    >
                                        <Save className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingName(false)}
                                        disabled={saving}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-sm text-foreground font-medium">{capture.fileName}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                            <Label className="flex items-center justify-between mb-2">
                                <span>Description</span>
                                {canEditDescription && !editingDescription && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={startEditingDescription}
                                        className="h-auto p-1"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                    </Button>
                                )}
                            </Label>
                            {editingDescription ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        disabled={saving}
                                        className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                        rows={3}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={handleSaveDescription}
                                            disabled={saving}
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditingDescription(false)}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {capture.description || "No description"}
                                </p>
                            )}
                        </div>

                        {/* Metadata */}
                        <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Uploaded by:</span>
                                <span className="font-medium">{capture.uploadedBy?.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Upload date:</span>
                                <span className="font-medium">
                                    {new Date(capture.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            {capture.captureDate && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Capture date:</span>
                                    <span className="font-medium">
                                        {new Date(capture.captureDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">File size:</span>
                                <span className="font-medium">
                                    {(capture.fileSize / 1024 / 1024).toFixed(2)} MB
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                {isVideo ? <Video className="w-4 h-4 text-muted-foreground" /> : null}
                                <span className="text-muted-foreground">Type:</span>
                                <span className="font-medium capitalize">{capture.fileType}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
