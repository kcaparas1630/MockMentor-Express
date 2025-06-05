import { Response, NextFunction } from 'express';
import {
  getAllQuestions,
  getUserFromFirebaseToken,
  createSession,
  getSession,
  saveAnswer,
  completeInterview,
  updateInterviewFeedback,
  getInterviewWithResults,
  processAnswer,
  processAllAnswers,
  getQuestionById,
} from '../db';
import { AuthRequest } from '../Types/AuthRequest';
import { CompletedInterviewQuestion, InterviewQuestion } from '../Types/QuestionsType';
import FirebaseAuthError from '../ErrorHandlers/FirebaseAuthError';
import ValidationError from '../ErrorHandlers/ValidationError';
import DatabaseError from '../ErrorHandlers/DatabaseError';
import UnknownError from '../ErrorHandlers/UnknownError';
import NotFoundError from '../ErrorHandlers/NotFoundError';
import ForbiddenError from '../ErrorHandlers/ForbiddenError';

/**
 * Start a new interview session for the authenticated user
 * @param req - The authenticated request object containing user info
 * @param res - The response object
 * @returns JSON response with session details and first question
 * @description Creates a new interview session, validates user profile, and returns the first question
 */
export const startInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Non-null assertion since middleware guarantees this
    const uid = req.user!.uid;

    // Get user data including job role
    const user = await getUserFromFirebaseToken(uid);
    if (!user) {
      return next(FirebaseAuthError.userNotFound());
    }

    const jobRole = user?.profile?.jobRole;
    if (!jobRole) {
      return next(new DatabaseError('User job role not found. Please complete your profile.'));
    }

    // Get all questions for the interview
    const questions = await getAllQuestions();
  
    // TODO: Validate job levels and interview type. Restrict to only certain values.
    const { jobLevel, interviewType } = req.body;
    if (!jobLevel) {
      return next(new ValidationError('Missing required field: jobLevel'));
    }
    if (!interviewType) {
      return next(new ValidationError('Missing required field: interviewType'));
    }

    // Create interview session in database
    const interviewSession = await createSession({
      userId: user.id,
      jobRole,
      jobLevel,
      interviewType,
      totalQuestions: questions.length,
      startedAt: new Date(),
    });

    res.json({
      sessionId: interviewSession.id,
      currentQuestion: questions[0],
      questionNumber: 1,
      totalQuestions: questions.length,
      jobRole: jobRole,
    });
  } catch (error) {
    // If the error is a known error type, pass it through
    if (error instanceof FirebaseAuthError || 
        error instanceof ValidationError || 
        error instanceof DatabaseError ||
        error instanceof NotFoundError) {
      return next(error);
    }
    // For unknown errors, use a generic server error
    return next(new UnknownError('Failed to start interview'));
  }
};

/**
 * Submit user response to the current interview question and get next question or final feedback
 * @param req - The authenticated request object containing session ID, question ID, and user's answer
 * @param res - The response object
 * @returns JSON response with next question and current question feedback, or comprehensive interview feedback if completed
 * @description Saves user's answer, gets AI feedback for current question, progresses to next question, or processes all answers for final AI feedback
 */
