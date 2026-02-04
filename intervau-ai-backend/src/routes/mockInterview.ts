import { Router, Response } from 'express';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { generateInterviewQuestions } from '../services/aiService';
import { conductInterview, generateInterviewSummary } from '../services/aiInterviewService';
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

/**
 * POST /api/interviews/mock-interviews/sessions/:sessionId/respond
 * Process candidate response and get AI feedback with analytics
 */
router.post('/sessions/:sessionId/respond', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { questionIndex, response: candidateResponse, responseTime } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (candidateResponse === undefined || questionIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: questionIndex, response',
      });
    }

    const session = await MockInterviewSession.findOne({ sessionId, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (session.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Session is not in progress',
      });
    }

    const currentQuestion = session.questions[questionIndex];
    if (!currentQuestion) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index',
      });
    }

    // Add candidate response to transcript
    session.transcript.push({
      speaker: 'candidate',
      text: candidateResponse,
      timestamp: new Date(),
      questionIndex,
    });

    // Analyze response using AI
    const wordCount = candidateResponse.trim().split(/\s+/).length;
    const fillerWords = countFillerWords(candidateResponse);
    const responseTimeSeconds = responseTime || 0;

    // Build conversation history for AI
    const conversationHistory = session.transcript
      .filter(t => t.questionIndex === questionIndex)
      .map(t => ({
        role: t.speaker === 'ai' ? 'assistant' : ('user' as 'system' | 'user' | 'assistant'),
        content: t.text,
      }));

    // Get AI response using conductInterview
    let aiResponse;
    let aiAnalysis;

    try {
      aiResponse = await conductInterview({
        candidateName: 'Candidate',
        jobTitle: session.position,
        currentQuestion: currentQuestion.text,
        currentQuestionIndex: questionIndex,
        totalQuestions: session.questions.length,
        candidateResponse,
        conversationHistory,
      });

      // Calculate metrics based on response analysis
      const baseConfidence = Math.min(
        100,
        Math.max(40, 60 + (wordCount / 10) * 5 - fillerWords * 3)
      );
      const clarity = Math.min(100, Math.max(40, 70 + Math.random() * 15 - fillerWords * 2));
      const pace = calculatePace(wordCount, responseTimeSeconds);
      const technicalScore = calculateTechnicalScore(candidateResponse, currentQuestion.category);

      aiAnalysis = {
        score: Math.round((baseConfidence + clarity + technicalScore) / 3),
        feedback: aiResponse.content,
        strengths: extractStrengths(candidateResponse, wordCount),
        improvements: extractImprovements(fillerWords, wordCount, responseTimeSeconds),
        metrics: {
          confidence: Math.round(baseConfidence),
          clarity: Math.round(clarity),
          pace: Math.round(pace),
          technicalAccuracy: Math.round(technicalScore),
          fillerWords,
          wordCount,
          responseTime: responseTimeSeconds,
        },
      };
    } catch (aiError) {
      console.error('AI analysis error, using fallback:', aiError);
      // Fallback analysis if AI fails
      aiAnalysis = {
        score: 70,
        feedback: "Thank you for your response. Let's continue.",
        strengths: ['Provided a response'],
        improvements: ['Consider providing more detail'],
        metrics: {
          confidence: 70,
          clarity: 70,
          pace: 70,
          technicalAccuracy: 70,
          fillerWords,
          wordCount,
          responseTime: responseTimeSeconds,
        },
      };
      aiResponse = { content: aiAnalysis.feedback, shouldMoveToNext: true, isFollowUp: false };
    }

    // Update question with answer and analysis
    session.questions[questionIndex].answer = candidateResponse;
    session.questions[questionIndex].aiAnalysis = {
      score: aiAnalysis.score,
      feedback: aiAnalysis.feedback,
      strengths: aiAnalysis.strengths,
      improvements: aiAnalysis.improvements,
    };

    // Add AI response to transcript
    session.transcript.push({
      speaker: 'ai',
      text: aiResponse.content,
      timestamp: new Date(),
      questionIndex,
    });

    // Update current question index if moving to next
    if (aiResponse.shouldMoveToNext && questionIndex < session.questions.length - 1) {
      session.currentQuestionIndex = questionIndex + 1;

      // Add next question to transcript
      const nextQuestion = session.questions[questionIndex + 1];
      session.transcript.push({
        speaker: 'ai',
        text: nextQuestion.text,
        timestamp: new Date(),
        questionIndex: questionIndex + 1,
      });
    }

    // Generate real-time tips based on analysis
    const tips = generateRealTimeTips(aiAnalysis.metrics, candidateResponse);

    await session.save();

    console.log(`📝 Response processed for session ${sessionId}, question ${questionIndex + 1}`);

    res.status(200).json({
      success: true,
      data: {
        aiResponse: aiResponse.content,
        shouldMoveToNext: aiResponse.shouldMoveToNext,
        isFollowUp: aiResponse.isFollowUp,
        aiAnalysis,
        tips,
        currentQuestionIndex: session.currentQuestionIndex,
        nextQuestion:
          aiResponse.shouldMoveToNext && questionIndex < session.questions.length - 1
            ? session.questions[questionIndex + 1]
            : null,
      },
    });
  } catch (error) {
    console.error('❌ Error processing response:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process response',
    });
  }
});

