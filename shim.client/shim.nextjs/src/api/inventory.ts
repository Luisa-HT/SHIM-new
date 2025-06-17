// ClientApp/src/api/inventory.ts
import axios from 'axios';
import type {
    BarangDto,
    CreateBarangDto,
    UpdateBarangDto,
    UpdateBarangStatusDto,
    PaginationParams,
    PaginatedResponse
} from '../types';

const API_BASE_URL = '/api/inventory';

// Helper to get authorization header
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

/**
 * Fetches a paginated list of available inventory items (publicly accessible).
 * @param params - Pagination parameters (pageNumber, pageSize).
 * @returns A promise that resolves to a paginated response of BarangDto.
 */
export const getAvailableInventory = async (
    params: PaginationParams
): Promise<PaginatedResponse<BarangDto>> => {
    try {
        const response = await axios.get<PaginatedResponse<BarangDto>>(`${API_BASE_URL}`, {
            params, // Axios automatically serializes params to query string
        });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to fetch available inventory.');
        }
        throw new Error('Network error or unexpected issue during available inventory fetch.');
    }
};

/**
 * Fetches a paginated list of all inventory items (admin only).
 * @param params - Pagination parameters (pageNumber, pageSize).
 * @returns A promise that resolves to a paginated response of BarangDto.
 */
export const getAllInventory = async (
    params: PaginationParams
): Promise<PaginatedResponse<BarangDto>> => {
    try {
        const response = await axios.get<PaginatedResponse<BarangDto>>(`${API_BASE_URL}/all`, {
            headers: getAuthHeader(),
            params,
        });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to fetch all inventory.');
        }
        throw new Error('Network error or unexpected issue during all inventory fetch.');
    }
};

/**
 * Fetches details for a specific inventory item by ID.
 * @param id - The ID of the inventory item.
 * @returns A promise that resolves to the BarangDto.
 */
export const getInventoryItemById = async (id: number): Promise<BarangDto> => {
    try {
        const response = await axios.get<BarangDto>(`${API_BASE_URL}/${id}`, {
            headers: getAuthHeader(), // Accessible by both User and Admin
        });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `Failed to fetch inventory item with ID ${id}.`);
        }
        throw new Error('Network error or unexpected issue during item fetch.');
    }
};

/**
 * Creates a new inventory item (admin only).
 * @param itemData - The data for the new item.
 * @returns A promise that resolves to the created BarangDto.
 */
export const createInventoryItem = async (itemData: CreateBarangDto): Promise<BarangDto> => {
    try {
        const response = await axios.post<BarangDto>(`${API_BASE_URL}`, itemData, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to create inventory item.');
        }
        throw new Error('Network error or unexpected issue during item creation.');
    }
};

/**
 * Updates an existing inventory item (admin only).
 * @param id - The ID of the item to update.
 * @param itemData - The updated item data.
 * @returns A promise that resolves on success.
 */
export const updateInventoryItem = async (id: number, itemData: UpdateBarangDto): Promise<void> => {
    try {
        await axios.put(`${API_BASE_URL}/${id}`, itemData, {
            headers: getAuthHeader(),
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `Failed to update inventory item with ID ${id}.`);
        }
        throw new Error('Network error or unexpected issue during item update.');
    }
};

/**
 * Updates the status of an inventory item (admin only).
 * @param id - The ID of the item to update.
 * @param statusData - The new status data.
 * @returns A promise that resolves on success.
 */
export const updateInventoryItemStatus = async (id: number, statusData: UpdateBarangStatusDto): Promise<void> => {
    try {
        await axios.put(`${API_BASE_URL}/${id}/status`, statusData, {
            headers: getAuthHeader(),
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `Failed to update status for item with ID ${id}.`);
        }
        throw new Error('Network error or unexpected issue during status update.');
    }
};

/**
 * Deletes an inventory item (admin only).
 * @param id - The ID of the item to delete.
 * @returns A promise that resolves on success.
 */
export const deleteInventoryItem = async (id: number): Promise<void> => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`, {
            headers: getAuthHeader(),
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `Failed to delete inventory item with ID ${id}.`);
        }
        throw new Error('Network error or unexpected issue during item deletion.');
    }
};
