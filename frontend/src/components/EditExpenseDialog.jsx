"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useExpenseStore } from "@/store/useExpenseStore";
import { useTripStore } from "@/store/useTripStore";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { setAuthToken } from "@/lib/apiClient";

const CATEGORIES = [
    { value: "travel", label: "Travel", icon: "✈️" },
    { value: "food", label: "Food", icon: "🍔" },
    { value: "accommodation", label: "Accommodation", icon: "🏨" },
    { value: "others", label: "Others", icon: "🎯" },
];

export function EditExpenseDialog({ open, onOpenChange, expense, tripId }) {
    const { getToken } = useAuth();
    const { updateExpense } = useExpenseStore();
    const { currentTrip } = useTripStore();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        amount: "",
        category: "others",
        expenseDate: "",
        notes: "",
        splits: []
    });

    useEffect(() => {
        if (expense && open) {
            setFormData({
                title: expense.title || "",
                description: expense.description || "",
                amount: expense.amount?.toString() || "",
                category: expense.category || "others",
                expenseDate: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : "",
                notes: expense.notes || "",
                splits: expense.splits?.map(split => ({
                    userId: split.userId._id || split.userId,
                    userName: `${split.userId.firstName || ''} ${split.userId.lastName || ''}`.trim(),
                    percentage: split.percentage,
                    amount: split.amount
                })) || []
            });
        }
    }, [expense, open]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAmountChange = (e) => {
        const amount = parseFloat(e.target.value) || 0;
        setFormData(prev => ({
            ...prev,
            amount: e.target.value,
            splits: prev.splits.map(split => ({
                ...split,
                amount: (amount * split.percentage) / 100
            }))
        }));
    };

    const handlePercentageChange = (index, newPercentage) => {
        const percentage = Math.max(0, Math.min(100, parseFloat(newPercentage) || 0));
        const amount = parseFloat(formData.amount) || 0;
        
        const newSplits = [...formData.splits];
        newSplits[index] = {
            ...newSplits[index],
            percentage,
            amount: (amount * percentage) / 100
        };

        setFormData(prev => ({ ...prev, splits: newSplits }));
    };

    const getTotalPercentage = () => {
        return formData.splits.reduce((sum, split) => sum + (split.percentage || 0), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Please enter an expense title");
            return;
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        const totalPercentage = getTotalPercentage();
        if (Math.abs(totalPercentage - 100) > 0.01) {
            toast.error(`Split percentages must total 100% (currently ${totalPercentage.toFixed(1)}%)`);
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);

                const updateData = {
                    title: formData.title,
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                    category: formData.category,
                    expenseDate: formData.expenseDate || new Date().toISOString(),
                    notes: formData.notes,
                    splits: formData.splits.map(split => ({
                        userId: split.userId,
                        percentage: split.percentage,
                        amount: split.amount
                    }))
                };

                await updateExpense(expense._id, tripId, updateData);
                toast.success("Expense updated successfully");
                onOpenChange(false);
            }
        } catch (error) {
            console.error("Error updating expense:", error);
            toast.error(error.message || "Failed to update expense");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Expense</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Expense Title *</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g., Hotel booking, Train tickets"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Additional details about the expense"
                        />
                    </div>

                    {/* Amount and Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (₹) *</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.amount}
                                onChange={handleAmountChange}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                required
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.icon} {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date and Notes */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="expenseDate">Expense Date</Label>
                            <Input
                                id="expenseDate"
                                name="expenseDate"
                                type="date"
                                value={formData.expenseDate}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Input
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Any additional notes"
                            />
                        </div>
                    </div>

                    {/* Splits */}
                    <div className="space-y-2">
                        <Label>Split Among Members *</Label>
                        <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                            {formData.splits.map((split, index) => (
                                <div key={split.userId} className="flex items-center gap-2">
                                    <div className="flex-1 text-sm font-medium">
                                        {split.userName || 'Unknown'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={split.percentage}
                                            onChange={(e) => handlePercentageChange(index, e.target.value)}
                                            className="w-20 text-center"
                                        />
                                        <span className="text-sm text-muted-foreground">%</span>
                                        <span className="text-sm font-medium w-24 text-right">
                                            ₹{split.amount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total</span>
                            <span className={getTotalPercentage() === 100 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                {getTotalPercentage().toFixed(1)}% {getTotalPercentage() === 100 ? "✓" : "✗"}
                            </span>
                        </div>
                    </div>

                    {/* Note about bill image */}
                    <div className="text-xs text-muted-foreground bg-amber-50 p-2 rounded">
                        Note: Bill image cannot be changed. Delete and create a new expense to change the bill.
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Expense"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
