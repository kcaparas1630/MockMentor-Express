/**
 * @fileoverview Winston logger configuration for application logging.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Sets up and exports a Winston logger instance for structured logging to console and file. Ensures log directory setup and error handling for logging operations.
 *
 * @see {@link winston}
 *
 * Dependencies:
 * - winston
 * - fs
 * - path
 */
import { createLogger, format, transports } from 'winston';
import path from 'path';
import fs from 'fs';

const { combine, timestamp, json, colorize } = format;

// Define log directory and file
const logDir = path.join(__dirname, '../../logs');
const logFile = path.join(logDir, 'app.log');

// Create logs directory if it doesn't exist
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Test write access
  fs.accessSync(logDir, fs.constants.W_OK);
} catch (error) {
  console.error('Error setting up log directory:', error);
}

// Custom format for console logging with colors
const consoleLogFormat = format.combine(
  format.colorize(),
  format.printf(({ level, message, timestamp }) => {
    return `${level}: ${message}, (${timestamp})`;
  })
);

// Create a Winston logger
const logger = createLogger({
  level: 'info',
  format: combine(colorize(), timestamp(), json()),
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
    new transports.File({
      filename: logFile,
      // handler for file write errors
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
  ],
});

// Immediate Test logs
logger.info('Logger initialized', {
  logDir,
  logFile, // eslint-disable-next-line no-undef
  cwd: process.cwd(), // eslint-disable-next-line no-undef
  uid: process.getuid?.(), // eslint-disable-next-line no-undef
  gid: process.getgid?.(),
});

export default logger;
