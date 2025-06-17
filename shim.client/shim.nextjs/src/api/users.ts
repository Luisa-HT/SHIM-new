// ClientApp/src/api/users.ts
import axios from 'axios';
import type {UserProfileDto, UpdateUserProfileDto, UpdateEmailDto, UpdatePasswordDto} from '../types';

const API_BASE_URL = '/api/users';

// Helper to get authorization header
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

/**
 * Fetches the profile of the currently authenticated user.
 * @returns A promise that resolves to the user's profile data.
 */
export const getUserProfile = async (): Promise<UserProfileDto> => {
    try {
        const response = await axios.get<UserProfileDto>(`${API_BASE_URL}/profile`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to fetch user profile.');
        }
        throw new Error('Network error or unexpected issue during profile fetch.');
    }
};

/**
 * Updates the profile of the currently authenticated user.
 * @param profileData - The updated profile data.
 * @returns A promise that resolves on success.
 */
export const updateUserProfile = async (profileData: UpdateUserProfileDto): Promise<void> => {
    try {
        await axios.put(`${API_BASE_URL}/profile`, profileData, {
            headers: getAuthHeader(),
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to update user profile.');
        }
        throw new Error('Network error or unexpected issue during profile update.');
    }
};

/**
 * Updates the email of the currently authenticated user.
 * @param emailData - The new email data.
 * @returns A promise that resolves on success.
 */
export const updateUserEmail = async (emailData: UpdateEmailDto): Promise<void> => {
    try {
        await axios.put(`${API_BASE_URL}/profile/email`, emailData, {
            headers: getAuthHeader(),
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to update user email.');
        }
        throw new Error('Network error or unexpected issue during email update.');
    }
};

/**
 * Updates the password of the currently authenticated user.
 * @param passwordData - The current and new password data.
 * @returns A promise that resolves on success.
 */
export const updateUserPassword = async (passwordData: UpdatePasswordDto): Promise<void> => {
    try {
        await axios.put(`${API_BASE_URL}/profile/password`, passwordData, {
            headers: getAuthHeader(),
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to update user password.');
        }
        throw new Error('Network error or unexpected issue during password update.');
    }
};
