export class ApiError extends Error {
    statusCode: number;
    errors: string[];

    constructor(statusCode: number, message: string, errors: string[] = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends ApiError {
    constructor(message = 'Bad Request', errors: string[] = []) {
        super(400, message, errors);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized', errors: string[] = []) {
        super(401, message, errors);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden', errors: string[] = []) {
        super(403, message, errors);
    }
}

export class NotFoundError extends ApiError {
    constructor(message = 'Resource not found', errors: string[] = []) {
        super(404, message, errors);
    }
}

export class ConflictError extends ApiError {
    constructor(message = 'Conflict', errors: string[] = []) {
        super(409, message, errors);
    }
}

export class InternalServerError extends ApiError {
    constructor(message = 'Internal Server Error', errors: string[] = []) {
        super(500, message, errors);
    }
}
