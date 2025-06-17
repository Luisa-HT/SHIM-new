// ClientApp/src/api/auth.ts
import axios from 'axios'; // Assuming axios is installed: npm install axios
import type {LoginRequestDto, LoginResponseDto, SignUpRequestDto, ApiResponse} from '../types';

// Base URL for your backend API
const API_BASE_URL = '/api/auth'; // Relative path, ASP.NET Core proxy will handle it

/**
 * Handles user login.
 * @param loginData - The login request DTO (email and password).
 * @returns A promise that resolves to the login response data or rejects with an error.
 */
export const login = async (loginData: LoginRequestDto): Promise<LoginResponseDto> => {
    try {
        const response = await axios.post<LoginResponseDto>(`${API_BASE_URL}/login`, loginData);
        return response.data;
    } catch (error: any) {
        // It's good practice to normalize API error responses
        if (axios.isAxiosError(error) && error.response) {
            // Backend returns { message: "..." } for errors
            throw new Error(error.response.data.message || 'Login failed due to an unexpected error.');
        }
        throw new Error('Network error or unexpected issue during login.');
    }
};

/**
 * Handles user sign-up.
 * @param signupData - The sign-up request DTO.
 * @returns A promise that resolves to the login response data (as user is auto-logged in) or rejects with an error.
 */
export const signup = async (signupData: SignUpRequestDto): Promise<LoginResponseDto> => {
    try {
        // Backend returns LoginResponseDto on successful signup (auto-login)
        const response = await axios.post<LoginResponseDto>(`${API_BASE_URL}/signup`, signupData);
        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Sign up failed due to an unexpected error.');
        }
        throw new Error('Network error or unexpected issue during sign up.');
    }
};

// You might also want an API for token validation if your backend has one,
// but typically the presence/validity of the token is handled by the backend
// middleware on protected routes.
