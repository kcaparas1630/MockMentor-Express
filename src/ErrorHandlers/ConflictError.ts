/**
 * @fileoverview Custom error class for handling 409 Conflict errors in the application.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Represents errors when a request could not be completed due to a conflict with the current state of the resource. Integrates with the application's error handling and logging system.
 *
 * @see {@link ./BaseError}
 *
 * Dependencies:
 * - BaseError
 */
import BaseError from "./BaseError";

class ConflictError extends BaseError {
    constructor(message: string, details?: unknown) {
        super(message, 409, 'CONFLICT_ERROR', details);
    }
}

export default ConflictError; 
