import BaseError from "./BaseError";

class UnknownError extends BaseError {
    constructor(message: string, details?: unknown) {
        super(message, 500, 'UNKNOWN_ERROR', details);
    }
}

export default UnknownError; 
