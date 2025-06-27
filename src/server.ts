/**
 * @fileoverview Entry point for starting the AI Interview Express server.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Loads environment variables, initializes the Express app, and starts the server on the configured port. Ensures the backend service is ready to handle API requests.
 *
 * @see {@link ./express}
 *
 * Dependencies:
 * - Express.js
 * - dotenv
 */
import app from './express';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
