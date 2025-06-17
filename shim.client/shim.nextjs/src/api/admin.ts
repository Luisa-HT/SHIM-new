// ClientApp/src/api/admin.ts
import axios from 'axios';
import type {AdminProfileDto, UpdateAdminProfileDto, UpdateEmailDto, UpdatePasswordDto} from '../types';

const API_BASE_URL = '/api/admin'; // Specific route for admin profile management

// Helper to get authorization header
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

/**
 * Fetches the profile of the currently authenticated administrator.
 * @returns A promise that resolves to the admin's profile data.
 */
export const getAdminProfile = async (): Promise<AdminProfileDto> => {
    try {
        const response = await axios.get<AdminProfileDto>(`${API_BASE_URL}/profile`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to fetch admin profile.');
        }
        throw new Error('Network error or unexpected issue during admin profile fetch.');
    }
};

/**
 * Updates the profile of the currently authenticated administrator.
 * @param profileData - The updated profile data.
 * @returns A promise that resolves on success.
 */
export const updateAdminProfile = async (profileData: UpdateAdminProfileDto): Promise<void> => {
    try {
        await axios.put(`${API_BASE_URL}/profile`, profileData, {
            headers: getAuthHeader(),
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to update admin profile.');
        }
        throw new Error('Network error or unexpected issue during admin profile update.');
    }
};

/**
 * Updates the email of the currently authenticated administrator.
 * @param emailData - The new email data.
 * @returns A promise that resolves on success.
 */
export const updateAdminEmail = async (emailData: UpdateEmailDto): Promise<void> => {
    try {
        await axios.put(`${API_BASE_URL}/profile/email`, emailData, {
            headers: getAuthHeader(),
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to update admin email.');
        }
        throw new Error('Network error or unexpected issue during admin email update.');
    }
};

/**
 * Updates the password of the currently authenticated administrator.
 * @param passwordData - The current and new password data.
 * @returns A promise that resolves on success.
 */
export const updateAdminPassword = async (passwordData: UpdatePasswordDto): Promise<void> => {
    try {
        await axios.put(`${API_BASE_URL}/profile/password`, passwordData, {
            headers: getAuthHeader(),
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to update admin password.');
        }
        throw new Error('Network error or unexpected issue during admin password update.');
    }
};
