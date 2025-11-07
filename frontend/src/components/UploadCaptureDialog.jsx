"use client";

import { useState, useRef } from "react";
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
import { useCaptureStore } from "@/store/useCaptureStore";
import { setAuthToken } from "@/lib/apiClient";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, Video, Loader2 } from "lucide-react";

export default function UploadCaptureDialog({ tripId, open, onOpenChange }) {
    const { getToken } = useAuth();
    const { uploadCapture, uploading } = useCaptureStore();
    const fileInputRef = useRef(null);
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [description, setDescription] = useState("");
    const [captureDate, setCaptureDate] = useState("");

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 
                           'video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
        
        if (!validTypes.includes(file.type)) {
            toast.error("Please select a valid image or video file");
            return;
        }

        // Validate file size (100MB)
        if (file.size > 100 * 1024 * 1024) {
            toast.error("File size must be less than 100MB");
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            toast.error("Please select a file to upload");
            return;
        }

        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
            }

            await uploadCapture(tripId, selectedFile, description, captureDate || null);

            toast.success("Capture uploaded successfully!");
            
            // Reset form
            setSelectedFile(null);
            setPreview(null);
            setDescription("");
            setCaptureDate("");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            
            onOpenChange(false);
        } catch (error) {
            console.error("Error uploading capture:", error);
            toast.error(error.message || "Failed to upload capture");
        }
    };

    const handleClose = () => {
        if (!uploading) {
            handleRemoveFile();
            setDescription("");
            setCaptureDate("");
            onOpenChange(false);
        }
    };

    const isVideo = selectedFile?.type.startsWith('video/');

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Upload Capture</DialogTitle>
                        <DialogDescription>
                            Share photos and videos from your trip
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* File Upload Area */}
                        <div className="grid gap-2">
                            <Label>File</Label>
                            {!selectedFile ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                                >
                                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Images: JPG, PNG, GIF, WEBP • Videos: MP4, MOV, AVI, MKV, WEBM
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Maximum file size: 100MB
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>
                            ) : (
                                <div className="relative border border-border rounded-lg overflow-hidden">
                                    {/* Preview */}
                                    <div className="aspect-video bg-muted flex items-center justify-center">
                                        {isVideo ? (
                                            <video
                                                src={preview}
                                                controls
                                                className="max-h-full max-w-full"
                                            />
                                        ) : (
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        )}
                                    </div>
                                    
                                    {/* File Info */}
                                    <div className="p-3 bg-card border-t border-border flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {isVideo ? (
                                                <Video className="w-4 h-4 text-primary" />
                                            ) : (
                                                <ImageIcon className="w-4 h-4 text-primary" />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-foreground truncate max-w-xs">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleRemoveFile}
                                            disabled={uploading}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <textarea
                                id="description"
                                placeholder="Add a description for this capture..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={uploading}
                                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
                                rows={3}
                            />
                        </div>

                        {/* Capture Date */}
                        <div className="grid gap-2">
                            <Label htmlFor="captureDate">Capture Date (Optional)</Label>
                            <Input
                                id="captureDate"
                                type="date"
                                value={captureDate}
                                onChange={(e) => setCaptureDate(e.target.value)}
                                disabled={uploading}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={uploading || !selectedFile}>
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
