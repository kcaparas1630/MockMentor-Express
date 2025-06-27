/**
 * @fileoverview Base error class for custom application errors with HTTP status codes and error codes.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Provides a foundation for all custom error types, supporting status codes, error codes, and additional details. Integrates with error response serialization for API error handling.
 *
 * @see {@link ../Types/ErrorResponse}
 *
 * Dependencies:
 * - ErrorResponse type
 */

import ErrorResponse from "../Types/ErrorResponse";

class BaseError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string; // not related to statusCode For example, DATABASE_ERROR
    public readonly details?: unknown;
    constructor(message: string, statusCode: number, errorCode: string, details?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor);
    }

    public toJSON(): ErrorResponse {
        return {
            statusCode: this.statusCode,
            message: this.message,
            errorCode: this.errorCode,
            details: this.details,
        }
    }
}

export default BaseError;
