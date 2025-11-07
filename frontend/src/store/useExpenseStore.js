import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";
import {
    getTripExpenses as fetchTripExpensesAPI,
    getExpenseStatistics as fetchStatisticsAPI,
    getUserBalanceSummary as fetchBalanceAPI,
    createExpense as createExpenseAPI,
    deleteExpense as deleteExpenseAPI,
    markSplitAsPaid as markSplitAsPaidAPI,
    getPaymentSettings as getPaymentSettingsAPI,
    updatePaymentSettings as updatePaymentSettingsAPI
} from "@/lib/api/expenses";

export const useExpenseStore = create((set, get) => ({
    expenses: [],
    statistics: null,
    balance: null,
    paymentSettings: null,
    loading: false,
    creating: false,
    currentFilters: {
        category: null,
        sortBy: "createdAt",
        order: "desc"
    },

    // Fetch all expenses for a trip
    fetchExpenses: async (tripId, filters = {}) => {
        set({ loading: true });
        try {
            const mergedFilters = { ...get().currentFilters, ...filters };
            const data = await fetchTripExpensesAPI(tripId, mergedFilters);
            set({
                expenses: data.expenses,
                currentFilters: mergedFilters,
                loading: false
            });
        } catch (error) {
            console.error("Error fetching expenses:", error);
            set({ loading: false });
            throw error;
        }
    },

    // Fetch expense statistics
    fetchStatistics: async (tripId) => {
        try {
            const data = await fetchStatisticsAPI(tripId);
            set({ statistics: data });
        } catch (error) {
            console.error("Error fetching statistics:", error);
            throw error;
        }
    },

    // Fetch user balance summary
    fetchBalance: async (tripId) => {
        try {
            const data = await fetchBalanceAPI(tripId);
            set({ balance: data });
        } catch (error) {
            console.error("Error fetching balance:", error);
            throw error;
        }
    },

    // Create a new expense
    createExpense: async (tripId, expenseData, billImage) => {
        set({ creating: true });
        try {
            const data = await createExpenseAPI(tripId, expenseData, billImage);
            
            // Add to beginning of expenses list
            set({
                expenses: [data.expense, ...get().expenses],
                creating: false
            });

            // Refresh statistics and balance
            await get().fetchStatistics(tripId);
            await get().fetchBalance(tripId);

            return data.expense;
        } catch (error) {
            set({ creating: false });
            throw error;
        }
    },

    // Delete an expense
    deleteExpense: async (expenseId, tripId) => {
        try {
            await deleteExpenseAPI(expenseId);
            
            // Remove from expenses list
            set({
                expenses: get().expenses.filter(e => e._id !== expenseId)
            });

            // Refresh statistics and balance
            if (tripId) {
                await get().fetchStatistics(tripId);
                await get().fetchBalance(tripId);
            }
        } catch (error) {
            throw error;
        }
    },

    // Update an expense
    updateExpense: async (expenseId, tripId, updateData) => {
        try {
            const response = await apiClient.put(`/api/expenses/${expenseId}`, updateData);
            
            // Update expense in list
            set({
                expenses: get().expenses.map(expense =>
                    expense._id === expenseId ? response.data.expense : expense
                )
            });

            // Refresh statistics and balance
            if (tripId) {
                await get().fetchStatistics(tripId);
                await get().fetchBalance(tripId);
            }

            return response.data.expense;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to update expense");
        }
    },

    // Mark split as paid
    markSplitAsPaid: async (expenseId, splitUserId, tripId) => {
        try {
            const data = await markSplitAsPaidAPI(expenseId, splitUserId);
            
            // Update expense in list
            set({
                expenses: get().expenses.map(expense =>
                    expense._id === expenseId ? data.expense : expense
                )
            });

            // Refresh balance
            if (tripId) {
                await get().fetchBalance(tripId);
            }

            return data.expense;
        } catch (error) {
            throw error;
        }
    },

    // Fetch payment settings
    fetchPaymentSettings: async () => {
        try {
            const data = await getPaymentSettingsAPI();
            set({ paymentSettings: data.settings });
        } catch (error) {
            console.error("Error fetching payment settings:", error);
            throw error;
        }
    },

    // Update payment settings
    updatePaymentSettings: async (settings, qrCodeFile) => {
        try {
            const data = await updatePaymentSettingsAPI(settings, qrCodeFile);
            set({ paymentSettings: data.settings });
            return data.settings;
        } catch (error) {
            throw error;
        }
    },

    // Set filters
    setFilters: (filters) => {
        set({
            currentFilters: { ...get().currentFilters, ...filters }
        });
    },

    // Clear all data
    clearExpenses: () => {
        set({
            expenses: [],
            statistics: null,
            balance: null,
            currentFilters: {
                category: null,
                sortBy: "createdAt",
                order: "desc"
            }
        });
    }
}));
