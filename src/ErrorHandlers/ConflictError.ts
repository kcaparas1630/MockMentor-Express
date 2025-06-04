import BaseError from "./BaseError";

class ConflictError extends BaseError {
    constructor(message: string, details?: unknown) {
        super(message, 409, 'CONFLICT_ERROR', details);
    }
}

export default ConflictError; 
