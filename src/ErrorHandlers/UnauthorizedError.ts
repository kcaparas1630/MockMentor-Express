import BaseError from "./BaseError";

class UnauthorizedError extends BaseError {
    constructor(message: string, details?: unknown) {
        super(message, 401, 'UNAUTHORIZED', details);
    }
}

export default UnauthorizedError;
