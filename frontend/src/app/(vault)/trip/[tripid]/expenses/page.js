"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useExpenseStore } from "@/store/useExpenseStore";
import { useTripStore } from "@/store/useTripStore";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { ExpenseCard } from "@/components/ExpenseCard";
import { BalanceSettlementCard } from "@/components/BalanceSettlementCard";
import { PaymentSettingsDialog } from "@/components/PaymentSettingsDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Settings, TrendingUp, TrendingDown, IndianRupee, Target, Receipt, HandCoins, FileDown } from "lucide-react";
import { toast } from "sonner";
import { setAuthToken } from "@/lib/apiClient";

export default function ExpensesPage() {
    const { tripid } = useParams();
    const { getToken } = useAuth();
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showPaymentSettings, setShowPaymentSettings] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState(null);

    const {
        expenses,
        statistics,
        balance,
        loading,
        fetchExpenses,
        fetchStatistics,
        fetchBalance,
        setFilters,
        currentFilters
    } = useExpenseStore();

    const { currentTrip, fetchTripById } = useTripStore();

    const loadExpenseData = async () => {
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
                await Promise.all([
                    fetchTripById(tripid),
                    fetchExpenses(tripid),
                    fetchStatistics(tripid),
                    fetchBalance(tripid)
                ]);
            }
        } catch (error) {
            console.error("Error loading expense data:", error);
            toast.error("Failed to load expense data");
        }
    };

    useEffect(() => {
        if (tripid) {
            loadExpenseData();
        }
    }, [tripid, loadExpenseData]);

    const handleCategoryFilter = async (category) => {
        const newCategory = categoryFilter === category ? null : category;
        setCategoryFilter(newCategory);
        setFilters({ category: newCategory });
        
        try {
            const token = await getToken();
            if (token) {
                setAuthToken(token);
                await fetchExpenses(tripid, { category: newCategory });
            }
        } catch (error) {
            console.error("Error filtering expenses:", error);
        }
    };

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
            travel: "from-blue-500 to-blue-600",
            food: "from-orange-500 to-orange-600",
            accommodation: "from-purple-500 to-purple-600",
            others: "from-green-500 to-green-600"
        };
        return colors[category] || "from-gray-500 to-gray-600";
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
        }).format(amount);
    };

    const exportToPDF = () => {
        try {
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            
            const tripName = currentTrip?.tripName || 'Trip';
            const today = new Date().toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            });

            // Build HTML content for PDF
            let htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${tripName} - Expense Report</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 40px; 
                            color: #333;
                            line-height: 1.6;
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 40px;
                            border-bottom: 3px solid #4F46E5;
                            padding-bottom: 20px;
                        }
                        .header h1 { 
                            color: #4F46E5; 
                            font-size: 32px;
                            margin-bottom: 8px;
                        }
                        .header .subtitle {
                            color: #666;
                            font-size: 14px;
                        }
                        .summary { 
                            background: #f8f9fa; 
                            padding: 20px; 
                            border-radius: 8px;
                            margin-bottom: 30px;
                        }
                        .summary h2 { 
                            color: #4F46E5;
                            margin-bottom: 15px;
                            font-size: 20px;
                        }
                        .summary-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 15px;
                        }
                        .summary-item {
                            background: white;
                            padding: 12px;
                            border-radius: 6px;
                            border-left: 4px solid #4F46E5;
                        }
                        .summary-item label {
                            display: block;
                            font-size: 12px;
                            color: #666;
                            margin-bottom: 4px;
                        }
                        .summary-item value {
                            display: block;
                            font-size: 18px;
                            font-weight: bold;
                            color: #333;
                        }
                        .category-section {
                            margin-bottom: 30px;
                        }
                        .category-section h3 {
                            background: #4F46E5;
                            color: white;
                            padding: 12px 16px;
                            border-radius: 6px;
                            font-size: 16px;
                            margin-bottom: 15px;
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse;
                            margin-bottom: 20px;
                            background: white;
                        }
                        th { 
                            background: #f8f9fa; 
                            padding: 12px;
                            text-align: left;
                            font-weight: 600;
                            color: #333;
                            border-bottom: 2px solid #dee2e6;
                        }
                        td { 
                            padding: 12px;
                            border-bottom: 1px solid #e9ecef;
                        }
                        tr:last-child td {
                            border-bottom: none;
                        }
                        .amount { 
                            font-weight: 600;
                            color: #4F46E5;
                        }
                        .footer {
                            margin-top: 40px;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                            border-top: 1px solid #dee2e6;
                            padding-top: 20px;
                        }
                        .badge {
                            display: inline-block;
                            padding: 4px 8px;
                            border-radius: 4px;
                            font-size: 11px;
                            font-weight: 600;
                        }
                        .badge-paid {
                            background: #d1fae5;
                            color: #065f46;
                        }
                        .badge-pending {
                            background: #fee2e2;
                            color: #991b1b;
                        }
                        @media print {
                            body { padding: 20px; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${tripName}</h1>
                        <div class="subtitle">Expense Report - Generated on ${today}</div>
                    </div>
            `;

            // Budget Summary
            if (statistics) {
                htmlContent += `
                    <div class="summary">
                        <h2>Budget Summary</h2>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <label>Total Budget</label>
                                <value>${formatCurrency(statistics.budget || 0)}</value>
                            </div>
                            <div class="summary-item">
                                <label>Total Spent</label>
                                <value>${formatCurrency(statistics.totalExpenses || 0)}</value>
                            </div>
                            <div class="summary-item">
                                <label>Remaining</label>
                                <value>${formatCurrency(statistics.remainingBudget || 0)}</value>
                            </div>
                            <div class="summary-item">
                                <label>Budget Used</label>
                                <value>${(statistics.budgetPercentage || 0).toFixed(1)}%</value>
                            </div>
                        </div>
                    </div>
                `;
            }

            // Category Breakdown
            if (statistics?.categoryBreakdown) {
                htmlContent += `<div class="category-section"><h3>Category Breakdown</h3><table>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Count</th>
                            <th>Amount</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>`;
                
                Object.entries(statistics.categoryBreakdown).forEach(([category, data]) => {
                    htmlContent += `
                        <tr>
                            <td style="text-transform: capitalize;">${getCategoryIcon(category)} ${category}</td>
                            <td>${data?.count || 0}</td>
                            <td class="amount">${formatCurrency(data?.total || 0)}</td>
                            <td>${(data?.percentage || 0).toFixed(1)}%</td>
                        </tr>
                    `;
                });

                htmlContent += `</tbody></table></div>`;
            }

            // All Expenses
            if (expenses && expenses.length > 0) {
                htmlContent += `<div class="category-section"><h3>All Expenses (${expenses.length})</h3><table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Paid By</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>`;

                expenses.forEach(expense => {
                    const isFullyPaid = expense.splits?.every(s => s.isPaid);
                    const expenseDate = new Date(expense.expenseDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    });

                    htmlContent += `
                        <tr>
                            <td>${expenseDate}</td>
                            <td><strong>${expense.title}</strong>${expense.description ? '<br><small>' + expense.description + '</small>' : ''}</td>
                            <td style="text-transform: capitalize;">${expense.category}</td>
                            <td>${expense.paidBy?.firstName || 'Unknown'} ${expense.paidBy?.lastName || ''}</td>
                            <td class="amount">${formatCurrency(expense.amount)}</td>
                            <td><span class="badge ${isFullyPaid ? 'badge-paid' : 'badge-pending'}">${isFullyPaid ? 'Paid' : 'Pending'}</span></td>
                        </tr>
                    `;
                });

                htmlContent += `</tbody></table></div>`;
            }

            // Balance Settlement
            if (balance && balance.balancesWith && balance.balancesWith.length > 0) {
                htmlContent += `<div class="category-section"><h3>Balance Settlement</h3>`;
                
                // You owe
                const owedBalances = balance.balancesWith.filter(b => b.amount < 0);
                if (owedBalances.length > 0) {
                    htmlContent += `<h4 style="color: #dc2626; margin: 15px 0 10px;">You Need to Pay:</h4><table>
                        <thead>
                            <tr>
                                <th>Person</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>`;
                    
                    owedBalances.forEach(b => {
                        htmlContent += `
                            <tr>
                                <td>${b.userName}</td>
                                <td class="amount" style="color: #dc2626;">${formatCurrency(Math.abs(b.amount))}</td>
                                <td><span class="badge ${b.isPaid ? 'badge-paid' : 'badge-pending'}">${b.isPaid ? 'Paid' : 'Pending'}</span></td>
                            </tr>
                        `;
                    });
                    htmlContent += `</tbody></table>`;
                }

                // Others owe you
                const owingBalances = balance.balancesWith.filter(b => b.amount > 0);
                if (owingBalances.length > 0) {
                    htmlContent += `<h4 style="color: #16a34a; margin: 15px 0 10px;">Others Owe You:</h4><table>
                        <thead>
                            <tr>
                                <th>Person</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>`;
                    
                    owingBalances.forEach(b => {
                        htmlContent += `
                            <tr>
                                <td>${b.userName}</td>
                                <td class="amount" style="color: #16a34a;">${formatCurrency(b.amount)}</td>
                                <td><span class="badge ${b.isPaid ? 'badge-paid' : 'badge-pending'}">${b.isPaid ? 'Paid' : 'Pending'}</span></td>
                            </tr>
                        `;
                    });
                    htmlContent += `</tbody></table>`;
                }

                htmlContent += `</div>`;
            }

            htmlContent += `
                    <div class="footer">
                        <p>Generated by TripVault - Your Ultimate Trip Planning Companion</p>
                        <p style="margin-top: 5px;">This report was generated on ${new Date().toLocaleString('en-IN')}</p>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();

            // Wait for content to load, then trigger print
            printWindow.onload = function() {
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            };

            toast.success("PDF export ready!");
        } catch (error) {
            console.error("Error exporting PDF:", error);
            toast.error("Failed to export PDF");
        }
    };

    if (loading && !expenses.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading expenses...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Expenses</h1>
                    <p className="text-muted-foreground mt-1">
                        Track and split trip expenses
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={exportToPDF}
                        disabled={!expenses || expenses.length === 0}
                    >
                        <FileDown className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowPaymentSettings(true)}
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Payment Settings
                    </Button>
                    <Button onClick={() => setShowAddExpense(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Expense
                    </Button>
                </div>
            </div>

            {/* Budget Overview */}
            {statistics && (
                <Card className="p-6 bg-linear-to-br from-primary/10 to-primary/5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-semibold">Budget Overview</h2>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {formatCurrency(statistics.totalExpenses || 0)} of {formatCurrency(statistics.budget || 0)}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className={(statistics.budgetPercentage || 0) > 90 ? "text-red-500 font-medium" : ""}>
                                {(statistics.budgetPercentage || 0).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full transition-all rounded-full ${
                                    (statistics.budgetPercentage || 0) > 90
                                        ? "bg-red-500"
                                        : (statistics.budgetPercentage || 0) > 70
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                }`}
                                style={{ width: `${Math.min(statistics.budgetPercentage || 0, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <div className="flex items-center gap-1 text-sm">
                                <IndianRupee className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Remaining:</span>
                                <span className="font-medium">{formatCurrency(statistics.remainingBudget || 0)}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Category Statistics */}
            {statistics?.categoryBreakdown && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(statistics.categoryBreakdown).map(([category, data]) => (
                        <Card
                            key={category}
                            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                                categoryFilter === category ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => handleCategoryFilter(category)}
                        >
                            <div className={`w-full h-2 rounded-full bg-linear-to-r ${getCategoryColor(category)} mb-3`} />
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">{getCategoryIcon(category)}</span>
                                <span className="text-sm font-medium text-muted-foreground capitalize">
                                    {category}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-bold">{formatCurrency(data?.total || 0)}</div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{data?.count || 0} {(data?.count || 0) === 1 ? "expense" : "expenses"}</span>
                                    <span>{(data?.percentage || 0).toFixed(1)}%</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Tabs for Expenses and Balance Settlement */}
            <Tabs defaultValue="expenses" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="expenses" className="flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        All Expenses
                    </TabsTrigger>
                    <TabsTrigger value="balance" className="flex items-center gap-2">
                        <HandCoins className="w-4 h-4" />
                        Balance Settlement
                    </TabsTrigger>
                </TabsList>

                {/* Expenses Tab */}
                <TabsContent value="expenses" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            All Expenses {categoryFilter && `(${categoryFilter})`}
                        </h2>
                        {categoryFilter && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCategoryFilter(null)}
                            >
                                Clear Filter
                            </Button>
                        )}
                    </div>

                    {expenses.length === 0 ? (
                        <Card className="p-12 text-center">
                            <div className="text-muted-foreground mb-4">
                                No expenses yet. Start adding your trip expenses!
                            </div>
                            <Button onClick={() => setShowAddExpense(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Expense
                            </Button>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {expenses.map((expense) => (
                                <ExpenseCard
                                    key={expense._id}
                                    expense={expense}
                                    tripId={tripid}
                                    tripCreatorId={currentTrip?.createdBy}
                                    formatCurrency={formatCurrency}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Balance Settlement Tab */}
                <TabsContent value="balance" className="space-y-4">
                    {balance && balance.balancesWith && balance.balancesWith.length > 0 ? (
                        <>
                            {/* What You Owe (Negative balances) */}
                            {balance.balancesWith.filter(b => b.amount < 0).length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-2">
                                <TrendingDown className="w-4 h-4 text-red-500" />
                                <h3 className="text-base font-medium text-red-600">
                                    You Need to Pay
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {balance.balancesWith
                                    .filter(b => b.amount < 0)
                                    .map((balanceItem) => (
                                        <BalanceSettlementCard
                                            key={`owe-${balanceItem.userId}`}
                                            balance={balanceItem}
                                            tripId={tripid}
                                            formatCurrency={formatCurrency}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* What Others Owe You (Positive balances) */}
                    {balance.balancesWith.filter(b => b.amount > 0).length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-2">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <h3 className="text-base font-medium text-green-600">
                                    Others Owe You
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {balance.balancesWith
                                    .filter(b => b.amount > 0)
                                    .map((balanceItem) => (
                                        <BalanceSettlementCard
                                            key={`owed-${balanceItem.userId}`}
                                            balance={balanceItem}
                                            tripId={tripid}
                                            formatCurrency={formatCurrency}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Overall Summary */}
                    <Card className={`p-4 ${balance.balance > 0 ? 'bg-green-500/5 border-green-500/20' : balance.balance < 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-gray-500/5'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-muted-foreground">Overall Balance</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    You paid {formatCurrency(balance.userPaid || 0)} • You owe {formatCurrency(balance.userOwes || 0)}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-2xl font-bold ${
                                    balance.balance > 0 ? 'text-green-600' : 
                                    balance.balance < 0 ? 'text-red-600' : 
                                    'text-gray-600'
                                }`}>
                                    {formatCurrency(Math.abs(balance.balance || 0))}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {balance.balance > 0 ? 'you are owed' : balance.balance < 0 ? 'you owe' : 'settled'}
                                </div>
                            </div>
                        </div>
                    </Card>
                        </>
                    ) : (
                        <Card className="p-12 text-center">
                            <div className="text-muted-foreground">
                                No pending settlements. All balanced!
                            </div>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <AddExpenseDialog
                tripId={tripid}
                open={showAddExpense}
                onOpenChange={setShowAddExpense}
            />

            <PaymentSettingsDialog
                open={showPaymentSettings}
                onOpenChange={setShowPaymentSettings}
            />
        </div>
    );
}
