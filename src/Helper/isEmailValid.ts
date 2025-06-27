/**
 * @fileoverview Helper function to validate email address format.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Provides a utility to check if a given string is a valid email address using a regular expression.
 *
 * @see {@link https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address}
 *
 * Dependencies:
 * - None
 */
const isEmailValid = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default isEmailValid;
