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
import { useProposalStore } from "@/store/useProposalStore";
import { setAuthToken } from "@/lib/apiClient";
import { toast } from "sonner";
import { Loader2, X, Link as LinkIcon, Plus, ImagePlus } from "lucide-react";

const EditProposalDialog = ({ proposal, open, onOpenChange }) => {
    const { getToken } = useAuth();
    const { updateProposal, removeImage } = useProposalStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        pollEndsAt: "",
        allowMultipleVotes: false,
        isPollActive: true
    });
    const [links, setLinks] = useState([]);
    const [currentLink, setCurrentLink] = useState({ title: "", url: "" });
    const [pollOptions, setPollOptions] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [removingImages, setRemovingImages] = useState([]);

    useEffect(() => {
        if (proposal && open) {
            setFormData({
                title: proposal.title || "",
                description: proposal.description || "",
                pollEndsAt: proposal.pollEndsAt 
                    ? new Date(proposal.pollEndsAt).toISOString().slice(0, 16)
                    : "",
                allowMultipleVotes: proposal.allowMultipleVotes || false,
                isPollActive: proposal.isPollActive !== undefined ? proposal.isPollActive : true
            });
            setLinks(proposal.links || []);
            setPollOptions(
                proposal.pollOptions?.map(opt => ({
                    _id: opt._id,
                    optionText: opt.optionText,
                    voteCount: opt.voteCount
                })) || []
            );
            setNewImages([]);
            setNewImagePreviews([]);
            setRemovingImages([]);
        }
    }, [proposal, open]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddLink = () => {
        if (!currentLink.title.trim() || !currentLink.url.trim()) {
            toast.error("Please provide both title and URL");
            return;
        }

        setLinks(prev => [...prev, { ...currentLink }]);
        setCurrentLink({ title: "", url: "" });
        toast.success("Link added");
    };

    const handleRemoveLink = (index) => {
        setLinks(prev => prev.filter((_, i) => i !== index));
    };

    const handlePollOptionChange = (index, value) => {
        setPollOptions(prev => prev.map((opt, i) => 
            i === index ? { ...opt, optionText: value } : opt
        ));
    };

    const handleAddPollOption = () => {
        setPollOptions(prev => [...prev, { optionText: "", voteCount: 0 }]);
    };

    const handleRemovePollOption = (index) => {
        const option = pollOptions[index];
        if (option.voteCount > 0) {
            if (!confirm("This option has votes. Are you sure you want to remove it?")) {
                return;
            }
        }
        if (pollOptions.length > 2) {
            setPollOptions(prev => prev.filter((_, i) => i !== index));
        } else {
            toast.error("Poll must have at least 2 options");
        }
    };

    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        
        const currentTotal = (proposal.images?.length || 0) - removingImages.length + newImages.length;
        if (currentTotal + files.length > 5) {
            toast.error("Maximum 5 images allowed");
            return;
        }

        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image`);
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} is too large (max 10MB)`);
                return false;
            }
            return true;
        });

        setNewImages(prev => [...prev, ...validFiles]);

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = async (imageId) => {
        setRemovingImages(prev => [...prev, imageId]);
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
            }

            await removeImage(proposal._id, imageId);
            toast.success("Image removed");
        } catch (error) {
            console.error("Error removing image:", error);
            toast.error(error.message || "Failed to remove image");
            setRemovingImages(prev => prev.filter(id => id !== imageId));
        }
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            toast.error("Title is required");
            return false;
        }
        if (!formData.description.trim()) {
            toast.error("Description is required");
            return false;
        }
        if (proposal.type === "poll") {
            const validOptions = pollOptions.filter(opt => opt.optionText.trim());
            if (validOptions.length < 2) {
                toast.error("Poll must have at least 2 options");
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
            }

            const updateData = {
                title: formData.title,
                description: formData.description,
                links
            };

            if (proposal.type === "poll") {
                updateData.pollOptions = pollOptions.map(opt => ({
                    _id: opt._id,
                    optionText: opt.optionText
                }));
                updateData.allowMultipleVotes = formData.allowMultipleVotes;
                updateData.pollEndsAt = formData.pollEndsAt || null;
                updateData.isPollActive = formData.isPollActive;
            }

            await updateProposal(proposal._id, updateData, newImages);
            
            toast.success("Post updated successfully!");
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating proposal:", error);
            toast.error(error.message || "Failed to update post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Post</DialogTitle>
                        <DialogDescription>
                            Make changes to your {proposal?.type}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="mt-4 space-y-4">
                        {/* Title */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                disabled={loading}
                                maxLength={200}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">
                                Description <span className="text-red-500">*</span>
                            </Label>
                            <textarea
                                id="edit-description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                rows={4}
                                required
                            />
                        </div>

                        {/* Poll Options - Only for poll type */}
                        {proposal?.type === "poll" && (
                            <div className="grid gap-3 border rounded-lg p-4 bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold">Poll Options</Label>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={handleAddPollOption}
                                        disabled={loading || pollOptions.length >= 10}
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Option
                                    </Button>
                                </div>
                                
                                <div className="space-y-2">
                                    {pollOptions.map((option, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <Input
                                                placeholder={`Option ${index + 1}`}
                                                value={option.optionText}
                                                onChange={(e) => handlePollOptionChange(index, e.target.value)}
                                                disabled={loading}
                                            />
                                            {option.voteCount > 0 && (
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {option.voteCount} vote{option.voteCount !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {pollOptions.length > 2 && (
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleRemovePollOption(index)}
                                                    disabled={loading}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="edit-allowMultipleVotes"
                                        name="allowMultipleVotes"
                                        checked={formData.allowMultipleVotes}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="edit-allowMultipleVotes" className="text-sm font-normal">
                                        Allow changing votes
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="edit-isPollActive"
                                        name="isPollActive"
                                        checked={formData.isPollActive}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="edit-isPollActive" className="text-sm font-normal">
                                        Poll is active
                                    </Label>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-pollEndsAt" className="text-sm">
                                        Poll End Date
                                    </Label>
                                    <Input
                                        id="edit-pollEndsAt"
                                        name="pollEndsAt"
                                        type="datetime-local"
                                        value={formData.pollEndsAt}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Images */}
                        <div className="grid gap-3">
                            <Label className="text-base font-semibold">Images</Label>
                            
                            {/* Existing Images */}
                            {proposal?.images && proposal.images.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Current Images</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {proposal.images.map((image) => (
                                            <div key={image._id} className="relative aspect-square rounded-lg overflow-hidden border">
                                                <img 
                                                    src={image.fileUrl} 
                                                    alt="Proposal"
                                                    className="w-full h-full object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="destructive"
                                                    className="absolute top-1 right-1 h-6 w-6"
                                                    onClick={() => handleRemoveExistingImage(image._id)}
                                                    disabled={loading || removingImages.includes(image._id)}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Images */}
                            {newImagePreviews.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">New Images</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {newImagePreviews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                                <img 
                                                    src={preview} 
                                                    alt={`New ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="destructive"
                                                    className="absolute top-1 right-1 h-6 w-6"
                                                    onClick={() => handleRemoveNewImage(index)}
                                                    disabled={loading}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload New Images */}
                            {((proposal?.images?.length || 0) - removingImages.length + newImages.length) < 5 && (
                                <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleNewImageChange}
                                        disabled={loading}
                                        className="hidden"
                                    />
                                    <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
                                    <span className="text-sm text-muted-foreground">
                                        Click to add more images
                                    </span>
                                </label>
                            )}
                        </div>

                        {/* Links */}
                        <div className="grid gap-3">
                            <Label className="text-base font-semibold">Links</Label>
                            
                            {links.length > 0 && (
                                <div className="space-y-2">
                                    {links.map((link, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                            <LinkIcon className="w-4 h-4 text-primary" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{link.title}</p>
                                                <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6"
                                                onClick={() => handleRemoveLink(index)}
                                                disabled={loading}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Link title"
                                    value={currentLink.title}
                                    onChange={(e) => setCurrentLink(prev => ({ ...prev, title: e.target.value }))}
                                    disabled={loading}
                                />
                                <Input
                                    placeholder="URL"
                                    value={currentLink.url}
                                    onChange={(e) => setCurrentLink(prev => ({ ...prev, url: e.target.value }))}
                                    disabled={loading}
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    onClick={handleAddLink}
                                    disabled={loading || !currentLink.title.trim() || !currentLink.url.trim()}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => onOpenChange(false)}
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
                                "Update Post"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditProposalDialog;
