// ClientApp/src/utils/helpers.ts

/**
 * Formats a date string into a localized date string.
 * @param dateString The date string (e.g., ISO 8601).
 * @returns A localized date string or 'N/A' if invalid.
 */
export const formatDate = (dateString?: string | null): string => {
    if (!dateString) {
        return 'N/A';
    }
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (error) {
        console.error("Error formatting date:", error);
        return 'N/A';
    }
};

/**
 * Formats a date string into a localized date and time string.
 * @param dateTimeString The date-time string (e.g., ISO 8601).
 * @returns A localized date and time string or 'N/A' if invalid.
 */
export const formatDateTime = (dateTimeString?: string | null): string => {
    if (!dateTimeString) {
        return 'N/A';
    }
    try {
        return new Date(dateTimeString).toLocaleString();
    } catch (error) {
        console.error("Error formatting date-time:", error);
        return 'N/A';
    }
};

/**
 * Formats a number as Indonesian Rupiah (Rp).
 * @param amount The number amount.
 * @returns A formatted currency string or 'N/A' if invalid.
 */
export const formatRupiah = (amount?: number | null): string => {
    if (amount === null || amount === undefined) {
        return 'N/A';
    }
    try {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    } catch (error) {
        console.error("Error formatting Rupiah:", error);
        return 'N/A';
    }
};

/**
 * Capitalizes the first letter of a string.
 * @param str The input string.
 * @returns The capitalized string.
 */
export const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};
