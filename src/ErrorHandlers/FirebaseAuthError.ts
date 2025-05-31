import BaseError from "./BaseError";

// Firebase Auth specific error codes (modular - add more as needed)
export type FirebaseAuthErrorCode = 
  | 'auth/invalid-email'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/email-already-in-use'
  | 'auth/password-does-not-meet-requirements'
  | 'auth/too-many-requests'
  | 'auth/id-token-expired'
  | 'auth/popup-closed-by-user';

class FirebaseAuthError extends BaseError {
    constructor(message: string, firebaseErrorCode: FirebaseAuthErrorCode, details?: unknown) {
        super(message, 400, firebaseErrorCode, details);
    }

    // Static factory methods for common Firebase errors
    static invalidEmail(message: string = 'The email address is badly formatted.') {
        return new FirebaseAuthError(message, 'auth/invalid-email');
    }

    static userNotFound(message: string = 'There is no user record corresponding to this identifier.') {
        return new FirebaseAuthError(message, 'auth/user-not-found');
    }

    static wrongPassword(message: string = 'The password is invalid or the user does not have a password.') {
        return new FirebaseAuthError(message, 'auth/wrong-password');
    }

    static emailAlreadyInUse(message: string = 'The email address is already in use by another account.') {
        return new FirebaseAuthError(message, 'auth/email-already-in-use');
    }


    static passwordDoesNotMeetRequirements(message: string = 'Password must:\n• Contain at least 8 characters\n• Include an uppercase character\n• Include a numeric character\n• Include a special character') {
        return new FirebaseAuthError(message, 'auth/password-does-not-meet-requirements');
    }

    static tooManyRequests(message: string = 'Too many requests. Try again later.') {
        return new FirebaseAuthError(message, 'auth/too-many-requests');
    }

    static idTokenExpired(message: string = 'The Firebase ID token has expired.') {
        return new FirebaseAuthError(message, 'auth/id-token-expired');
    }

    static popupClosedByUser(message: string = 'The popup was closed by the user before completing the sign in.') {
        return new FirebaseAuthError(message, 'auth/popup-closed-by-user');
    }

    // Helper method to create error from Firebase Auth error object
    static fromFirebaseError(firebaseError: { code: string; message?: string; [key: string]: unknown }): FirebaseAuthError {
        const code = firebaseError.code as FirebaseAuthErrorCode;
        const message = firebaseError.message || 'An authentication error occurred.';
        return new FirebaseAuthError(message, code, firebaseError);
    }
}

export default FirebaseAuthError;
