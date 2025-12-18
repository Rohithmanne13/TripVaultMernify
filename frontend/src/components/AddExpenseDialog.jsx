"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useExpenseStore } from "@/store/useExpenseStore";
import { useTripStore } from "@/store/useTripStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { setAuthToken } from "@/lib/apiClient";

const CATEGORIES = [
    { value: "travel", label: "Travel", icon: "✈️" },
    { value: "food", label: "Food", icon: "🍔" },
    { value: "accommodation", label: "Accommodation", icon: "🏨" },
    { value: "others", label: "Others", icon: "🎯" }
];

export function AddExpenseDialog({ tripId, open, onOpenChange }) {
    const { getToken } = useAuth();
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("others");
    const [description, setDescription] = useState("");
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
    const [billImage, setBillImage] = useState(null);
    const [billPreview, setBillPreview] = useState(null);
    const [splits, setSplits] = useState([]);

    const { creating, createExpense } = useExpenseStore();
    const { currentTrip } = useTripStore();

    useEffect(() => {
        if (open && currentTrip?.members && currentTrip.members.length > 0) {
            console.log("Trip members:", currentTrip.members);
            // Initialize equal splits for all members
            const equalPercentage = parseFloat((100 / currentTrip.members.length).toFixed(2));
            const initialSplits = currentTrip.members.map(member => ({
                userId: member.userId?._id || member.userId,
                userName: member.userId?.firstName 
                    ? `${member.userId.firstName} ${member.userId.lastName || ''}`
                    : 'Unknown User',
                percentage: equalPercentage
            }));
            console.log("Initial splits:", initialSplits);
            // Defer state update to avoid synchronous setState in effect
            setTimeout(() => setSplits(initialSplits), 0);
        } else if (open) {
            console.log("No trip members available:", currentTrip);
        }
    }, [open, currentTrip]);

    const handleBillImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Bill image must be less than 10MB");
                return;
            }
            setBillImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setBillPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const removeBillImage = () => {
        setBillImage(null);
        setBillPreview(null);
    };

    const updateSplitPercentage = (userId, newPercentage) => {
        const percentage = parseFloat(newPercentage) || 0;
        setSplits(prev =>
            prev.map(split =>
                split.userId === userId ? { ...split, percentage } : split
            )
        );
    };

    const distributeEqually = () => {
        const equalPercentage = parseFloat((100 / splits.length).toFixed(2));
        setSplits(prev => prev.map(split => ({ ...split, percentage: equalPercentage })));
        toast.success("Split equally among all members");
    };

    const getTotalPercentage = () => {
        return splits.reduce((sum, split) => sum + split.percentage, 0);
    };

    const getSplitAmount = (percentage) => {
        if (!amount) return 0;
        return (parseFloat(amount) * percentage / 100).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!title.trim()) {
            toast.error("Please enter an expense title");
            return;
        }

        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        const totalPercentage = getTotalPercentage();
        if (Math.abs(totalPercentage - 100) > 0.01) {
            toast.error(`Split percentages must total 100% (currently ${totalPercentage.toFixed(2)}%)`);
            return;
        }

        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
                
                const expenseData = {
                    title: title.trim(),
                    amount: amountNum,
                    category,
                    description: description.trim(),
                    expenseDate,
                    splits: splits.map(split => ({
                        userId: split.userId,
                        percentage: split.percentage
                    }))
                };

                await createExpense(tripId, expenseData, billImage);
                toast.success("Expense added successfully");
                onOpenChange(false);
                resetForm();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add expense");
        }
    };

    const resetForm = () => {
        setTitle("");
        setAmount("");
        setCategory("others");
        setDescription("");
        setExpenseDate(new Date().toISOString().split("T")[0]);
        setBillImage(null);
        setBillPreview(null);
        setSplits([]);
    };

    const totalPercentage = getTotalPercentage();
    const isValidSplit = Math.abs(totalPercentage - 100) < 0.01;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Expense</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Dinner at restaurant"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="amount">Amount (INR) *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={expenseDate}
                                    onChange={(e) => setExpenseDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Category *</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setCategory(cat.value)}
                                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                                            category === cat.value
                                                ? "border-primary bg-primary/10"
                                                : "border-border hover:border-primary/50"
                                        }`}
                                    >
                                        <span className="text-2xl">{cat.icon}</span>
                                        <span className="text-xs font-medium">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add any notes about this expense..."
                                className="w-full min-h-20 px-3 py-2 rounded-md border border-input bg-background"
                            />
                        </div>

                        {/* Bill Image Upload */}
                        <div>
                            <Label>Bill Image (optional)</Label>
                            {billPreview ? (
                                <div className="relative mt-2">
                                    <img
                                        src={billPreview}
                                        alt="Bill preview"
                                        className="max-h-48 rounded-lg border"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2"
                                        onClick={removeBillImage}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            Click to upload bill image
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            PNG, JPG, PDF up to 10MB
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={handleBillImageChange}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Split Configuration */}
                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base">Split Among Members</Label>
                            {splits.length > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={distributeEqually}
                                >
                                    Split Equally
                                </Button>
                            )}
                        </div>

                        {splits.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No trip members found.</p>
                                <p className="text-xs mt-2">Please make sure the trip has members before adding expenses.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {splits.map((split) => (
                                    <div key={split.userId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{split.userName}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Amount: INR {getSplitAmount(split.percentage)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={split.percentage}
                                                onChange={(e) => updateSplitPercentage(split.userId, e.target.value)}
                                                className="w-20 text-right"
                                            />
                                            <span className="text-sm text-muted-foreground">%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={`flex items-center justify-between p-3 rounded-lg font-medium ${
                            isValidSplit ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                        }`}>
                            <span>Total</span>
                            <span>{totalPercentage.toFixed(2)}%</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={creating}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={creating || !isValidSplit}>
                            {creating ? "Adding..." : "Add Expense"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
