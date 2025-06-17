// ClientApp/src/types/common.d.ts

export interface PaginationParams {
    pageNumber?: number;
    pageSize?: number;
}

// Generic interface for paginated responses from the API
export interface PaginatedResponse<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number; // Calculated: Math.ceil(totalRecords / pageSize)
    hasPreviousPage: boolean; // Calculated
    hasNextPage: boolean; // Calculated
}

// Generic API response structure for success/error messages
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: { [key: string]: string[] } | string[]; // For validation errors or general error messages
}
