"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, Image, Video, Calendar, File, Heart, X } from "lucide-react";

export default function CaptureFilters({ currentFilters, onFilterChange }) {
    const [fileType, setFileType] = useState(currentFilters.fileType || null);
    const [sortBy, setSortBy] = useState(currentFilters.sortBy || "createdAt");
    const [order, setOrder] = useState(currentFilters.order || "desc");

    const handleFilterChange = (newFilters) => {
        const filters = { ...currentFilters, ...newFilters, skip: 0 };
        onFilterChange(filters);
    };

    const handleFileTypeChange = (type) => {
        const newType = fileType === type ? null : type;
        setFileType(newType);
        handleFilterChange({ fileType: newType });
    };

    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
        handleFilterChange({ sortBy: newSortBy });
    };

    const handleOrderToggle = () => {
        const newOrder = order === "desc" ? "asc" : "desc";
        setOrder(newOrder);
        handleFilterChange({ order: newOrder });
    };

    const resetFilters = () => {
        setFileType(null);
        setSortBy("createdAt");
        setOrder("desc");
        handleFilterChange({
            fileType: null,
            sortBy: "createdAt",
            order: "desc"
        });
    };

    const hasActiveFilters = fileType !== null || sortBy !== "createdAt" || order !== "desc";

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* File Type Filters */}
            <div className="flex items-center gap-2 border-r border-border pr-3">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Button
                    variant={fileType === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFileTypeChange("image")}
                    className="gap-2"
                >
                    <Image className="w-3.5 h-3.5" />
                    Photos
                </Button>
                <Button
                    variant={fileType === "video" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFileTypeChange("video")}
                    className="gap-2"
                >
                    <Video className="w-3.5 h-3.5" />
                    Videos
                </Button>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-3 py-1.5 rounded-md border border-input bg-transparent text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <option value="createdAt">Upload Date</option>
                    <option value="captureDate">Capture Date</option>
                    <option value="likeCount">Most Liked</option>
                    <option value="fileSize">File Size</option>
                    <option value="fileName">Name</option>
                </select>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOrderToggle}
                    className="gap-2"
                >
                    {order === "desc" ? "↓" : "↑"}
                    {order === "desc" ? "Newest" : "Oldest"}
                </Button>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                >
                    <X className="w-3.5 h-3.5" />
                    Reset
                </Button>
            )}
        </div>
    );
}
