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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProposalStore } from "@/store/useProposalStore";
import { setAuthToken } from "@/lib/apiClient";
import { toast } from "sonner";
import { Plus, Loader2, X, Link as LinkIcon, Upload, ImagePlus, BarChart3 } from "lucide-react";

const CreateProposalDialog = ({ tripId, onProposalCreated }) => {
    const { getToken } = useAuth();
    const { createProposal, creating } = useProposalStore();
    const [open, setOpen] = useState(false);
    const [type, setType] = useState("proposal");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        pollEndsAt: "",
        allowMultipleVotes: false
    });
    const [links, setLinks] = useState([]);
    const [currentLink, setCurrentLink] = useState({ title: "", url: "" });
    const [pollOptions, setPollOptions] = useState([""]);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const handleInputChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: inputType === 'checkbox' ? checked : value
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

    const handleAddPollOption = () => {
        setPollOptions(prev => [...prev, ""]);
    };

    const handlePollOptionChange = (index, value) => {
        setPollOptions(prev => prev.map((opt, i) => i === index ? value : opt));
    };

    const handleRemovePollOption = (index) => {
        if (pollOptions.length > 1) {
            setPollOptions(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        
        if (images.length + files.length > 5) {
            toast.error("Maximum 5 images allowed");
            return;
        }

        // Validate file types
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

        setImages(prev => [...prev, ...validFiles]);

        // Create previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
        if (type === "poll") {
            const validOptions = pollOptions.filter(opt => opt.trim());
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
        
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
            }

            const proposalData = {
                title: formData.title,
                description: formData.description,
                type,
                links: links.length > 0 ? links : undefined
            };

            if (type === "poll") {
                proposalData.pollOptions = pollOptions.filter(opt => opt.trim());
                proposalData.allowMultipleVotes = formData.allowMultipleVotes;
                if (formData.pollEndsAt) {
                    proposalData.pollEndsAt = formData.pollEndsAt;
                }
            }

            await createProposal(tripId, proposalData, images);
            
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`);
            
            // Reset form
            setFormData({
                title: "",
                description: "",
                pollEndsAt: "",
                allowMultipleVotes: false
            });
            setLinks([]);
            setCurrentLink({ title: "", url: "" });
            setPollOptions([""]);
            setImages([]);
            setImagePreviews([]);
            setType("proposal");
            
            setOpen(false);
            
            if (onProposalCreated) {
                onProposalCreated();
            }
        } catch (error) {
            console.error("Error creating proposal:", error);
            toast.error(error.message || "Failed to create proposal");
        }
    };

    const handleOpenChange = (newOpen) => {
        if (!creating) {
            setOpen(newOpen);
            if (!newOpen) {
                // Reset form when dialog closes
                setFormData({
                    title: "",
                    description: "",
                    pollEndsAt: "",
                    allowMultipleVotes: false
                });
                setLinks([]);
                setCurrentLink({ title: "", url: "" });
                setPollOptions([""]);
                setImages([]);
                setImagePreviews([]);
                setType("discussion");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    New Post
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Post</DialogTitle>
                        <DialogDescription>
                            Share proposals or create polls for your trip
                        </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs value={type} onValueChange={setType} className="mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="proposal">Proposal</TabsTrigger>
                            <TabsTrigger value="poll">Poll</TabsTrigger>
                        </TabsList>

                        <div className="mt-4 space-y-4">
                            {/* Title */}
                            <div className="grid gap-2">
                                <Label htmlFor="title">
                                    Title <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="Enter a catchy title..."
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    disabled={creating}
                                    maxLength={200}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="grid gap-2">
                                <Label htmlFor="description">
                                    Description <span className="text-red-500">*</span>
                                </Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe your idea in detail..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    disabled={creating}
                                    className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    rows={4}
                                    required
                                />
                            </div>

                            {/* Poll Options - Only for poll type */}
                            <TabsContent value="poll" className="mt-0">
                                <div className="grid gap-3 border rounded-lg p-4 bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-semibold">Poll Options</Label>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={handleAddPollOption}
                                            disabled={creating || pollOptions.length >= 10}
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add Option
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {pollOptions.map((option, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    placeholder={`Option ${index + 1}`}
                                                    value={option}
                                                    onChange={(e) => handlePollOptionChange(index, e.target.value)}
                                                    disabled={creating}
                                                />
                                                {pollOptions.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleRemovePollOption(index)}
                                                        disabled={creating}
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
                                            id="allowMultipleVotes"
                                            name="allowMultipleVotes"
                                            checked={formData.allowMultipleVotes}
                                            onChange={handleInputChange}
                                            disabled={creating}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <Label htmlFor="allowMultipleVotes" className="text-sm font-normal">
                                            Allow changing votes
                                        </Label>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="pollEndsAt" className="text-sm">
                                            Poll End Date (Optional)
                                        </Label>
                                        <Input
                                            id="pollEndsAt"
                                            name="pollEndsAt"
                                            type="datetime-local"
                                            value={formData.pollEndsAt}
                                            onChange={handleInputChange}
                                            disabled={creating}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Images */}
                            <div className="grid gap-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold">Images (Optional)</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {images.length}/5 uploaded
                                    </span>
                                </div>
                                
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                                <img 
                                                    src={preview} 
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="destructive"
                                                    className="absolute top-1 right-1 h-6 w-6"
                                                    onClick={() => handleRemoveImage(index)}
                                                    disabled={creating}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {images.length < 5 && (
                                    <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            disabled={creating}
                                            className="hidden"
                                        />
                                        <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground">
                                            Click to upload images
                                        </span>
                                    </label>
                                )}
                            </div>

                            {/* Links */}
                            <div className="grid gap-3">
                                <Label className="text-base font-semibold">Links (Optional)</Label>
                                
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
                                                    disabled={creating}
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
                                        disabled={creating}
                                    />
                                    <Input
                                        placeholder="URL"
                                        value={currentLink.url}
                                        onChange={(e) => setCurrentLink(prev => ({ ...prev, url: e.target.value }))}
                                        disabled={creating}
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        onClick={handleAddLink}
                                        disabled={creating || !currentLink.title.trim() || !currentLink.url.trim()}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Tabs>

                    <DialogFooter className="mt-6">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handleOpenChange(false)}
                            disabled={creating}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={creating}>
                            {creating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Post"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateProposalDialog;
