import {apiClient} from "../apiClient";

// Upload a capture (photo/video) to a trip
export const uploadCapture = async (tripId, file, description = "", captureDate = null) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        if (description) formData.append("description", description);
        if (captureDate) formData.append("captureDate", captureDate);

        const response = await apiClient.post(
            `/api/captures/trip/${tripId}/upload`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to upload capture");
    }
};

// Get all captures for a trip with optional filters
export const getTripCaptures = async (tripId, options = {}) => {
    try {
        console.log("getTripCaptures called with tripId:", tripId, "type:", typeof tripId);
        
        if (!tripId || tripId === 'undefined') {
            throw new Error("Invalid trip ID provided to getTripCaptures");
        }

        const {
            fileType = null,
            sortBy = "createdAt",
            order = "desc",
            limit = 50,
            skip = 0
        } = options;

        const params = new URLSearchParams({
            sortBy,
            order,
            limit: limit.toString(),
            skip: skip.toString()
        });

        if (fileType) {
            params.append("fileType", fileType);
        }

        const url = `/api/captures/trip/${tripId}?${params.toString()}`;
        console.log("Fetching captures from URL:", url);

        const response = await apiClient.get(url);
        console.log("Fetched captures successfully");
        return response.data;
    } catch (error) {
        console.error("Error in getTripCaptures:", error);
        throw new Error(error.response?.data?.message || "Failed to fetch captures");
    }
};

// Get most liked captures for a trip
export const getMostLikedCaptures = async (tripId, limit = 10) => {
    try {
        const response = await apiClient.get(
            `/api/captures/trip/${tripId}/most-liked?limit=${limit}`
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch most liked captures");
    }
};

// Get single capture by ID
export const getCaptureById = async (captureId) => {
    try {
        const response = await apiClient.get(`/api/captures/${captureId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch capture");
    }
};

// Rename a capture
export const renameCapture = async (captureId, fileName) => {
    try {
        const response = await apiClient.put(
            `/api/captures/${captureId}/rename`,
            { fileName }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to rename capture");
    }
};

// Update capture description
export const updateCaptureDescription = async (captureId, description) => {
    try {
        const response = await apiClient.put(
            `/api/captures/${captureId}/description`,
            { description }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to update description");
    }
};

// Toggle like on a capture
export const toggleLikeCapture = async (captureId) => {
    try {
        const response = await apiClient.post(`/api/captures/${captureId}/like`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to toggle like");
    }
};

// Delete a capture
export const deleteCapture = async (captureId) => {
    try {
        const response = await apiClient.delete(`/api/captures/${captureId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to delete capture");
    }
};

// Download a capture
export const downloadCapture = async (fileUrl, fileName) => {
    try {
        const response = await apiClient.get(fileUrl, {
            responseType: "blob",
        });
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw new Error("Failed to download capture");
    }
};
