"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, QrCode, Copy, ExternalLink, Settings } from "lucide-react";
import { toast } from "sonner";
import { getUserPaymentSettings } from "@/lib/api/expenses";
import { setAuthToken } from "@/lib/apiClient";

export function BalanceSettlementCard({ balance, tripId, formatCurrency }) {
    const { getToken } = useAuth();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState(null);
    const [loadingPayment, setLoadingPayment] = useState(false);

    const isPositive = balance.amount > 0;
    const otherUser = {
        _id: balance.userId,
        firstName: balance.userName?.split(' ')[0] || 'Unknown',
        lastName: balance.userName?.split(' ').slice(1).join(' ') || '',
        email: balance.userEmail || '',
        imageUrl: balance.userImage
    };
    const amount = Math.abs(balance.amount);

    const handlePayNow = async () => {
        setLoadingPayment(true);
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
                const data = await getUserPaymentSettings(otherUser._id);
                setPaymentSettings(data.settings);
                setShowPaymentModal(true);
            }
        } catch (error) {
            toast.error("Failed to load payment settings");
        } finally {
            setLoadingPayment(false);
        }
    };

    const handleCopyUPI = () => {
        if (paymentSettings?.upiId) {
            navigator.clipboard.writeText(paymentSettings.upiId);
            toast.success("UPI ID copied to clipboard");
        }
    };

    const handleOpenUPI = () => {
        if (paymentSettings?.upiId) {
            const upiUrl = `upi://pay?pa=${paymentSettings.upiId}&pn=${otherUser.firstName}&am=${amount}&cu=${balance.currency || "INR"}`;
            window.open(upiUrl, "_blank");
        }
    };

    return (
        <>
            <Card className={`p-4 ${isPositive ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {otherUser.imageUrl ? (
                                <img
                                    src={otherUser.imageUrl}
                                    alt={otherUser.firstName}
                                    className={`w-12 h-12 rounded-full object-cover ring-2 ${
                                        isPositive ? "ring-green-500/30" : "ring-red-500/30"
                                    }`}
                                />
                            ) : (
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                                    isPositive ? "bg-green-500" : "bg-red-500"
                                }`}>
                                    {otherUser.firstName?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                            )}
                            <div>
                                <div className="font-medium text-base">
                                    {otherUser.firstName} {otherUser.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {otherUser.email}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                            {isPositive ? "owes you" : "you owe"}
                        </div>
                        <div className={`text-2xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(amount)}
                        </div>
                    </div>

                    {!isPositive && (
                        <Button
                            className="w-full bg-red-500 hover:bg-red-600"
                            onClick={handlePayNow}
                            disabled={loadingPayment}
                        >
                            {loadingPayment ? "Loading..." : "Pay Now"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}

                    {isPositive && balance.isPaid && (
                        <div className="w-full py-2 text-center text-sm bg-green-100 text-green-700 rounded-md font-medium">
                            ✓ Marked as Paid
                        </div>
                    )}
                </div>
            </Card>

            {/* Payment Modal */}
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            {otherUser.imageUrl ? (
                                <img
                                    src={otherUser.imageUrl}
                                    alt={otherUser.firstName}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold">
                                    {otherUser.firstName?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                            )}
                            <div>
                                <div>Pay {otherUser.firstName} {otherUser.lastName}</div>
                                <div className="text-xs font-normal text-muted-foreground">{otherUser.email}</div>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="text-center py-4 bg-red-50 rounded-lg border-2 border-red-200">
                            <div className="text-sm text-red-700 font-medium mb-1">Amount to Pay</div>
                            <div className="text-4xl font-bold text-red-600">
                                {formatCurrency(amount)}
                            </div>
                        </div>

                        {paymentSettings ? (
                            <div className="space-y-4">
                                {/* QR Code */}
                                {paymentSettings.qrCodeUrl && (
                                    <div className="flex flex-col items-center p-4 rounded-lg border-2 bg-linear-to-br from-purple-50 to-blue-50">
                                        <div className="text-sm font-medium mb-3 flex items-center gap-2">
                                            <QrCode className="w-4 h-4" />
                                            Scan QR Code to Pay
                                        </div>
                                        <img
                                            src={paymentSettings.qrCodeUrl}
                                            alt="Payment QR Code"
                                            className="w-52 h-52 rounded-lg border-4 border-white shadow-lg"
                                        />
                                    </div>
                                )}

                                {/* UPI ID */}
                                {paymentSettings.upiId && (
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                            UPI ID
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1 p-3 rounded-lg bg-muted font-mono text-sm break-all">
                                                {paymentSettings.upiId}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={handleCopyUPI}
                                                className="shrink-0"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <Button
                                            className="w-full bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                                            onClick={handleOpenUPI}
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Open UPI App & Pay
                                        </Button>
                                    </div>
                                )}

                                {/* Bank Details */}
                                {paymentSettings.bankName && (
                                    <div className="p-4 rounded-lg bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200 space-y-2">
                                        <div className="text-sm font-medium text-amber-900">Bank Details</div>
                                        <div className="text-sm text-amber-800">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Bank:</span>
                                                <span>{paymentSettings.bankName}</span>
                                            </div>
                                        </div>
                                        {paymentSettings.phoneNumber && (
                                            <div className="text-sm text-amber-800">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Phone:</span>
                                                    <span>{paymentSettings.phoneNumber}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="text-xs text-muted-foreground text-center pt-2 bg-blue-50 p-3 rounded-lg">
                                    💡 After making the payment, the expense creator will mark your split as paid
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Settings className="w-8 h-8 text-gray-400" />
                                </div>
                                <div className="text-muted-foreground mb-2">
                                    {otherUser.firstName} hasn't set up payment details yet
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    They need to add their UPI ID or QR code in Payment Settings
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
