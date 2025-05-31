import { NextFunction, Request, Response } from "express";
import BaseError from "./BaseError";
import logger from "../Config/LoggerConfig";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
    logger.error('Error details:', {
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
            details: error instanceof BaseError ? error.details : undefined
        },
        request: {
            method: req.method,
            url: req.url,
            params: req.params,
            query: req.query,
            headers: {
                correlationId: req.headers['x-correlation-id']
            }
        }
    });
    try {
        // send sanitized reponse to client
        if(error instanceof BaseError) {
            res.status(error.statusCode).json(error.toJSON());
    } else {
        // for unknown errors
        res.status(500).json({
            status: 'Error',
            message: 'An unexpected error occured',
                code: 'INTERNAL_ERROR',
            })
        }
    } catch (responseError) {
        logger.error('Failed to send error response: ', responseError);
        if (!res.headersSent) {
            res.status(500).end("Internal Server Error");
        }
    }
};

export default errorHandler;
