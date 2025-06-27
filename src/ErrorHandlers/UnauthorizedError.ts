/**
 * @fileoverview Custom error class for handling 401 Unauthorized errors in the application.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Represents errors when a user is not authorized to access a resource. Integrates with the application's error handling and logging system.
 *
 * @see {@link ./BaseError}
 *
 * Dependencies:
 * - BaseError
 */
import BaseError from "./BaseError";

class UnauthorizedError extends BaseError {
    constructor(message: string, details?: unknown) {
        super(message, 401, 'UNAUTHORIZED', details);
    }
}

export default UnauthorizedError;
