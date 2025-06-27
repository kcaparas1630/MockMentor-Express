/**
 * @fileoverview Helper function to validate password strength for Firebase Auth.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Provides a utility to check if a password meets minimum security requirements (length, uppercase, lowercase, special character, numeric).
 *
 * @see {@link https://firebase.google.com/docs/auth/web/manage-users}
 *
 * Dependencies:
 * - None
 */
const isPasswordValid = (password: string): boolean => {
    // check if password is at least 8 characters long
    if (password.length < 8) {
        return false;
    }
    // Check if password contains at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return false;
    }
    // Check if password contains at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return false;
    }
    // Check if password contains at least one special character
    if (!/[!@#$%^&*]/.test(password)) {
        return false;
    }
    // Check if password contains at least one numeric character
    if (!/[0-9]/.test(password)) {
        return false;
    }
    return true;
}

export default isPasswordValid;
