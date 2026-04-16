import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { InterviewTemplate } from '../models/InterviewTemplate';
import { conductInterview, generateInterviewSummary } from '../services/aiInterviewService';
import CandidateInterviewSession from '../models/CandidateInterviewSession';

const router = Router();

const buildSessionFallbackSummary = (
  candidateName: string,
  jobTitle: string,
  questionsAnswered: number,
  totalQuestions: number,
  durationMinutes: number
) => `## Interview Summary

Candidate: ${candidateName}
Role: ${jobTitle}
Questions Answered: ${questionsAnswered}/${totalQuestions}
Duration: ${durationMinutes} minute(s)

AI summary could not be generated at this time. The transcript has been preserved and can be reviewed manually.`;

// Session storage (in production, use Redis or database)
const activeSessions: Map<
  string,
  {
    templateId: string;
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    questions: Array<{ id: number; text: string; type: string }>;
    currentQuestionIndex: number;
    transcript: Array<{ speaker: string; text: string; timestamp: Date }>;
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
    startedAt: Date;
    status: 'active' | 'completed' | 'abandoned';
  }
> = new Map();

/**
 * Get interview template by shareable link (public)
 */
router.get('/public/:shareableLink', async (req: Request, res: Response) => {
  try {
    const { shareableLink } = req.params;

    const template = await InterviewTemplate.findOne({
      shareableLink,
      status: 'active',
    }).select('-questions.expectedAnswer'); // Hide expected answers

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or no longer available',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: template._id,
        jobPosition: template.jobPosition,
        jobDescription: template.jobDescription,
        interviewType: template.interviewType,
        duration: template.duration,
        questionCount: template.questions.length,
        aiSettings: template.aiSettings,
      },
    });
  } catch (error: any) {
    console.error('Error fetching interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interview details',
    });
  }
});

/**
 * Start an interview session
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { shareableLink, candidateName, candidateEmail } = req.body;

    if (!shareableLink || !candidateName || !candidateEmail) {
      return res.status(400).json({
        success: false,
        message: 'Shareable link, candidate name, and email are required',
      });
    }

    const template = await InterviewTemplate.findOne({
      shareableLink,
      status: 'active',
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create session
    activeSessions.set(sessionId, {
      templateId: template._id.toString(),
      candidateName,
      candidateEmail,
      jobTitle: template.jobPosition,
      questions: template.questions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
      })),
      currentQuestionIndex: 0,
      transcript: [],
      conversationHistory: [],
      startedAt: new Date(),
      status: 'active',
    });

    // Get first question
    const firstQuestion = template.questions[0];

    res.status(200).json({
      success: true,
      data: {
        sessionId,
        jobPosition: template.jobPosition,
        jobDescription: template.jobDescription,
        duration: template.duration,
        totalQuestions: template.questions.length,
        currentQuestion: {
          index: 0,
          text: firstQuestion.text,
          type: firstQuestion.type,
        },
        // All questions sent to frontend so Vapi assistant can embed them in its system prompt
        questions: template.questions.map(q => ({
          id: q.id,
          text: q.text,
          type: q.type,
          // expectedAnswer intentionally excluded
        })),
        aiSettings: template.aiSettings,
      },
    });
  } catch (error: any) {
    console.error('Error starting interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start interview session',
    });
  }
});

/**
 * Persist completed interview results from Vapi flow
 */
router.post('/save-results', async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      conversation,
      transcript = [],
      candidateName,
      candidateEmail,
      jobPosition,
      feedback,
      status = 'completed',
    } = req.body;

    if (!sessionId || !Array.isArray(conversation) || conversation.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'sessionId and a non-empty conversation array are required',
      });
    }

    const activeSession = activeSessions.get(sessionId);

    const fallbackName = typeof candidateName === 'string' ? candidateName : '';
    const fallbackEmail = typeof candidateEmail === 'string' ? candidateEmail : '';
    const fallbackJob = typeof jobPosition === 'string' ? jobPosition : '';

    const resolvedCandidateName = activeSession?.candidateName || fallbackName;
    const resolvedCandidateEmail = activeSession?.candidateEmail || fallbackEmail;
    const resolvedJobPosition = activeSession?.jobTitle || fallbackJob;

    if (!resolvedCandidateName || !resolvedCandidateEmail || !resolvedJobPosition) {
      return res.status(400).json({
        success: false,
        message:
          'Unable to resolve candidate metadata. Provide candidateName, candidateEmail, and jobPosition.',
      });
    }

    const normalizedConversation = conversation
      .map((entry: { question?: string; answer?: string }) => ({
        question: String(entry?.question || '').trim(),
        answer: String(entry?.answer || '(No answer provided)').trim() || '(No answer provided)',
      }))
      .filter((entry: { question: string; answer: string }) => entry.question.length > 0);

    const normalizedTranscript = Array.isArray(transcript)
      ? transcript
          .map((entry: { speaker?: string; text?: string; timestamp?: string }) => {
            const speaker = String(entry?.speaker || '').toLowerCase();
            const normalizedSpeaker = speaker === 'assistant' ? 'assistant' : 'candidate';
            return {
              speaker: normalizedSpeaker,
              text: String(entry?.text || '').trim(),
              timestamp: entry?.timestamp ? new Date(entry.timestamp) : new Date(),
            };
          })
          .filter(
            (entry: { speaker: string; text: string; timestamp: Date }) => entry.text.length > 0
          )
      : [];

    const endedAt = new Date();
    const startedAt = activeSession?.startedAt;
    const durationSeconds = startedAt
      ? Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000))
      : undefined;

    const persisted = await CandidateInterviewSession.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        templateId: activeSession?.templateId,
        candidateName: resolvedCandidateName,
        candidateEmail: resolvedCandidateEmail,
        jobPosition: resolvedJobPosition,
        questions: activeSession?.questions || [],
        conversation: normalizedConversation,
        transcript: normalizedTranscript,
        feedback,
        status,
        startedAt,
        endedAt,
        durationSeconds,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (status !== 'active' && activeSession) {
      activeSessions.delete(sessionId);
    }

    return res.status(200).json({
      success: true,
      data: {
        id: persisted._id,
        sessionId: persisted.sessionId,
        status: persisted.status,
        conversationCount: persisted.conversation.length,
        transcriptCount: persisted.transcript.length,
      },
      message: 'Interview results saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving interview results:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save interview results',
    });
  }
});