/**
 * PUT /api/interviews/mock-interviews/sessions/:sessionId/complete
 * Complete the mock interview session and calculate final metrics
 */
router.put('/sessions/:sessionId/complete', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const session = await MockInterviewSession.findOne({ sessionId, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Session is already completed',
      });
    }

    // Calculate aggregated metrics from all questions
    const answeredQuestions = session.questions.filter(q => q.answer && q.aiAnalysis);

    let totalScore = 0;

    answeredQuestions.forEach(q => {
      if (q.aiAnalysis) {
        totalScore += q.aiAnalysis.score || 0;
      }
    });

    const questionCount = Math.max(answeredQuestions.length, 1);

    // Calculate average metrics
    const avgScore = Math.round(totalScore / questionCount);

    // Calculate metrics based on transcript analysis
    const candidateTranscripts = session.transcript.filter(t => t.speaker === 'candidate');
    const allCandidateText = candidateTranscripts.map(t => t.text).join(' ');
    const overallWordCount = allCandidateText.split(/\s+/).length;
    const overallFillerWords = countFillerWords(allCandidateText);

    // Calculate session duration
    const startTime = session.startedAt || session.createdAt;
    const endTime = new Date();
    const sessionDurationMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
    const avgResponseTime = sessionDurationMinutes / questionCount;

    // Generate final summary using AI
    let summary = '';
    try {
      const transcriptForSummary = session.transcript.map(t => ({
        speaker: t.speaker === 'ai' ? 'Interviewer' : 'Candidate',
        text: t.text,
      }));

      summary = await generateInterviewSummary(
        'Candidate',
        session.position,
        transcriptForSummary,
        session.questions.map(q => q.text)
      );
    } catch (summaryError) {
      console.error('Failed to generate summary:', summaryError);
      summary = 'Interview summary generation failed. Please review the transcript for details.';
    }

    // Update session with final metrics
    session.status = 'completed';
    session.completedAt = new Date();
    session.metrics = {
      overallScore: avgScore || 75,
      confidence: Math.min(
        100,
        Math.max(40, 70 + (overallWordCount / 100) * 5 - overallFillerWords * 2)
      ),
      clarity: Math.min(100, Math.max(40, 75 - overallFillerWords)),
      technicalAccuracy: avgScore || 70,
      communicationSkills: Math.min(100, Math.max(40, 70 + overallWordCount / 50)),
      fillerWords: overallFillerWords,
      averageResponseTime: Math.round(avgResponseTime * 60), // Convert to seconds
    };

    await session.save();

    console.log(`✅ Mock interview session completed: ${sessionId}`);

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        status: session.status,
        completedAt: session.completedAt,
        metrics: session.metrics,
        summary,
        questionsAnswered: answeredQuestions.length,
        totalQuestions: session.questions.length,
      },
    });
  } catch (error) {
    console.error('❌ Error completing session:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to complete session',
    });
  }
});

// Helper functions for response analysis

function countFillerWords(text: string): number {
  const fillerPatterns = [
    /\bum+\b/gi,
    /\buh+\b/gi,
    /\blike\b/gi,
    /\byou know\b/gi,
    /\bbasically\b/gi,
    /\bactually\b/gi,
    /\bi mean\b/gi,
    /\bkind of\b/gi,
    /\bsort of\b/gi,
    /\bi guess\b/gi,
    /\bso+\b/gi,
    /\bwell\b/gi,
  ];

  let count = 0;
  fillerPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  });

  return count;
}

