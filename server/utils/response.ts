export class ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    statusCode: number;

    constructor(
        statusCode: number,
        data: T | null = null,
        message = 'Success',
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export const successResponse = <T>(
    data: T,
    message = 'Success',
    statusCode = 200,
): ApiResponse<T> => {
    return new ApiResponse(statusCode, data, message);
};

export const errorResponse = (
    message = 'Error',
    statusCode = 500,
): ApiResponse<null> => {
    return new ApiResponse(statusCode, null, message);
};
