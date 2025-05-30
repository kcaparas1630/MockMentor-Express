import { Response } from 'express';
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
import logger from '../Config/LoggerConfig';
import { CompletedInterviewQuestion } from '../Types/QuestionsType';

/**
 * Start a new interview session for the authenticated user
 * @param req - The authenticated request object containing user info
 * @param res - The response object
 * @returns JSON response with session details and first question
 * @description Creates a new interview session, validates user profile, and returns the first question
 */
export const startInterview = async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get user data including job role
    const user = await getUserFromFirebaseToken(uid);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const jobRole = user?.profile?.jobRole;
    if (!jobRole) {
      res.status(400).json({ error: 'User job role not found. Please complete your profile.' });
      return;
    }

    // Get all questions for the interview
    const questions = await getAllQuestions();
    if (!questions || questions.length === 0) {
      res.status(404).json({ error: 'No questions available' });
      return;
    }

    const { jobLevel, interviewType } = req.body;
    if (!jobLevel || !interviewType) {
      res.status(400).json({ error: 'Missing required fields: jobLevel, interviewType' });
      return;
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
    logger.error('Error starting interview:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
};

/**
 * Submit user response to the current interview question and get next question or final feedback
 * @param req - The authenticated request object containing session ID, question ID, and user's answer
 * @param res - The response object
 * @returns JSON response with next question and current question feedback, or comprehensive interview feedback if completed
 * @description Saves user's answer, gets AI feedback for current question, progresses to next question, or processes all answers for final AI feedback
 */
export const submitUserResponse = async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { sessionId, questionId, answerResponse, currentQuestionIndex } = req.body;

    // Validate required fields
    if (!sessionId || !questionId || !answerResponse) {
      res
        .status(400)
        .json({ error: 'Missing required fields: sessionId, questionId, answerResponse' });
      return;
    }

    // Get interview session
    const session = await getSession(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Interview session not found' });
      return;
    }

    // Get the question details
    const question = await getQuestionById(questionId);
    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
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
    logger.error('Error in submitUserResponse:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve comprehensive interview results and feedback for a completed interview
 * @param req - The authenticated request object containing session ID in params
 * @param res - The response object
 * @returns JSON response with complete interview data including score, feedback, and questions
 * @description Fetches detailed interview results including AI-generated feedback and improvements
 */
export const getInterviewResults = async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { sessionId } = req.params;
    const interview = await getInterviewWithResults(sessionId);

    if (!interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    // Verify user owns this interview
    const user = await getUserFromFirebaseToken(uid);
    if (!user || interview.userId !== user.id) {
      res.status(403).json({ error: 'Forbidden: You do not have access to this interview' });
      return;
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
    logger.error('Error getting interview results:', error);
    res.status(500).json({ error: 'Failed to get interview results' });
  }
};

/**
 * Get a specific question by its index position in the question array
 * @param req - The authenticated request object containing question index in params
 * @param res - The response object
 * @returns JSON response with the requested question and its metadata
 * @description Utility endpoint to fetch individual questions by their sequential index
 */
export const getQuestionByIndex = async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { questionIndex } = req.params;
    const index = parseInt(questionIndex);

    const questions = await getAllQuestions();

    if (index < 0 || index >= questions.length) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    res.json({
      question: questions[index],
      questionNumber: index + 1,
      totalQuestions: questions.length,
      questionIndex: index,
    });
  } catch (error) {
    logger.error('Error getting question by index:', error);
    res.status(500).json({ error: 'Failed to get question' });
  }
};
