import BaseError from "./BaseError";

class ForbiddenError extends BaseError {
    constructor(message: string, details?: unknown) {
        super(message, 403, 'FORBIDDEN_ERROR', details);
    }
}

export default ForbiddenError;
