/**
 * @fileoverview Custom error class for handling 400 Validation errors in the application.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Represents errors when a request fails validation. Integrates with the application's error handling and logging system.
 *
 * @see {@link ./BaseError}
 *
 * Dependencies:
 * - BaseError
 */
import BaseError from "./BaseError";

class ValidationError extends BaseError {
    constructor(message: string, details?: unknown) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

export default ValidationError;