export const submitUserResponse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId, questionId, answerResponse, currentQuestionIndex } = req.body;

    // Validate required fields. Separated for better debugging and user experience.
    if (!sessionId) {
      return next(new ValidationError('Missing required field: sessionId'));
    }
    if (!questionId) {
      return next(new ValidationError('Missing required field: questionId'));
    }
    if (!answerResponse) {
      return next(new ValidationError('Missing required field: answerResponse'));
    }
    if (!currentQuestionIndex) {
      return next(new ValidationError('Missing required field: currentQuestionIndex'));
    }

    if (typeof currentQuestionIndex !== 'number' || currentQuestionIndex < 0) {
      return next(new ValidationError('Invalid currentQuestionIndex'));
    }

    // Get interview session
    const session = await getSession(sessionId);

    // Get the question details
    const question = await getQuestionById(questionId);

    // Validate this is the expected question for the current index.
    const allQuestionsValidated = await getAllQuestions();
    if (currentQuestionIndex >= allQuestionsValidated.length || allQuestionsValidated[currentQuestionIndex].id !== questionId) {
      return next(new ValidationError('Invalid currentQuestionIndex'));
    }
    
    const existingAnswer = session.questions.find((q: InterviewQuestion) => q.questionId === questionId);
    if (existingAnswer) {
      return next(new ValidationError('Question already answered'));
    }

    // Get metadata from session for AI processing
    const metadata = session.metadata as { jobRole: string; jobLevel: string };

    // Compile data for individual question AI feedback
    const questionData = {
      question: question.question,
      answer: answerResponse,
      jobRole: metadata.jobRole || '',
      jobLevel: metadata.jobLevel || '',
      interviewType: session.interviewType,
      questionType: question.questionType,
    };

    // Get AI feedback for this individual question
    const questionFeedback = await processAnswer(questionData);

    // Save the answer with AI feedback to session
    await saveAnswer(sessionId, questionId, answerResponse, question.question, questionFeedback);

    // Get next question
    const allQuestions = await getAllQuestions();
    const nextIndex = (currentQuestionIndex || 0) + 1;

    if (nextIndex >= allQuestions.length) {
      // Interview completed - process all answers for comprehensive feedback
      const completedInterview = await completeInterview(sessionId);

      // Compile all data for comprehensive AI processing
      const allAnswersData = {
        jobRole: metadata.jobRole || '',
        jobLevel: metadata.jobLevel || '',
        interviewType: session.interviewType,
        questions: completedInterview.questions.map((q: CompletedInterviewQuestion) => ({
          question: q.questionText,
          answer: q.answer,
          questionType: q.questionType,
          individualFeedback: q.feedback ? String(q.feedback) : undefined,
        })),
      };

      // Process all answers together for comprehensive feedback
      const comprehensiveFeedback = await processAllAnswers(allAnswersData);

      // Update interview with final comprehensive feedback
      await updateInterviewFeedback(sessionId, comprehensiveFeedback);

      res.json({
        completed: true,
        message: 'Interview completed successfully',
        currentQuestionFeedback: questionFeedback, // Feedback for the last question
        comprehensiveFeedback: {
          overallScore: comprehensiveFeedback.overallScore,
          improvements: comprehensiveFeedback.improvements,
          overallFeedback: comprehensiveFeedback.overallFeedback,
          questionFeedback: comprehensiveFeedback.questionFeedback,
          strengths: comprehensiveFeedback.strengths,
          areasToImprove: comprehensiveFeedback.areasToImprove,
        },
        allAnswers: allAnswersData.questions,
      });
      return;
    }

    // Return next question with current question feedback
    res.json({
      sessionId,
      currentQuestion: allQuestions[nextIndex],
      questionNumber: nextIndex + 1,
      totalQuestions: allQuestions.length,
      completed: false,
      currentQuestionIndex: nextIndex,
      currentQuestionFeedback: questionFeedback, // Feedback for the question just answered
    });
  } catch (error) {
    // If the error is a known error type, pass it through
    if (error instanceof FirebaseAuthError || 
        error instanceof ValidationError || 
        error instanceof DatabaseError ||
        error instanceof NotFoundError) {
      return next(error);
    }
    // For unknown errors, use a generic server error
    return next(new UnknownError('Failed to submit user response'));
  }
};

/**
 * Retrieve comprehensive interview results and feedback for a completed interview
 * @param req - The authenticated request object containing session ID in params
 * @param res - The response object
 * @returns JSON response with complete interview data including score, feedback, and questions
 * @description Fetches detailed interview results including AI-generated feedback and improvements
 */
export const getInterviewResults = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Non-null assertion since middleware guarantees this
    const uid = req.user!.uid;

    const { sessionId } = req.params;
    // Validate required fields.
    if (!sessionId) {
      return next(new ValidationError('Missing required field: sessionId'));
    }

    const interview = await getInterviewWithResults(sessionId);

    // Verify user owns this interview
    const user = await getUserFromFirebaseToken(uid);
    if (!user || interview.userId !== user.id) {
      return next(new ForbiddenError('Forbidden: You do not have access to this interview'));
    }

    res.json({
      interview: {
        score: interview.score,
        improvements: interview.improvements,
        feedback: interview.feedback,
        duration: interview.duration,
        interviewType: interview.interviewType,
        questions: interview.questions,
      },
    });
  } catch (error) {
    // If the error is a known error type, pass it through
    if (error instanceof FirebaseAuthError || 
        error instanceof ValidationError || 
        error instanceof DatabaseError ||
        error instanceof NotFoundError ||
        error instanceof ForbiddenError) {
      return next(error);
    }
    // For unknown errors, use a generic server error
    return next(new UnknownError('Failed to get interview results'));
  }
};

/**
 * Get a specific question by its index position in the question array
 * @param req - The authenticated request object containing question index in params
 * @param res - The response object
 * @returns JSON response with the requested question and its metadata
 * @description Utility endpoint to fetch individual questions by their sequential index
 */
export const getQuestionByIndex = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const uid = req.user!.uid;
    console.log('uid', uid); // TODO: Remove this after implementing session check.

    // TODO: Verify user has session record in data store before returning a question. Returns 403 if not found.

    const { questionIndex } = req.params; 
    // Validate required fields.
    if (!questionIndex) {
      return next(new ValidationError('Missing required field: questionIndex'));
    }
    // Validate question index is a number and is non-negative.
    if (typeof questionIndex !== 'number' || questionIndex < 0) {
      return next(new ValidationError('Invalid questionIndex'));
    }

    const index = parseInt(questionIndex, 10);
    if (isNaN(index) || index < 0) {
      return next(new ValidationError('Invalid questionIndex'));
    }

    const questions = await getAllQuestions();

    if (index < 0 || index >= questions.length) {
      return next(new NotFoundError('Question not found'));
    }

    res.json({
      question: questions[index],
      questionNumber: index + 1,
      totalQuestions: questions.length,
      questionIndex: index,
    });
  } catch (error) {
    // If the error is a known error type, pass it through
    if (error instanceof FirebaseAuthError || 
        error instanceof ValidationError || 
        error instanceof DatabaseError ||
        error instanceof NotFoundError) {
      return next(error);
    }
    // For unknown errors, use a generic server error
    return next(new UnknownError('Failed to get question'));
  }
};
