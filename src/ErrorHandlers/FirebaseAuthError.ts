import BaseError from "./BaseError";

class FirebaseAuthError extends BaseError {
    constructor(message: string, details?: unknown) {
        super(message, 400, 'FIREBASE_AUTH_ERROR', details);
    }
}

export default FirebaseAuthError;