function calculatePace(wordCount: number, responseTimeSeconds: number): number {
  if (responseTimeSeconds <= 0) return 70;

  const wpm = (wordCount / responseTimeSeconds) * 60;

  // Ideal pace is 120-150 WPM
  if (wpm >= 120 && wpm <= 150) return 90;
  if (wpm >= 100 && wpm < 120) return 80;
  if (wpm > 150 && wpm <= 180) return 75;
  if (wpm >= 80 && wpm < 100) return 70;
  if (wpm > 180) return 60; // Too fast
  return 50; // Too slow
}

function calculateTechnicalScore(response: string, category: string): number {
  const technicalKeywords = [
    'algorithm',
    'database',
    'api',
    'framework',
    'architecture',
    'scalable',
    'performance',
    'optimization',
    'testing',
    'deployment',
    'security',
    'authentication',
    'design pattern',
    'microservices',
    'cloud',
    'devops',
    'agile',
    'sprint',
    'code review',
  ];

  const lowerResponse = response.toLowerCase();
  let keywordScore = 0;

  technicalKeywords.forEach(keyword => {
    if (lowerResponse.includes(keyword)) keywordScore += 5;
  });

  const baseScore = category?.toLowerCase().includes('technical') ? 65 : 70;
  return Math.min(100, baseScore + keywordScore);
}

function extractStrengths(response: string, wordCount: number): string[] {
  const strengths: string[] = [];

  if (wordCount > 50) strengths.push('Provided detailed response');
  if (wordCount > 100) strengths.push('Comprehensive explanation');
  if (response.includes('example') || response.includes('instance')) {
    strengths.push('Used concrete examples');
  }
  if (
    response.includes('result') ||
    response.includes('outcome') ||
    response.includes('achieved')
  ) {
    strengths.push('Focused on results');
  }
  if (response.includes('team') || response.includes('collaborated')) {
    strengths.push('Demonstrated teamwork');
  }

  return strengths.length > 0 ? strengths : ['Responded to the question'];
}

function extractImprovements(
  fillerWords: number,
  wordCount: number,
  responseTime: number
): string[] {
  const improvements: string[] = [];

  if (fillerWords > 3) improvements.push('Reduce filler words');
  if (wordCount < 30) improvements.push('Provide more detail in responses');
  if (responseTime > 60) improvements.push('Consider more concise answers');
  if (responseTime < 5 && wordCount < 20) improvements.push('Take time to think before responding');

  return improvements.length > 0 ? improvements : ['Continue practicing'];
}

function generateRealTimeTips(
  metrics: {
    confidence: number;
    clarity: number;
    pace: number;
    fillerWords: number;
    wordCount: number;
  },
  response: string
): Array<{ type: 'success' | 'warning' | 'info'; message: string }> {
  const tips: Array<{ type: 'success' | 'warning' | 'info'; message: string }> = [];

  // Confidence tips
  if (metrics.confidence >= 80) {
    tips.push({ type: 'success', message: 'Great confidence in your response!' });
  } else if (metrics.confidence < 60) {
    tips.push({ type: 'warning', message: 'Try to speak with more conviction' });
  }

  // Filler word tips
  if (metrics.fillerWords === 0) {
    tips.push({ type: 'success', message: 'Excellent! No filler words detected' });
  } else if (metrics.fillerWords > 3) {
    tips.push({ type: 'warning', message: 'Try to reduce filler words (um, uh, like)' });
  }

  // Pace tips
  if (metrics.pace >= 85) {
    tips.push({ type: 'success', message: 'Good speaking pace!' });
  } else if (metrics.pace < 60) {
    tips.push({ type: 'info', message: 'Consider adjusting your speaking pace' });
  }

  // Content tips
  if (metrics.wordCount > 50 && response.includes('example')) {
    tips.push({ type: 'success', message: 'Great use of examples!' });
  }
  if (metrics.wordCount < 20) {
    tips.push({ type: 'info', message: 'Consider elaborating more on your answer' });
  }

  // Eye contact reminder (always shown as info)
  tips.push({ type: 'info', message: 'Maintain eye contact with the camera' });

  return tips.slice(0, 4); // Limit to 4 tips
}

export default router;
