import { toast } from 'sonner';
import type { ApiResponse } from '@/types/api';

interface FetchOptions extends RequestInit {
    retries?: number;
    retryDelay?: number;
    showErrorToast?: boolean;
}

const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

/**
 * Centralized API client with retry logic and error handling
 */
export const apiClient = {
    async get<T>(url: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
        return this.fetch<T>(url, { ...options, method: 'GET' });
    },

    async post<T>(url: string, body: unknown, options: FetchOptions = {}): Promise<ApiResponse<T>> {
        return this.fetch<T>(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: JSON.stringify(body),
        });
    },

    async fetch<T>(url: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
        const {
            retries = DEFAULT_RETRIES,
            retryDelay = DEFAULT_RETRY_DELAY,
            showErrorToast = true,
            ...fetchOptions
        } = options;

        let lastError: Error | null = null;

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const response = await fetch(url, fetchOptions);
                const data = await response.json();

                if (data.status === 'error') {
                    if (showErrorToast) {
                        toast.error(data.error || 'An error occurred');
                    }
                    return data;
                }

                return data;
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Network error');
                
                // Don't retry on last attempt
                if (attempt < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
                }
            }
        }

        const errorResponse: ApiResponse<T> = {
            status: 'error',
            error: lastError?.message || 'Network error. Please try again.',
        };

        if (showErrorToast) {
            toast.error(errorResponse.error);
        }

        return errorResponse;
    },
};

/**
 * Format API error for display
 */
export function formatApiError(error: unknown): string {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'error' in error) {
        return String((error as { error: unknown }).error);
    }
    return 'An unexpected error occurred';
}
