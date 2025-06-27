/**
 * @fileoverview Custom error class for handling unknown/internal server errors in the application.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Represents unexpected errors that do not fit other categories. Integrates with the application's error handling and logging system.
 *
 * @see {@link ./BaseError}
 *
 * Dependencies:
 * - BaseError
 */
import BaseError from "./BaseError";

class UnknownError extends BaseError {
    constructor(message: string, details?: unknown) {
        super(message, 500, 'UNKNOWN_ERROR', details);
    }
}

export default UnknownError; 
