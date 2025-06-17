// ClientApp/src/api/bookings.ts
import axios from 'axios';
import type {
    CreateBookingRequestDto,
    BookingHistoryDto,
    AdminBookingRequestDto,
    AdminBookingHistoryDto,
    AdminDashboardStatsDto,
    DeclineBookingDto,
    CompleteBookingDto,
    PaginationParams,
    PaginatedResponse,
} from '../types';

const API_BASE_URL = '/api/bookings';

// Helper to get authorization header
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

/**
 * Creates a new booking request by an authenticated user.
 * @param bookingData - The booking request DTO.
 * @returns A promise that resolves on success.
 */
export const createBooking = async (bookingData: CreateBookingRequestDto): Promise<void> => {
    try {
        await axios.post(`${API_BASE_URL}`, bookingData, {
            headers: getAuthHeader(),
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to create booking request.');
        }
        throw new Error('Network error or unexpected issue during booking creation.');
    }
};

/**
 * Fetches the booking history for the currently authenticated user.
 * @param params - Pagination parameters.
 * @returns A promise that resolves to a paginated response of BookingHistoryDto.
 */
export const getMyBookingHistory = async (
    params: PaginationParams
): Promise<PaginatedResponse<BookingHistoryDto>> => {
    try {
        const response = await axios.get<PaginatedResponse<BookingHistoryDto>>(`${API_BASE_URL}/my-history`, {
            headers: getAuthHeader(),
            params,
        });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to fetch user booking history.');
        }
        throw new Error('Network error or unexpected issue during booking history fetch.');
    }
};

/**
 * Retrieves dashboard statistics for administrators.
 * @returns A promise that resolves to AdminDashboardStatsDto.
 */
export const getAdminDashboardStats = async (): Promise<AdminDashboardStatsDto> => {
    try {
        const response = await axios.get<AdminDashboardStatsDto>(`${API_BASE_URL}/admin/dashboard-stats`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to fetch admin dashboard stats.');
        }
        throw new Error('Network error or unexpected issue during stats fetch.');
    }
};

/**
 * Fetches a paginated list of pending booking requests for admin review.
 * @param params - Pagination parameters.
 * @returns A promise that resolves to a paginated response of AdminBookingRequestDto.
 */
export const getPendingBookingRequests = async (
    params: PaginationParams
): Promise<PaginatedResponse<AdminBookingRequestDto>> => {
    try {
        const response = await axios.get<PaginatedResponse<AdminBookingRequestDto>>(`${API_BASE_URL}/admin/pending`, {
            headers: getAuthHeader(),
            params,
        });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to fetch pending booking requests.');
        }
        throw new Error('Network error or unexpected issue during pending requests fetch.');
    }
};

/**
 * Fetches details for a specific booking request (for admin review).
 * @param id - The ID of the booking request.
 * @returns A promise that resolves to AdminBookingRequestDto.
 */
export const getAdminBookingRequestById = async (id: number): Promise<AdminBookingRequestDto> => {
    try {
        const response = await axios.get<AdminBookingRequestDto>(`${API_BASE_URL}/admin/requests/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `Failed to fetch booking request with ID ${id}.`);
        }
        throw new Error('Network error or unexpected issue during request details fetch.');
    }
};

/**
 * Approves a pending booking request.
 * @param id - The ID of the booking request to approve.
 * @returns A promise that resolves on success.
 */
export const approveBooking = async (id: number): Promise<void> => {
    try {
        await axios.put(`${API_BASE_URL}/admin/${id}/approve`, {}, { // Empty body for PUT
            headers: getAuthHeader(),
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `Failed to approve booking request with ID ${id}.`);
        }
        throw new Error('Network error or unexpected issue during booking approval.');
    }
};

/**
 * Declines a pending booking request.
 * @param id - The ID of the booking request to decline.
 * @param declineData - The reason for decline.
 * @returns A promise that resolves on success.
 */
export const declineBooking = async (id: number, declineData: DeclineBookingDto): Promise<void> => {
    try {
        await axios.put(`${API_BASE_URL}/admin/${id}/decline`, declineData, {
            headers: getAuthHeader(),
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `Failed to decline booking request with ID ${id}.`);
        }
        throw new Error('Network error or unexpected issue during booking decline.');
    }
};

/**
 * Marks a booking as completed/returned.
 * @param id - The ID of the booking to complete.
 * @param completeData - Details for completion (e.g., fine, return condition).
 * @returns A promise that resolves on success.
 */
export const completeBooking = async (id: number, completeData: CompleteBookingDto): Promise<void> => {
    try {
        await axios.put(`${API_BASE_URL}/admin/${id}/complete`, completeData, {
            headers: getAuthHeader(),
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `Failed to complete booking with ID ${id}.`);
        }
        throw new Error('Network error or unexpected issue during booking completion.');
    }
};

/**
 * Fetches a paginated list of all booking history records for administrators.
 * @param params - Pagination parameters.
 * @returns A promise that resolves to a paginated response of AdminBookingHistoryDto.
 */
export const getAllBookingHistory = async (
    params: PaginationParams
): Promise<PaginatedResponse<AdminBookingHistoryDto>> => {
    try {
        const response = await axios.get<PaginatedResponse<AdminBookingHistoryDto>>(`${API_BASE_URL}/admin/all`, {
            headers: getAuthHeader(),
            params,
        });
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to fetch all booking history.');
        }
        throw new Error('Network error or unexpected issue during all booking history fetch.');
    }
};
