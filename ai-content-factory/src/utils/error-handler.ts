import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export class APIError extends Error implements AppError {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { statusCode = 500, message, stack } = error;

    logger.error({
        message,
        statusCode,
        stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Don't expose stack trace in production
    const response = {
        error: {
            message: message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack })
        }
    };

    res.status(statusCode).json(response);
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    const error = new APIError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};