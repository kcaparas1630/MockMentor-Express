/**
 * @fileoverview Custom error class for handling 404 Not Found errors in the application.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Represents errors when a requested resource is not found. Integrates with the application's error handling and logging system.
 *
 * @see {@link ./BaseError}
 *
 * Dependencies:
 * - BaseError
 */
import BaseError from './BaseError';

class NotFoundError extends BaseError {
    constructor(message: string, details?: unknown) {
        super(message, 404, 'NOT_FOUND', details);
    }
}

export default NotFoundError;