/**
 * Submit candidate response and get AI response
 */
router.post('/respond', async (req: Request, res: Response) => {
  try {
    const { sessionId, response: candidateResponse } = req.body;

    if (!sessionId || !candidateResponse) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and response are required',
      });
    }

    const session = activeSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or expired',
      });
    }

    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Interview session is no longer active',
      });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];

    // Add candidate response to transcript
    session.transcript.push({
      speaker: 'Candidate',
      text: candidateResponse,
      timestamp: new Date(),
    });

    // Get AI response
    const aiResponse = await conductInterview({
      candidateName: session.candidateName,
      jobTitle: session.jobTitle,
      currentQuestion: currentQuestion.text,
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions: session.questions.length,
      candidateResponse,
      conversationHistory: session.conversationHistory,
    });

    // Update conversation history
    session.conversationHistory.push(
      { role: 'user', content: candidateResponse },
      { role: 'assistant', content: aiResponse.content }
    );

    // Add AI response to transcript
    session.transcript.push({
      speaker: 'Intervau.AI',
      text: aiResponse.content,
      timestamp: new Date(),
    });

    // Determine next question
    let nextQuestion = null;
    let isComplete = false;

    if (aiResponse.shouldMoveToNext) {
      session.currentQuestionIndex++;

      if (session.currentQuestionIndex >= session.questions.length) {
        isComplete = true;
        session.status = 'completed';
      } else {
        nextQuestion = session.questions[session.currentQuestionIndex];
      }
    }

    res.status(200).json({
      success: true,
      data: {
        aiResponse: aiResponse.content,
        isFollowUp: aiResponse.isFollowUp,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: session.questions.length,
        nextQuestion: nextQuestion
          ? {
              index: session.currentQuestionIndex,
              text: nextQuestion.text,
              type: nextQuestion.type,
            }
          : null,
        isComplete,
      },
    });
  } catch (error: any) {
    console.error('Error processing response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process response',
    });
  }
});

/**
 * End interview and get summary
 */
router.post('/end', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const session = activeSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    session.status = 'completed';

    // Calculate duration
    const duration = Math.round((Date.now() - session.startedAt.getTime()) / 1000 / 60);

    // Generate summary with graceful fallback
    let summary = '';
    try {
      summary = await generateInterviewSummary(
        session.candidateName,
        session.jobTitle,
        session.transcript.map(t => ({ speaker: t.speaker, text: t.text })),
        session.questions.map(q => q.text)
      );
    } catch (summaryError) {
      console.error('Error generating interview summary, using fallback:', summaryError);
      summary = buildSessionFallbackSummary(
        session.candidateName,
        session.jobTitle,
        session.currentQuestionIndex + 1,
        session.questions.length,
        duration
      );
    }

    // Clean up session (in production, save to database)
    activeSessions.delete(sessionId);

    res.status(200).json({
      success: true,
      data: {
        candidateName: session.candidateName,
        jobTitle: session.jobTitle,
        questionsAnswered: session.currentQuestionIndex + 1,
        totalQuestions: session.questions.length,
        duration: `${duration} minutes`,
        transcript: session.transcript,
        summary,
      },
    });
  } catch (error: any) {
    console.error('Error ending interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end interview',
    });
  }
});

/**
 * Get session status
 */
router.get('/:sessionId/status', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = activeSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: session.questions.length,
        startedAt: session.startedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get session status',
    });
  }
});

export default router;
