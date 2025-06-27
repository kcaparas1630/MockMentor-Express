/**
 * @fileoverview Helper for logging error details using the application logger.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Provides a utility function to log error details with context for debugging and monitoring. Integrates with the Winston logger configuration.
 *
 * @see {@link ../Config/LoggerConfig}
 *
 * Dependencies:
 * - Winston logger
 */
// Will use for logging the error details in the controllers
import logger from '../Config/LoggerConfig';
// Log the full error details
const ErrorLogger = (error: unknown, methodName: string) => {
  logger.error(`Error in ${methodName}`, {
    error:
      error instanceof Error
        ? {
            name: error.name,
          }
        : error,
    context: {
      method: methodName,
      timestamp: new Date().toISOString(),
    },
  });
};

export default ErrorLogger;
