/**
 * @fileoverview Type definition for standardized API error responses.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Defines the structure of error responses returned by the API, including status code, message, error code, and optional details.
 *
 * Dependencies:
 * - None
 */

interface ErrorResponse {
    statusCode: number;
    message: string;
    errorCode?: string;
    details?: unknown;
}

export default ErrorResponse;
