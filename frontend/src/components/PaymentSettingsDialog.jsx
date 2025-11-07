"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useExpenseStore } from "@/store/useExpenseStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, QrCode } from "lucide-react";
import { toast } from "sonner";
import { setAuthToken } from "@/lib/apiClient";

export function PaymentSettingsDialog({ open, onOpenChange }) {
    const { getToken } = useAuth();
    const [upiId, setUpiId] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [bankName, setBankName] = useState("");
    const [qrCodeFile, setQrCodeFile] = useState(null);
    const [qrCodePreview, setQrCodePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const { paymentSettings, fetchPaymentSettings, updatePaymentSettings } = useExpenseStore();

    useEffect(() => {
        if (open) {
            loadSettings();
        }
    }, [open]);

    const loadSettings = async () => {
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
                await fetchPaymentSettings();
            }
        } catch (error) {
            console.error("Failed to load payment settings:", error);
        }
    };

    useEffect(() => {
        if (paymentSettings) {
            setUpiId(paymentSettings.upiId || "");
            setPhoneNumber(paymentSettings.phoneNumber || "");
            setBankName(paymentSettings.bankName || "");
            setQrCodePreview(paymentSettings.qrCodeUrl || null);
        }
    }, [paymentSettings]);

    const handleQrCodeChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("QR code image must be less than 5MB");
                return;
            }
            setQrCodeFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setQrCodePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const removeQrCode = () => {
        setQrCodeFile(null);
        setQrCodePreview(paymentSettings?.qrCodeUrl || null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!upiId.trim() && !qrCodePreview && !phoneNumber.trim()) {
            toast.error("Please provide at least one payment method");
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
                
                const settings = {
                    upiId: upiId.trim(),
                    phoneNumber: phoneNumber.trim(),
                    bankName: bankName.trim()
                };

                await updatePaymentSettings(settings, qrCodeFile);
                toast.success("Payment settings updated successfully");
                onOpenChange(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update payment settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Payment Settings</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input
                            id="upiId"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="yourname@upi"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Your UPI ID for receiving payments
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+91 98765 43210"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Phone number linked to your UPI account
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="bankName">Bank Name (Optional)</Label>
                        <Input
                            id="bankName"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="e.g., HDFC Bank, SBI"
                        />
                    </div>

                    <div>
                        <Label>Payment QR Code</Label>
                        {qrCodePreview ? (
                            <div className="relative mt-2 inline-block">
                                <img
                                    src={qrCodePreview}
                                    alt="QR Code"
                                    className="w-48 h-48 rounded-lg border object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={removeQrCode}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <label className="mt-2 flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                <div className="flex flex-col items-center justify-center">
                                    <QrCode className="w-12 h-12 mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground text-center px-2">
                                        Upload QR Code
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        PNG, JPG up to 5MB
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleQrCodeChange}
                                />
                            </label>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                            Upload a QR code for payment apps like Google Pay, PhonePe, Paytm, etc.
                        </p>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Settings"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
