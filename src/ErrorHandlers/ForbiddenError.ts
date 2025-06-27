/**
 * @fileoverview Custom error class for handling 403 Forbidden errors in the application.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Represents errors when a user is forbidden from accessing a resource. Integrates with the application's error handling and logging system.
 *
 * @see {@link ./BaseError}
 *
 * Dependencies:
 * - BaseError
 */
import BaseError from "./BaseError";

class ForbiddenError extends BaseError {
    constructor(message: string, details?: unknown) {
        super(message, 403, 'FORBIDDEN_ERROR', details);
    }
}

export default ForbiddenError;
