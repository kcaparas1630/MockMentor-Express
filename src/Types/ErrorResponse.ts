interface ErrorResponse {
    statusCode: number;
    message: string;
    errorCode?: string;
    details?: unknown;
}

export default ErrorResponse;
