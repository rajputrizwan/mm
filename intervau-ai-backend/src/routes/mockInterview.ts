import { Router, Response } from 'express';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { generateInterviewQuestions } from '../services/aiService';
import MockInterviewSession from '../models/MockInterviewSession';

const router = Router();

// All routes require authentication and candidate role
router.use(authMiddleware);
router.use(roleMiddleware('candidate'));

/**
 * POST /api/interviews/mock-interviews/sessions
 * Create a new mock interview session
 */
router.post('/sessions', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, position, duration, questionCount, difficulty, questions } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Validate required fields
    if (!sessionId || !position || !duration || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sessionId, position, duration, questions',
      });
    }

    // Check if session already exists
    const existingSession = await MockInterviewSession.findOne({ sessionId });
    if (existingSession) {
      return res.status(409).json({
        success: false,
        message: 'Session with this ID already exists',
      });
    }

    // Create new session
    const session = new MockInterviewSession({
      userId,
      sessionId,
      position,
      duration,
      questionCount: questionCount || questions.length,
      difficulty: difficulty || 'intermediate',
      questions,
      status: 'ready',
      systemCheckPassed: false,
      currentQuestionIndex: 0,
    });

    await session.save();

    console.log('✅ Mock interview session created:', sessionId);

    res.status(201).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        position: session.position,
        duration: session.duration,
        questionCount: session.questionCount,
        difficulty: session.difficulty,
        status: session.status,
        questions: session.questions,
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error creating mock interview session:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create mock interview session',
    });
  }
});

/**
 * GET /api/interviews/mock-interviews/sessions/:sessionId
 * Get a mock interview session by ID
 */
router.get('/sessions/:sessionId', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    const session = await MockInterviewSession.findOne({ sessionId, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        position: session.position,
        duration: session.duration,
        questionCount: session.questionCount,
        difficulty: session.difficulty,
        status: session.status,
        systemCheckPassed: session.systemCheckPassed,
        questions: session.questions,
        currentQuestionIndex: session.currentQuestionIndex,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching mock interview session:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch mock interview session',
    });
  }
});

/**
 * PUT /api/interviews/mock-interviews/sessions/:sessionId/system-check
 * Update system check status for a session
 */
router.put('/sessions/:sessionId/system-check', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { passed } = req.body;
    const userId = req.user?.id;

    const session = await MockInterviewSession.findOne({ sessionId, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    session.systemCheckPassed = passed === true;
    await session.save();

    console.log(`✅ System check ${passed ? 'passed' : 'failed'} for session:`, sessionId);

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        systemCheckPassed: session.systemCheckPassed,
      },
    });
  } catch (error) {
    console.error('❌ Error updating system check status:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update system check status',
    });
  }
});

/**
 * PUT /api/interviews/mock-interviews/sessions/:sessionId/start
 * Start a mock interview session
 */
router.put('/sessions/:sessionId/start', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    const session = await MockInterviewSession.findOne({ sessionId, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (!session.systemCheckPassed) {
      return res.status(400).json({
        success: false,
        message: 'System check must pass before starting the interview',
      });
    }

    if (session.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Session is already in progress',
      });
    }

    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Session has already been completed',
      });
    }

    session.status = 'in_progress';
    session.startedAt = new Date();
    session.currentQuestionIndex = 0;

    // Add initial AI greeting to transcript
    session.transcript.push({
      speaker: 'ai',
      text: `Welcome to your mock interview for the ${session.position} position. I'll be asking you ${session.questionCount} questions. Let's begin!`,
      timestamp: new Date(),
      questionIndex: 0,
    });

    await session.save();

    console.log('🎬 Mock interview session started:', sessionId);

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        status: session.status,
        startedAt: session.startedAt,
        currentQuestionIndex: session.currentQuestionIndex,
        firstQuestion: session.questions[0],
      },
    });
  } catch (error) {
    console.error('❌ Error starting mock interview session:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to start mock interview session',
    });
  }
});

/**
 * GET /api/interviews/mock-interviews/sessions
 * Get all mock interview sessions for the current user (history)
 */
router.get('/sessions', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, limit = 10, page = 1 } = req.query;

    const query: Record<string, unknown> = { userId };
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [sessions, total] = await Promise.all([
      MockInterviewSession.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select(
          'sessionId position duration questionCount difficulty status startedAt completedAt createdAt metrics'
        ),
      MockInterviewSession.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        sessions,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching mock interview sessions:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch mock interview sessions',
    });
  }
});

/**
 * POST /api/interviews/mock-interviews/generate-questions
 * Generate AI interview questions based on job details
 */
router.post('/generate-questions', async (req, res) => {
  try {
    const { jobPosition, jobDescription, duration, interviewType } = req.body;

    // Validate required fields
    if (!jobPosition || !jobDescription || !duration || !interviewType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: jobPosition, jobDescription, duration, interviewType',
      });
    }

    console.log('📝 Generating questions for:', {
      jobPosition,
      duration,
      types: interviewType,
    });

    // Call AI service to generate questions
    const questions = await generateInterviewQuestions({
      jobPosition,
      jobDescription,
      duration,
      interviewType,
    });

    res.status(200).json({
      success: true,
      data: {
        questions,
        count: questions.length,
      },
    });
  } catch (error) {
    console.error('❌ Error in generate-questions endpoint:', error);

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate interview questions',
      error:
        process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
    });
  }
});

export default router;
