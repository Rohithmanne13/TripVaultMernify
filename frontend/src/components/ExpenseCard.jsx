"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useExpenseStore } from "@/store/useExpenseStore";
import { EditExpenseDialog } from "@/components/EditExpenseDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, FileText, Trash2, CheckCircle, Circle, Download, Edit } from "lucide-react";
import { toast } from "sonner";
import { setAuthToken } from "@/lib/apiClient";

export function ExpenseCard({ expense, tripId, formatCurrency, tripCreatorId }) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { deleteExpense, markSplitAsPaid } = useExpenseStore();
    const [deleting, setDeleting] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);

    const getCategoryIcon = (category) => {
        const icons = {
            travel: "✈️",
            food: "🍔",
            accommodation: "🏨",
            others: "🎯"
        };
        return icons[category] || "📝";
    };

    const getCategoryColor = (category) => {
        const colors = {
            travel: "text-blue-500",
            food: "text-orange-500",
            accommodation: "text-purple-500",
            others: "text-green-500"
        };
        return colors[category] || "text-gray-500";
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this expense?")) return;

        setDeleting(true);
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
                await deleteExpense(expense._id, tripId);
                toast.success("Expense deleted successfully");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete expense");
            setDeleting(false);
        }
    };

    const handleMarkPaid = async (splitUserId) => {
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
                await markSplitAsPaid(expense._id, splitUserId, tripId);
                toast.success("Payment marked as paid");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to mark as paid");
        }
    };

    const handleDownloadBill = () => {
        if (expense.billImageUrl) {
            window.open(expense.billImageUrl, "_blank");
        }
    };

    const isExpenseCreator = expense.paidBy?._id === user?.id;
    const isTripCreator = tripCreatorId === user?.id;
    const canDelete = isExpenseCreator || isTripCreator;
    const canEdit = isExpenseCreator || isTripCreator;
    const userSplit = expense.splits?.find(s => s.userId?._id === user?.id);
    const isFullyPaid = expense.splits?.every(s => s.isPaid);

    return (
        <>
        <Card className={`p-4 ${deleting ? "opacity-50" : ""}`}>
            <div className="flex items-start gap-4">
                {/* Category Icon */}
                <div className={`text-3xl ${getCategoryColor(expense.category)}`}>
                    {getCategoryIcon(expense.category)}
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-lg">{expense.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="capitalize">{expense.category}</span>
                                <span>•</span>
                                <span>
                                    {new Date(expense.expenseDate).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                    })}
                                </span>
                                {isFullyPaid && (
                                    <>
                                        <span>•</span>
                                        <span className="text-green-600 font-medium">Fully Paid</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="text-right">
                                <div className="text-xl font-bold">{formatCurrency(expense.amount)}</div>
                                <div className="text-xs text-muted-foreground">
                                    Paid by {isExpenseCreator ? "You" : `${expense.paidBy?.firstName || ''} ${expense.paidBy?.lastName || ''}`.trim() || 'Unknown'}
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {expense.billImageUrl && (
                                        <DropdownMenuItem onClick={handleDownloadBill}>
                                            <Download className="w-4 h-4 mr-2" />
                                            View Bill
                                        </DropdownMenuItem>
                                    )}
                                    {canEdit && (
                                        <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                    )}
                                    {canDelete && (
                                        <DropdownMenuItem
                                            onClick={handleDelete}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {expense.description && (
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                    )}

                    {/* Bill Image Thumbnail */}
                    {expense.billImageUrl && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="w-4 h-4" />
                            <button
                                onClick={handleDownloadBill}
                                className="hover:underline hover:text-primary"
                            >
                                View Bill Image
                            </button>
                        </div>
                    )}

                    {/* Splits */}
                    <div className="space-y-2 pt-2 border-t">
                        <div className="text-sm font-medium text-muted-foreground">Split Details</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {expense.splits?.map((split) => {
                                const isCurrentUser = split.userId?._id === user?.id;
                                const splitUserName = isCurrentUser 
                                    ? "You" 
                                    : `${split.userId?.firstName || ''} ${split.userId?.lastName || ''}`.trim() || 'Unknown';
                                
                                return (
                                    <div
                                        key={split._id}
                                        className={`flex items-center justify-between p-2 rounded-md ${
                                            split.isPaid ? "bg-green-500/10" : "bg-muted/50"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {split.isPaid ? (
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-muted-foreground" />
                                            )}
                                            <span className="text-sm font-medium">
                                                {splitUserName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                                {formatCurrency(split.amount)}
                                            </span>
                                            {isExpenseCreator && !split.isPaid && !isCurrentUser && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleMarkPaid(split.userId._id)}
                                                    className="h-7 px-2 text-xs bg-background hover:bg-primary hover:text-primary-foreground border-primary/20"
                                                >
                                                    Mark Paid
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </Card>

        {/* Edit Expense Dialog */}
        <EditExpenseDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            expense={expense}
            tripId={tripId}
        />
        </>
    );
}
