import {apiClient} from "../apiClient";

// Create a new expense
export const createExpense = async (tripId, expenseData, billImage = null) => {
    try {
        const formData = new FormData();
        formData.append("title", expenseData.title);
        formData.append("amount", expenseData.amount);
        formData.append("category", expenseData.category);
        formData.append("splits", JSON.stringify(expenseData.splits));
        
        if (expenseData.description) formData.append("description", expenseData.description);
        if (expenseData.expenseDate) formData.append("expenseDate", expenseData.expenseDate);
        if (expenseData.notes) formData.append("notes", expenseData.notes);
        if (billImage) formData.append("billImage", billImage);

        const response = await apiClient.post(
            `/api/expenses/trip/${tripId}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to create expense");
    }
};

// Get all expenses for a trip
export const getTripExpenses = async (tripId, filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.category) params.append("category", filters.category);
        if (filters.sortBy) params.append("sortBy", filters.sortBy);
        if (filters.order) params.append("order", filters.order);

        const queryString = params.toString();
        const url = `/api/expenses/trip/${tripId}${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch expenses");
    }
};

// Get expense statistics
export const getExpenseStatistics = async (tripId) => {
    try {
        const response = await apiClient.get(`/api/expenses/trip/${tripId}/statistics`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch statistics");
    }
};

// Get user balance summary
export const getUserBalanceSummary = async (tripId) => {
    try {
        const response = await apiClient.get(`/api/expenses/trip/${tripId}/balance`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch balance summary");
    }
};

// Mark split as paid
export const markSplitAsPaid = async (expenseId, splitUserId) => {
    try {
        const response = await apiClient.put(
            `/api/expenses/${expenseId}/splits/${splitUserId}/paid`
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to mark as paid");
    }
};

// Delete expense
export const deleteExpense = async (expenseId) => {
    try {
        const response = await apiClient.delete(`/api/expenses/${expenseId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to delete expense");
    }
};

// Get payment settings
export const getPaymentSettings = async () => {
    try {
        const response = await apiClient.get("/api/expenses/payment-settings");
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch payment settings");
    }
};

// Update payment settings
export const updatePaymentSettings = async (settings, qrCodeFile = null) => {
    try {
        const formData = new FormData();
        if (settings.upiId) formData.append("upiId", settings.upiId);
        if (settings.phoneNumber) formData.append("phoneNumber", settings.phoneNumber);
        if (settings.bankName) formData.append("bankName", settings.bankName);
        if (qrCodeFile) formData.append("qrCode", qrCodeFile);

        const response = await apiClient.put(
            "/api/expenses/payment-settings",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to update payment settings");
    }
};

// Get user payment settings
export const getUserPaymentSettings = async (userId) => {
    try {
        const response = await apiClient.get(`/api/expenses/payment-settings/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch user payment settings");
    }
};
