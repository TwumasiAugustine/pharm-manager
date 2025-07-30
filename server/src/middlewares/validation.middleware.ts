import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { errorResponse } from '../utils/response';
import { fromZodError, ValidationError } from 'zod-validation-error';

/**
 * Middleware to validate request body against a Zod schema
 * @param schema The Zod schema to validate against
 * @returns Express middleware function
 */
export const validate =
    (schema: z.ZodObject<any, any>) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const validationError: ValidationError = fromZodError(error);
                return errorResponse(validationError.message, res.statusCode);
            }
            // Forward other errors
            next(error);
        }
    };
