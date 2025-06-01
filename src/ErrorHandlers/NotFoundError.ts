import BaseError from './BaseError';

class NotFoundError extends BaseError {
    constructor(message: string, details?: unknown) {
        super(message, 404, 'NOT_FOUND', details);
    }
}

export default NotFoundError;
