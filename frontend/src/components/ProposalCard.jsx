"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProposalStore } from "@/store/useProposalStore";
import { setAuthToken } from "@/lib/apiClient";
import { toast } from "sonner";
import { 
    Lightbulb, 
    BarChart3, 
    ExternalLink, 
    Trash2, 
    Edit,
    Check,
    Clock,
    X
} from "lucide-react";
import EditProposalDialog from "./EditProposalDialog";

const ProposalCard = ({ proposal, tripCreatorId, currentUserId }) => {
    const { getToken } = useAuth();
    const { deleteProposal, voteOnPoll } = useProposalStore();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [voting, setVoting] = useState(false);

    const isCreator = proposal.createdBy._id === currentUserId || proposal.createdBy === currentUserId;
    const isTripCreator = tripCreatorId === currentUserId;
    const canDelete = isCreator || isTripCreator;
    const canEdit = isCreator;

    const getTypeIcon = () => {
        switch (proposal.type) {
            case "proposal":
                return <Lightbulb className="w-5 h-5 text-yellow-500" />;
            case "poll":
                return <BarChart3 className="w-5 h-5 text-purple-500" />;
            default:
                return <Lightbulb className="w-5 h-5" />;
        }
    };

    const getTypeLabel = () => {
        return proposal.type.charAt(0).toUpperCase() + proposal.type.slice(1);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) {
            return;
        }

        setDeleting(true);
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
            }

            await deleteProposal(proposal._id);
            toast.success("Post deleted successfully");
        } catch (error) {
            console.error("Error deleting proposal:", error);
            toast.error(error.message || "Failed to delete post");
        } finally {
            setDeleting(false);
        }
    };

    const handleVote = async (optionId) => {
        setVoting(true);
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
            }

            await voteOnPoll(proposal._id, optionId);
        } catch (error) {
            console.error("Error voting:", error);
            toast.error(error.message || "Failed to vote");
        } finally {
            setVoting(false);
        }
    };

    const getUserVotes = () => {
        if (proposal.type !== "poll" || !proposal.pollOptions) return [];
        
        const votedOptions = [];
        for (let option of proposal.pollOptions) {
            if (option.votes && option.votes.some(v => v.userId === currentUserId)) {
                votedOptions.push(option._id);
            }
        }
        return votedOptions;
    };

    const isPollEnded = () => {
        if (!proposal.pollEndsAt) return false;
        return new Date() > new Date(proposal.pollEndsAt);
    };

    const isPollClosed = () => {
        return !proposal.isPollActive || isPollEnded();
    };

    const userVotes = getUserVotes();

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Creator Avatar */}
                            <div className="flex-shrink-0">
                                {proposal.createdBy.imageUrl ? (
                                    <img
                                        src={proposal.createdBy.imageUrl}
                                        alt={proposal.createdBy.firstName}
                                        className="w-10 h-10 rounded-full"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-medium">
                                            {proposal.createdBy.firstName?.[0] || "U"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Title and Meta */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {getTypeIcon()}
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {getTypeLabel()}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-lg leading-tight mb-1">
                                    {proposal.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>
                                        {proposal.createdBy.firstName} {proposal.createdBy.lastName}
                                    </span>
                                    <span>•</span>
                                    <span>{formatDate(proposal.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 flex-shrink-0">
                            {canEdit && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setEditDialogOpen(true)}
                                    disabled={deleting}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                            )}
                            {canDelete && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Description */}
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                        {proposal.description}
                    </p>

                    {/* Images */}
                    {proposal.images && proposal.images.length > 0 && (
                        <div className={`grid gap-2 ${
                            proposal.images.length === 1 ? 'grid-cols-1' :
                            proposal.images.length === 2 ? 'grid-cols-2' :
                            'grid-cols-3'
                        }`}>
                            {proposal.images.map((image, index) => (
                                <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                                    <img
                                        src={image.fileUrl}
                                        alt={`Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Links */}
                    {proposal.links && proposal.links.length > 0 && (
                        <div className="space-y-2">
                            {proposal.links.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors group"
                                >
                                    <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                            {link.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {link.url}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Poll Options */}
                    {proposal.type === "poll" && proposal.pollOptions && (
                        <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                            {isPollClosed() && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <X className="w-4 h-4" />
                                    <span>This poll is closed</span>
                                </div>
                            )}
                            
                            {proposal.pollEndsAt && !isPollEnded() && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Ends {formatDate(proposal.pollEndsAt)}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                {proposal.pollOptions.map((option) => {
                                    const totalVotes = proposal.totalVotes || 0;
                                    const percentage = totalVotes > 0 
                                        ? ((option.voteCount / totalVotes) * 100).toFixed(1)
                                        : 0;
                                    const isVoted = userVotes.includes(option._id);

                                    return (
                                        <button
                                            key={option._id}
                                            onClick={() => !isPollClosed() && handleVote(option._id)}
                                            disabled={voting || isPollClosed()}
                                            className={`w-full p-3 rounded-lg border-2 transition-all text-left relative overflow-hidden ${
                                                isVoted 
                                                    ? 'border-primary bg-primary/10' 
                                                    : 'border-border hover:border-primary/50'
                                            } ${isPollClosed() ? 'cursor-default' : 'cursor-pointer'}`}
                                        >
                                            {/* Progress bar */}
                                            <div 
                                                className={`absolute inset-0 ${
                                                    isVoted ? 'bg-primary/20' : 'bg-muted'
                                                } transition-all`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                            
                                            {/* Content */}
                                            <div className="relative flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-1">
                                                    {isVoted && (
                                                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                                    )}
                                                    <span className="text-sm font-medium">
                                                        {option.optionText}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-sm font-semibold">
                                                        {percentage}%
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({option.voteCount} {option.voteCount === 1 ? 'vote' : 'votes'})
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                                Total votes: {proposal.totalVotes || 0}
                                {proposal.allowMultipleVotes && " • You can change your vote"}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            {canEdit && (
                <EditProposalDialog
                    proposal={proposal}
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                />
            )}
        </>
    );
};

export default ProposalCard;
