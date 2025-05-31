import BaseError from "./BaseError";

class DatabaseError extends BaseError {
    constructor(message: string, details?: unknown) {
        super(message, 500, 'DATABASE_ERROR', details);
    }
}

export default DatabaseError;
