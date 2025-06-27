/**
 * @fileoverview Aggregates and exports all API route modules for the application.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * Centralizes the export of user, question, and interview routes for easy integration into the Express app.
 *
 * @see {@link ./UserRoute}
 * @see {@link ./GetQuestionRoute}
 * @see {@link ./InterviewRoute}
 *
 * Dependencies:
 * - Express.js
 * - Route Modules
 */

export { default as userRoutes } from './UserRoute';
export { default as questionRoutes } from './GetQuestionRoute';
export { default as interviewRoutes } from './InterviewRoute';
