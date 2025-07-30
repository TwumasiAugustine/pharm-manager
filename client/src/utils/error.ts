import { AxiosError } from 'axios';

interface ApiError {
    message: string;
    statusCode: number;
    success: boolean;
}

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiError;
        if (apiError?.message) {
            return apiError.message;
        }
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
};
