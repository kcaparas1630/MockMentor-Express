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
