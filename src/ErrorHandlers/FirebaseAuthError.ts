/**
 * @fileoverview Custom error class for handling Firebase authentication errors.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Defines error codes and static factory methods for common Firebase Auth errors. Integrates with the application's error handling and logging system.
 *
 * @see {@link ./BaseError}
 *
 * Dependencies:
 * - BaseError
 */
import BaseError from './BaseError';

// Firebase Auth specific error codes (modular - add more as needed)
export type FirebaseAuthErrorCode =
  | 'auth/invalid-email'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/email-already-in-use'
  | 'auth/password-does-not-meet-requirements'
  | 'auth/too-many-requests'
  | 'auth/id-token-expired'
  | 'auth/invalid-id-token'
  | 'auth/popup-closed-by-user';

class FirebaseAuthError extends BaseError {
  constructor(message: string, firebaseErrorCode: FirebaseAuthErrorCode, details?: unknown) {
    const statusCode = FirebaseAuthError.getStatusCodeForFirebaseError(firebaseErrorCode);
    super(message, statusCode, firebaseErrorCode, details);
  }

  private static getStatusCodeForFirebaseError(errorCode: FirebaseAuthErrorCode): number {
    switch (errorCode) {
      case 'auth/invalid-email':
      case 'auth/password-does-not-meet-requirements':
      case 'auth/popup-closed-by-user':
        return 400; // Bad Request
      case 'auth/wrong-password':
      case 'auth/id-token-expired':
      case 'auth/invalid-id-token':
        return 401; // Unauthorized
      case 'auth/user-not-found':
        return 404; // Not Found
      case 'auth/email-already-in-use':
        return 409; // Conflict
      case 'auth/too-many-requests':
        return 429; // Too Many Requests

      default:
        return 500; // Internal Server Error
    }
  }

  // Static factory methods for common Firebase errors
  static invalidEmail(message: string = 'The email address is badly formatted.') {
    return new FirebaseAuthError(message, 'auth/invalid-email');
  }

  static userNotFound(
    message: string = 'There is no user record corresponding to this identifier.'
  ) {
    return new FirebaseAuthError(message, 'auth/user-not-found');
  }

  static wrongPassword(
    message: string = 'The password is invalid or the user does not have a password.'
  ) {
    return new FirebaseAuthError(message, 'auth/wrong-password');
  }

  static emailAlreadyInUse(
    message: string = 'The email address is already in use by another account.'
  ) {
    return new FirebaseAuthError(message, 'auth/email-already-in-use');
  }

  static passwordDoesNotMeetRequirements(
    message: string = 'Password must:\n• Contain at least 8 characters\n• Include an uppercase character\n• Include a numeric character\n• Include a special character'
  ) {
    return new FirebaseAuthError(message, 'auth/password-does-not-meet-requirements');
  }

  static tooManyRequests(message: string = 'Too many requests. Try again later.') {
    return new FirebaseAuthError(message, 'auth/too-many-requests');
  }

  static idTokenExpired(message: string = 'The Firebase ID token has expired.') {
    return new FirebaseAuthError(message, 'auth/id-token-expired');
  }

  static invalidIdToken(message: string = 'The Firebase ID token is invalid.') {
    return new FirebaseAuthError(message, 'auth/invalid-id-token');
  }

  static popupClosedByUser(
    message: string = 'The popup was closed by the user before completing the sign in.'
  ) {
    return new FirebaseAuthError(message, 'auth/popup-closed-by-user');
  }

  // Helper method to create error from Firebase Auth error object
  static fromFirebaseError(firebaseError: {
    code?: string;
    message?: string;
    [key: string]: unknown;
  }): FirebaseAuthError {
    const code = firebaseError.code as FirebaseAuthErrorCode;
    if (!code) {
      // Fallback for unknown errors
      return new FirebaseAuthError(
        'An authentication error occurred.',
        'auth/invalid-id-token',
        firebaseError
      );
    }
    const message = firebaseError.message || 'An authentication error occurred.';
    return new FirebaseAuthError(message, code, firebaseError);
  }
}

export default FirebaseAuthError;
