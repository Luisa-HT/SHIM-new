// ClientApp/src/api/grants.ts
import axios from 'axios';
import type { HibahDto, CreateHibahDto, UpdateHibahDto, PaginationParams, PaginatedResponse } from '../types';

const API_BASE_URL = '/api/grants';

// Helper to get authorization header
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

/**
 * Fetches a paginated list of all grants (admin only).
 * @param params - Pagination parameters.
 * @returns A promise that resolves to a paginated response of HibahDto.
 */
export const getAllGrants = async (params: PaginationParams): Promise<PaginatedResponse<HibahDto>> => {
    try {
        const response = await axios.get<PaginatedResponse<HibahDto>>(`${API_BASE_URL}`, {
            headers: getAuthHeader(),
            params,
        });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to fetch grants.');
        }
        throw new Error('Network error or unexpected issue during grants fetch.');
    }
};

/**
 * Fetches details for a specific grant by ID (admin only).
 * @param id - The ID of the grant.
 * @returns A promise that resolves to the HibahDto.
 */
export const getGrantById = async (id: number): Promise<HibahDto> => {
    try {
        const response = await axios.get<HibahDto>(`${API_BASE_URL}/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `Failed to fetch grant with ID ${id}.`);
        }
        throw new Error('Network error or unexpected issue during grant fetch.');
    }
};

/**
 * Creates a new grant (admin only).
 * @param grantData - The data for the new grant.
 * @returns A promise that resolves to the created HibahDto.
 */
export const createGrant = async (grantData: CreateHibahDto): Promise<HibahDto> => {
    try {
        const response = await axios.post<HibahDto>(`${API_BASE_URL}`, grantData, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to create grant.');
        }
        throw new Error('Network error or unexpected issue during grant creation.');
    }
};

/**
 * Updates an existing grant (admin only).
 * @param id - The ID of the grant to update.
 * @param grantData - The updated grant data.
 * @returns A promise that resolves on success.
 */
export const updateGrant = async (id: number, grantData: UpdateHibahDto): Promise<void> => {
    try {
        await axios.put(`${API_BASE_URL}/${id}`, grantData, {
            headers: getAuthHeader(),
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `Failed to update grant with ID ${id}.`);
        }
        throw new Error('Network error or unexpected issue during grant update.');
    }
};

/**
 * Deletes a grant (admin only).
 * @param id - The ID of the grant to delete.
 * @returns A promise that resolves on success.
 */
export const deleteGrant = async (id: number): Promise<void> => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`, {
            headers: getAuthHeader(),
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `Failed to delete grant with ID ${id}.`);
        }
        throw new Error('Network error or unexpected issue during grant deletion.');
    }
};
