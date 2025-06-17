// ClientApp/src/utils/localStorage.ts

/**
 * Safely gets an item from localStorage.
 * @param key The key of the item to retrieve.
 * @returns The parsed item or null if not found or parsing fails.
 */
export const getLocalStorageItem = <T>(key: string): T | null => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error getting item from localStorage for key "${key}":`, error);
        return null;
    }
};

/**
 * Safely sets an item in localStorage.
 * @param key The key of the item to set.
 * @param value The value to set.
 */
export const setLocalStorageItem = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting item to localStorage for key "${key}":`, error);
    }
};

/**
 * Safely removes an item from localStorage.
 * @param key The key of the item to remove.
 */
export const removeLocalStorageItem = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing item from localStorage for key "${key}":`, error);
    }
};
