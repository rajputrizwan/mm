import { Router, Response } from 'express';
import { SortOrder } from 'mongoose';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { generateInterviewQuestions } from '../services/aiService';
import { conductInterview, generateInterviewSummary } from '../services/aiInterviewService';
import MockInterviewSession, { IMockInterviewSession } from '../models/MockInterviewSession';

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
    const { sessionId, position, jobDescription, duration, questionCount, difficulty, questions } =
      req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Validate required fields
    if (
      !sessionId ||
      !position ||
      !jobDescription ||
      !duration ||
      !questions ||
      !Array.isArray(questions)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: sessionId, position, jobDescription, duration, questions',
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
      jobDescription,
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
 * GET /api/interviews/mock-interviews/history
 * Get completed mock interview sessions for the current user (v2 history list).
 * Query: limit (default 20), page (default 1).
 */
router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = 20, page = 1 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [sessions, total] = await Promise.all([
      MockInterviewSession.find({ userId, status: 'completed' })
        .sort({ completedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      MockInterviewSession.countDocuments({ userId, status: 'completed' }),
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
    console.error('❌ Error fetching mock interview history:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch mock interview history',
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
        transcript: session.transcript,
        metrics: session.metrics,
        summary: session.summary,
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
 * Get all mock interview sessions for the current user (history).
 * Query: status (e.g. 'completed'), limit, page, full (if 'true' return full documents for v2 history).
 */
router.get('/sessions', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, limit = 10, page = 1, full } = req.query;

    const query: Record<string, unknown> = { userId };
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const useFull = String(full).toLowerCase() === 'true';
    const sort: Record<string, SortOrder> =
      status === 'completed' ? { completedAt: 'desc', createdAt: 'desc' } : { createdAt: 'desc' };

    const baseQuery = MockInterviewSession.find(query).sort(sort).skip(skip).limit(Number(limit));

    const [sessions, total] = await Promise.all([
      useFull
        ? baseQuery.lean()
        : baseQuery.select(
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
        strengths: extractStrengths(candidateResponse, wordCount, currentQuestion.category),
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
 * Complete the mock interview session and calculate final metrics.
 * Body (optional, for VAPI/voice flow): { transcript, qaPairs, durationSeconds }
 * When body is provided, transcript and per-question answers are stored and pattern metrics are computed.
 */
router.put('/sessions/:sessionId/complete', async (req: AuthRequest, res: Response) => {
  console.log(`\n🚀 [START] Completing session: ${req.params.sessionId}`);
  console.log(`📦 Request body keys:`, Object.keys(req.body));

  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;
    const body = req.body as {
      transcript?: Array<{ speaker: 'ai' | 'candidate'; text: string; timestamp: string }>;
      qaPairs?: Array<{ question: string; answer: string }>;
      durationSeconds?: number;
      speakingPatterns?: {
        fillerWords: number;
        avgResponseTimeSeconds: number;
        totalWords: number;
        avgWordsPerMinute: number;
      };
    };

    console.log(`🔐 User ID: ${userId || 'Not authenticated'}`);

    if (!userId) {
      console.log(`❌ Authentication failed: No user ID`);
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    console.log(`🔍 Finding session: ${sessionId}`);
    const session = await MockInterviewSession.findOne({ sessionId, userId });

    if (!session) {
      console.log(`❌ Session not found: ${sessionId}`);
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    console.log(`📊 Session found:`, {
      id: session._id,
      status: session.status,
      questionCount: session.questions.length,
      transcriptCount: session.transcript?.length || 0,
    });

    // Log existing transcript if any
    if (session.transcript && session.transcript.length > 0) {
      console.log(`📜 EXISTING TRANSCRIPT (${session.transcript.length} entries):`);
      session.transcript.forEach((t, i) => {
        console.log(
          `  [${i}] ${t.speaker.toUpperCase()}: ${t.text.substring(0, 100)}${t.text.length > 100 ? '...' : ''}`
        );
      });
    } else {
      console.log(`📜 No existing transcript`);
    }

    if (session.status === 'completed') {
      console.log(`⚠️ Session already completed: ${sessionId}`);
      return res.status(400).json({
        success: false,
        message: 'Session is already completed',
      });
    }

    const startTime = session.startedAt || session.createdAt;
    const endTime = new Date();
    const sessionDurationMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
    console.log(`⏱️ Session duration: ${sessionDurationMinutes.toFixed(2)} minutes`);

    let questionsAnsweredCount = 0;

    // --- VAPI/voice flow: payload with transcript ---
    if (body?.transcript && Array.isArray(body.transcript) && body.transcript.length > 0) {
      console.log(`\n🎙️ PROCESSING VOICE/TRANSCRIPT FLOW`);
      console.log(`📝 RAW TRANSCRIPT PAYLOAD (${body.transcript.length} entries):`);
      body.transcript.forEach((t, i) => {
        console.log(`  [${i}] ${t.speaker.toUpperCase()} at ${t.timestamp}: "${t.text}"`);
      });

      console.log(`📝 QA Pairs present: ${body.qaPairs?.length || 0}`);
      if (body.qaPairs && body.qaPairs.length > 0) {
        console.log(`📝 RAW QA PAIRS:`);
        body.qaPairs.forEach((qa, i) => {
          console.log(`  Q${i}: "${qa.question.substring(0, 50)}..."`);
          console.log(`  A${i}: "${qa.answer.substring(0, 50)}..."`);
        });
      }

      const transcriptPayload = body.transcript;

      // Derive answer groups from payload (merge consecutive candidate messages)
      console.log(`\n🔄 DERIVING ANSWER GROUPS FROM TRANSCRIPT...`);
      const answerGroups: string[] = [];
      let currentAnswer: string[] = [];

      for (let i = 0; i < transcriptPayload.length; i++) {
        const entry = transcriptPayload[i];
        console.log(`  Processing [${i}]: ${entry.speaker} - "${entry.text.substring(0, 30)}..."`);

        if (entry.speaker === 'candidate') {
          currentAnswer.push(entry.text.trim());
          console.log(`    Added to current answer (now ${currentAnswer.length} parts)`);
        } else {
          if (currentAnswer.length > 0) {
            const mergedAnswer = currentAnswer.join(' ').trim();
            answerGroups.push(mergedAnswer);
            console.log(
              `    ✅ Completed answer group ${answerGroups.length}: "${mergedAnswer.substring(0, 50)}..."`
            );
            currentAnswer = [];
          }
        }
      }

      if (currentAnswer.length > 0) {
        const mergedAnswer = currentAnswer.join(' ').trim();
        answerGroups.push(mergedAnswer);
        console.log(
          `    ✅ Final answer group ${answerGroups.length}: "${mergedAnswer.substring(0, 50)}..."`
        );
      }

      console.log(`✅ DERIVED ${answerGroups.length} ANSWER GROUPS:`);
      answerGroups.forEach((ans, i) => {
        console.log(`  Group ${i + 1}: "${ans.substring(0, 100)}${ans.length > 100 ? '...' : ''}"`);
      });

      /** Match grouped answers to session question count (pad; merge overflow into last slot). */
      const alignAnswerGroupsToQuestionCount = (groups: string[], numQ: number): string[] => {
        if (numQ === 0) return [];
        if (groups.length === 0) return Array(numQ).fill('');
        if (groups.length <= numQ) {
          return [...groups, ...Array(numQ - groups.length).fill('')];
        }
        const head = groups.slice(0, numQ - 1);
        const tail = groups.slice(numQ - 1).join(' ').trim();
        return [...head, tail];
      };

      // Build full transcript array so Mongoose persists all entries
      console.log(`\n📋 BUILDING TRANSCRIPT ARRAY WITH QUESTION INDICES...`);
      const newTranscript = transcriptPayload.map((t, idx) => {
        console.log(`  Processing entry ${idx} for timestamp conversion`);
        return {
          speaker: t.speaker,
          text: t.text,
          timestamp: new Date(t.timestamp),
          questionIndex: undefined as number | undefined,
        };
      });

      // One question index per candidate *turn* (not per transcript chunk): advance only when
      // speaker switches from candidate → ai, so split user utterances stay on the same question.
      const numQs = session.questions.length;
      const lastQ = Math.max(0, numQs - 1);
      let qIdx = 0;
      let prevWasCandidate = false;
      for (let i = 0; i < newTranscript.length; i++) {
        const isCandidate = newTranscript[i].speaker === 'candidate';
        if (isCandidate) {
          newTranscript[i].questionIndex = Math.min(Math.max(0, qIdx), lastQ);
          console.log(`  Entry ${i} (candidate) → questionIndex: ${newTranscript[i].questionIndex}`);
        } else {
          if (prevWasCandidate) {
            qIdx++;
            prevWasCandidate = false;
          }
          newTranscript[i].questionIndex = Math.min(Math.max(0, qIdx), lastQ);
          console.log(`  Entry ${i} (ai) → questionIndex: ${newTranscript[i].questionIndex}`);
        }
        if (isCandidate) prevWasCandidate = true;
      }

      console.log(`✅ FINAL TRANSCRIPT WITH INDICES:`);
      newTranscript.forEach((t, i) => {
        console.log(`  [${i}] ${t.speaker} (Q${t.questionIndex}): "${t.text.substring(0, 50)}..."`);
      });

      session.transcript = newTranscript;
      session.markModified('transcript');

      // Prefer transcript-derived answer groups (consecutive candidate lines merged). They match how
      // Vapi splits one spoken answer into many finals. qaPairs are fallback for older clients.
      const durationSeconds = body.durationSeconds ?? sessionDurationMinutes * 60;
      const numQuestions = session.questions.length;
      console.log(`\n📝 PREPARING ANSWERS FOR ANALYSIS (${numQuestions} questions)`);

      const answersToUse =
        answerGroups.length > 0
          ? alignAnswerGroupsToQuestionCount(answerGroups, numQuestions)
          : body.qaPairs && body.qaPairs.length > 0
            ? alignAnswerGroupsToQuestionCount(
                body.qaPairs.map(qa => (qa.answer ?? '').trim()),
                numQuestions
              )
            : Array(numQuestions).fill('');

      questionsAnsweredCount = answersToUse.length;
      console.log(`📝 Using ${questionsAnsweredCount} answers for analysis:`);
      answersToUse.forEach((ans, i) => {
        console.log(`  Answer ${i + 1}: "${ans.substring(0, 80)}${ans.length > 80 ? '...' : ''}"`);
      });

      let totalWords = 0;
      let totalFillerWords = 0;
      let totalScore = 0;
      const responseTimePerQuestion =
        answersToUse.length > 0 ? durationSeconds / answersToUse.length : 0;
      console.log(
        `\n⚙️ ANALYZING EACH ANSWER (response time per Q: ${responseTimePerQuestion.toFixed(2)}s)...`
      );

      answersToUse.forEach((answerText, index) => {
        const question = session.questions[index];
        if (!question) {
          console.log(`  ⚠️ Question ${index + 1} not found, skipping`);
          return;
        }

        console.log(`\n  --- Question ${index + 1}: "${question.text.substring(0, 50)}..." ---`);

        const normalizedAnswer =
          answerText.replace(/\(no answer provided\)/gi, '').trim() || answerText;
        question.answer = normalizedAnswer;
        console.log(`  Normalized answer: "${normalizedAnswer.substring(0, 80)}..."`);

        const wordCount = normalizedAnswer.split(/\s+/).filter(Boolean).length;
        const fillerWords = countFillerWords(normalizedAnswer);
        totalWords += wordCount;
        totalFillerWords += fillerWords;
        console.log(`  Word count: ${wordCount}, Filler words: ${fillerWords}`);

        const technicalScore = calculateTechnicalScore(normalizedAnswer, question.category || '');
        const confidence = Math.min(100, Math.max(40, 60 + (wordCount / 10) * 5 - fillerWords * 3));
        const clarity = Math.min(100, Math.max(40, 75 - fillerWords * 2));
        const pace = calculatePace(wordCount, responseTimePerQuestion);
        const score = Math.round((confidence + clarity + technicalScore + pace) / 4);
        totalScore += score;

        console.log(
          `  Scores - Tech: ${technicalScore}, Conf: ${confidence}, Clarity: ${clarity}, Pace: ${pace}`
        );
        console.log(`  → Final score: ${score}`);

        const strengths = extractStrengths(normalizedAnswer, wordCount, question.category);
        const improvements = extractImprovements(fillerWords, wordCount, responseTimePerQuestion);
        console.log(`  Strengths: ${strengths.join(', ') || 'None'}`);
        console.log(`  Improvements: ${improvements.join(', ') || 'None'}`);

        question.aiAnalysis = {
          score,
          feedback: wordCount > 0 ? 'Voice response recorded and analyzed.' : 'No answer provided.',
          strengths: Array.isArray(strengths) ? strengths : [],
          improvements: Array.isArray(improvements) ? improvements : [],
        };
      });

      // Ensure every question has aiAnalysis
      session.questions.forEach((q, i) => {
        if (!q.aiAnalysis) {
          console.log(`  ⚠️ Question ${i + 1} missing aiAnalysis, adding default`);
          q.aiAnalysis = {
            score: 0,
            feedback: 'No answer provided.',
            strengths: [],
            improvements: [],
          };
        }
      });

      const avgScore =
        questionsAnsweredCount > 0 ? Math.round(totalScore / questionsAnsweredCount) : 75;
      const durationMinutes = durationSeconds / 60;
      const fp = body.speakingPatterns;
      const fillerWordsMetric = fp ? fp.fillerWords : totalFillerWords;
      const totalWordsMetric = fp ? fp.totalWords : totalWords;
      const speakingPaceWPMMetric = fp
        ? fp.avgWordsPerMinute
        : durationMinutes > 0
          ? Math.round(totalWords / durationMinutes)
          : 0;
      const avgResponseTimeMetric = fp
        ? fp.avgResponseTimeSeconds
        : Math.round(responseTimePerQuestion * 10) / 10;

      console.log(`\n📊 METRICS CALCULATED:`);
      console.log(`  - Average Score: ${avgScore}`);
      console.log(`  - Total Words: ${totalWordsMetric}`);
      console.log(`  - Filler Words: ${fillerWordsMetric}`);
      console.log(`  - Speaking Pace: ${speakingPaceWPMMetric} WPM`);
      console.log(`  - Avg Response Time: ${avgResponseTimeMetric}s`);

      session.metrics = {
        overallScore: avgScore,
        confidence: Math.min(
          100,
          Math.max(40, 70 + (totalWordsMetric / 100) * 5 - fillerWordsMetric * 2)
        ),
        clarity: Math.min(100, Math.max(40, 75 - fillerWordsMetric)),
        technicalAccuracy: avgScore,
        communicationSkills: Math.min(100, Math.max(40, 70 + totalWordsMetric / 50)),
        fillerWords: fillerWordsMetric,
        averageResponseTime: avgResponseTimeMetric,
        totalWordsSpoken: totalWordsMetric,
        speakingPaceWPM: speakingPaceWPMMetric,
        overallRating:
          avgScore >= 85
            ? 'Excellent'
            : avgScore >= 70
              ? 'Good'
              : avgScore >= 55
                ? 'Average'
                : 'Needs Improvement',
        recommendation: avgScore >= 70 ? 'Move to Next Round' : 'Practice and retry',
        aiAnalysisPercentage: Math.min(100, avgScore + 5),
        resumeMatchPercentage: Math.min(100, avgScore + Math.floor(Math.random() * 5)),
      };
      session.markModified('questions');
      console.log(`✅ Voice flow processing complete`);
    } else {
      console.log(`\n📝 PROCESSING TEXT FLOW (no transcript payload)`);
    }

    // --- If no payload: use existing transcript/answers (text flow) ---
    const answeredQuestions = session.questions.filter(q => q.answer && q.aiAnalysis);
    const questionCount = Math.max(answeredQuestions.length, 1);
    const effectiveQuestionsAnswered =
      questionsAnsweredCount > 0 ? questionsAnsweredCount : answeredQuestions.length;
    console.log(
      `\n📊 QUESTIONS ANSWERED: ${effectiveQuestionsAnswered}/${session.questions.length}`
    );

    if (answeredQuestions.length > 0) {
      console.log(`📝 ANSWERED QUESTIONS DETAILS:`);
      answeredQuestions.forEach((q, i) => {
        console.log(
          `  Q${i + 1}: Score: ${q.aiAnalysis?.score}, Answer: "${q.answer?.substring(0, 50)}..."`
        );
      });
    }

    if (!session.metrics) {
      console.log(`\n📊 CALCULATING METRICS FROM EXISTING DATA...`);
      let totalScore = 0;
      answeredQuestions.forEach((q, i) => {
        if (q.aiAnalysis) {
          totalScore += q.aiAnalysis.score || 0;
          console.log(`  Q${i + 1} score: ${q.aiAnalysis.score}`);
        }
      });
      const avgScore = Math.round(totalScore / questionCount);

      const candidateTranscripts = session.transcript.filter(t => t.speaker === 'candidate');
      console.log(`\n📜 CANDIDATE TRANSCRIPTS (${candidateTranscripts.length}):`);
      candidateTranscripts.forEach((t, i) => {
        console.log(`  [${i}] "${t.text.substring(0, 80)}..."`);
      });

      const allCandidateText = candidateTranscripts.map(t => t.text).join(' ');
      const overallWordCount = allCandidateText.split(/\s+/).length;
      const overallFillerWords = countFillerWords(allCandidateText);
      const avgResponseTime = sessionDurationMinutes / questionCount;

      console.log(`\n📊 TEXT FLOW METRICS:`);
      console.log(`  - Average Score: ${avgScore}`);
      console.log(`  - Total Words: ${overallWordCount}`);
      console.log(`  - Filler Words: ${overallFillerWords}`);
      console.log(`  - Avg Response Time: ${avgResponseTime.toFixed(2)} min`);

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
        averageResponseTime: Math.round(avgResponseTime * 60),
        totalWordsSpoken: overallWordCount,
        speakingPaceWPM:
          sessionDurationMinutes > 0 ? Math.round(overallWordCount / sessionDurationMinutes) : 0,
        overallRating:
          (avgScore || 75) >= 85 ? 'Excellent' : (avgScore || 75) >= 70 ? 'Good' : 'Average',
        recommendation: (avgScore || 75) >= 70 ? 'Move to Next Round' : 'Practice and retry',
        aiAnalysisPercentage: Math.min(100, (avgScore || 75) + 5),
        resumeMatchPercentage: Math.min(100, (avgScore || 75) + Math.floor(Math.random() * 5)),
      };
    }

    // Generate final summary using AI (OpenRouter)
    console.log(`\n🤖 GENERATING AI SUMMARY...`);
    let summaryText = '';
    try {
      const transcriptForSummary = session.transcript.map(t => ({
        speaker: t.speaker === 'ai' ? 'Interviewer' : 'Candidate',
        text: t.text,
      }));

      console.log(`📝 TRANSCRIPT FOR SUMMARY (${transcriptForSummary.length} entries):`);
      transcriptForSummary.forEach((t, i) => {
        console.log(`  [${i}] ${t.speaker}: "${t.text.substring(0, 80)}..."`);
      });

      if (transcriptForSummary.length > 0) {
        console.log(`📝 Generating summary from ${transcriptForSummary.length} transcript entries`);
        summaryText = await generateInterviewSummary(
          'Candidate',
          session.position,
          transcriptForSummary,
          session.questions.map(q => q.text)
        );
        console.log(`✅ SUMMARY GENERATED (${summaryText.length} chars):`);
        console.log(`  "${summaryText.substring(0, 200)}..."`);
      } else {
        console.log(`⚠️ No transcript available for summary generation`);
      }
    } catch (summaryError) {
      console.error('❌ Failed to generate summary:', summaryError);
    }

    if (!summaryText && session.metrics) {
      console.log(`\n📝 USING FALLBACK SUMMARY`);
      summaryText = buildFallbackSummary(
        session.metrics,
        session.position,
        effectiveQuestionsAnswered,
        session.questions.length
      );
      console.log(`  "${summaryText.substring(0, 200)}..."`);
    }
    if (!summaryText) {
      summaryText =
        'Interview summary could not be generated. Please review the transcript for details.';
    }

    console.log(`\n📋 PARSING SUMMARY MARKDOWN...`);
    let structured = parseSummaryMarkdown(summaryText);
    if (session.metrics) {
      structured = enrichSummaryStructured(session, structured, session.metrics);
    }
    const summaryArraysSanitized: SummaryStructured = {
      strengths: (structured.strengths ?? []).filter(s => !isSummaryBulletJunk(s)),
      areasForImprovement: (structured.areasForImprovement ?? []).filter(s => !isSummaryBulletJunk(s)),
      recommendations: (structured.recommendations ?? []).filter(s => !isSummaryBulletJunk(s)),
      keyInsights: (structured.keyInsights ?? []).filter(s => !isSummaryBulletJunk(s)),
    };
    console.log(`  Strengths: ${summaryArraysSanitized.strengths.length}`);
    console.log(`  Areas for Improvement: ${summaryArraysSanitized.areasForImprovement.length}`);
    console.log(`  Recommendations: ${summaryArraysSanitized.recommendations.length}`);
    console.log(`  Key Insights: ${summaryArraysSanitized.keyInsights.length}`);

    session.summary = {
      text: summaryText,
      strengths: summaryArraysSanitized.strengths,
      areasForImprovement: summaryArraysSanitized.areasForImprovement,
      recommendations: summaryArraysSanitized.recommendations,
      keyInsights: summaryArraysSanitized.keyInsights,
    };
    session.markModified('summary');
    session.status = 'completed';
    session.completedAt = new Date();

    console.log(`\n💾 SAVING SESSION TO DATABASE...`);
    await session.save();

    console.log(`\n✅✅ MOCK INTERVIEW SESSION COMPLETED SUCCESSFULLY: ${sessionId}`);
    console.log(
      `📊 FINAL METRICS:`,
      JSON.stringify(
        {
          overallScore: session.metrics?.overallScore,
          overallRating: session.metrics?.overallRating,
          confidence: session.metrics?.confidence,
          clarity: session.metrics?.clarity,
          technicalAccuracy: session.metrics?.technicalAccuracy,
          fillerWords: session.metrics?.fillerWords,
          totalWordsSpoken: session.metrics?.totalWordsSpoken,
          questionsAnswered: effectiveQuestionsAnswered,
          totalQuestions: session.questions.length,
        },
        null,
        2
      )
    );

    const questionInsights = session.questions.map(q => ({
      id: q.id,
      category: q.category,
      difficulty: q.difficulty,
      score: q.aiAnalysis?.score,
      improvements: q.aiAnalysis?.improvements ?? [],
      strengths: q.aiAnalysis?.strengths ?? [],
      feedback: q.aiAnalysis?.feedback,
    }));

    console.log(`\n📤 SENDING RESPONSE...`);
    res.status(200).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        status: session.status,
        completedAt: session.completedAt,
        metrics: session.metrics,
        summary: session.summary?.text ?? summaryText,
        summaryStructured: session.summary,
        questionInsights,
        questionsAnswered: effectiveQuestionsAnswered,
        totalQuestions: session.questions.length,
      },
    });

    console.log(`✅ Response sent successfully`);
  } catch (error) {
    console.error('\n❌❌ ERROR COMPLETING SESSION:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to complete session',
    });
  }
});

type SummaryStructured = {
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  keyInsights: string[];
};

/** Remove ASCII/Unicode asterisk-like chars and invisible space (models / PDFs sometimes use U+FF0A etc.). */
function stripSummaryMarkdownNoise(s: string): string {
  return s
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[*＊‧·∗⁎⁕✱✲✳❄]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Drop fragments from broken markdown parsing (e.g. "s:**" from a truncated "**Strengths**:" line).
 */
function isSummaryBulletJunk(s: string): boolean {
  const raw = stripSummaryMarkdownNoise(s);
  if (!raw) return true;
  const rawCompact = raw.replace(/\s/g, '');
  // Truncated "**Strengths**:" → "s:**" or "s:" (ASCII or full-width asterisks stripped)
  if (/^s[\s.:_*·‧]*$/i.test(rawCompact) || /^s:?\*?$/i.test(rawCompact)) return true;

  const t = raw;
  if (t.length < 2) return true;
  if (/^s:?$/i.test(t) || /^s:$/i.test(t)) return true;
  // Section-title fragments mistaken for bullets
  if (/^(key\s+)?strengths?:?\s*$/i.test(t)) return true;
  if (/^key\s*$/i.test(t)) return true;
  if (/^areas?\s*(for\s+improvement)?\s*:?\s*$/i.test(t)) return true;
  if (/^recommendations?:?\s*$/i.test(t)) return true;
  if (/^insights?:?\s*$/i.test(t)) return true;
  if (/^[:*\-_.•]+$/.test(t)) return true;
  if (/^#{1,3}$/.test(t)) return true;
  return false;
}

function pushUniqueNormalized(arr: string[], item: string, seen: Set<string>) {
  const t = item.replace(/\s+/g, ' ').trim();
  if (!t || isSummaryBulletJunk(t)) return;
  const k = t.toLowerCase();
  if (seen.has(k)) return;
  seen.add(k);
  arr.push(t);
}

/** Merge parsed summary with per-question AI analysis and metrics so UI always has actionable items. */
function enrichSummaryStructured(
  session: IMockInterviewSession,
  parsed: SummaryStructured,
  metrics: NonNullable<IMockInterviewSession['metrics']>
): SummaryStructured {
  const seenS = new Set<string>();
  const seenI = new Set<string>();
  const seenR = new Set<string>();
  const seenK = new Set<string>();

  const out: SummaryStructured = {
    strengths: [],
    areasForImprovement: [],
    recommendations: [],
    keyInsights: [],
  };

  for (const s of parsed.strengths) pushUniqueNormalized(out.strengths, s, seenS);
  for (const s of parsed.areasForImprovement) pushUniqueNormalized(out.areasForImprovement, s, seenI);
  for (const s of parsed.recommendations) pushUniqueNormalized(out.recommendations, s, seenR);
  for (const s of parsed.keyInsights) pushUniqueNormalized(out.keyInsights, s, seenK);

  for (const q of session.questions) {
    for (const s of q.aiAnalysis?.strengths ?? []) pushUniqueNormalized(out.strengths, s, seenS);
    for (const s of q.aiAnalysis?.improvements ?? []) pushUniqueNormalized(out.areasForImprovement, s, seenI);
  }

  const words = metrics.totalWordsSpoken ?? 0;
  const nq = session.questions.length || 1;
  const wordsPerQ = words / nq;
  if (wordsPerQ < 40 && session.questions.length > 0) {
    pushUniqueNormalized(
      out.areasForImprovement,
      'Add more detail per answer: context, actions you took, and measurable results',
      seenI
    );
  }
  const wpm = metrics.speakingPaceWPM ?? 0;
  if (wpm > 0 && wpm < 90) {
    pushUniqueNormalized(
      out.areasForImprovement,
      'Speaking pace was on the low side — practice concise answers while staying clear',
      seenI
    );
  }
  if ((metrics.technicalAccuracy ?? 0) < 70) {
    pushUniqueNormalized(
      out.areasForImprovement,
      'Technical answers: name specific tools, trade-offs, and how you validated your approach',
      seenI
    );
  }
  if ((metrics.clarity ?? 0) < 72) {
    pushUniqueNormalized(
      out.areasForImprovement,
      'Structure answers with a clear beginning, middle (what you did), and outcome',
      seenI
    );
  }

  if (out.strengths.length === 0) pushUniqueNormalized(out.strengths, 'Completed the mock interview', seenS);
  if (out.areasForImprovement.length === 0) {
    pushUniqueNormalized(
      out.areasForImprovement,
      'Keep practicing: rehearse aloud and time yourself on common role questions',
      seenI
    );
  }

  const recLine =
    metrics.recommendation ??
    ((metrics.overallScore ?? 0) >= 70 ? 'Move to Next Round' : 'Practice and retry');
  if (out.recommendations.length === 0) pushUniqueNormalized(out.recommendations, recLine, seenR);

  pushUniqueNormalized(
    out.recommendations,
    'Focus next practice on the categories below where your per-question feedback flags improvements',
    seenR
  );

  return {
    strengths: out.strengths.filter(s => !isSummaryBulletJunk(s)),
    areasForImprovement: out.areasForImprovement.filter(s => !isSummaryBulletJunk(s)),
    recommendations: out.recommendations.filter(s => !isSummaryBulletJunk(s)),
    keyInsights: out.keyInsights.filter(s => !isSummaryBulletJunk(s)),
  };
}

function simpleStringHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickVariant<T>(variants: readonly T[], seed: number): T {
  if (variants.length === 0) throw new Error('pickVariant: empty');
  return variants[seed % variants.length];
}

/** Build a fallback summary from metrics when AI summary fails */
function buildFallbackSummary(
  metrics: NonNullable<IMockInterviewSession['metrics']>,
  position: string,
  questionsAnswered: number,
  totalQuestions: number
): string {
  const score = metrics.overallScore ?? 0;
  const rating =
    metrics.overallRating ?? (score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Average');
  const recommendation =
    metrics.recommendation ?? (score >= 70 ? 'Move to Next Round' : 'Practice and retry');
  const seed = simpleStringHash(
    `${position}|${score}|${metrics.totalWordsSpoken ?? 0}|${metrics.fillerWords ?? 0}|${metrics.confidence ?? 0}|${questionsAnswered}`
  );

  const strengths: string[] = [];
  const improvements: string[] = [];
  const recs: string[] = [];
  if ((metrics.totalWordsSpoken ?? 0) > 100) {
    strengths.push(
      pickVariant(
        [
          'Answers had useful depth overall',
          'You shared substantive detail across questions',
          'Responses went beyond one-line answers in several places',
        ],
        seed
      )
    );
  }
  if ((metrics.fillerWords ?? 0) === 0) {
    strengths.push(
      pickVariant(
        [
          'Very few filler words while speaking',
          'Clean delivery with little hesitation phrasing',
          'Speech stayed focused without heavy um/uh usage',
        ],
        seed + 1
      )
    );
  }
  if ((metrics.confidence ?? 0) >= 70) {
    strengths.push(
      pickVariant(
        [
          'Steady confidence came through in delivery',
          'Tone and pacing suggested self-assurance',
          'You sounded composed while answering',
        ],
        seed + 2
      )
    );
  }
  if ((metrics.fillerWords ?? 0) > 2)
    improvements.push('Reduce filler words (um, uh, like) between ideas');
  if ((metrics.totalWordsSpoken ?? 0) < 50 && questionsAnswered > 0)
    improvements.push('Add examples with context, actions, and measurable outcomes');
  if ((metrics.technicalAccuracy ?? 0) < 70)
    improvements.push('Name specific tools, trade-offs, and how you validated decisions');
  if (strengths.length === 0)
    strengths.push(
      pickVariant(
        [
          'You completed the full mock interview',
          'You stayed in the conversation through every question',
          'You finished the practice session end-to-end',
        ],
        seed + 3
      )
    );
  if (improvements.length === 0) {
    improvements.push(
      pickVariant(
        [
          'Keep building structure: situation, what you did, and result',
          'Practice one STAR-style story per common question type',
          'Rehearse tying each answer back to the role’s core skills',
        ],
        seed + 4
      )
    );
  }
  recs.push(recommendation);
  if (score < 75)
    recs.push('Map 2–3 stories to keywords in the job description and rehearse them aloud');
  recs.push('Use per-question feedback below to choose your next practice focus');
  return `## Mock Interview Summary – ${position}\n\n**Overall Score:** ${score}/100\n**Rating:** ${rating}\n\n**Recommendation:** ${recommendation}\n\n**Key Strengths:**\n${strengths.map(s => `- ${s}`).join('\n')}\n\n**Areas for Improvement:**\n${improvements.map(i => `- ${i}`).join('\n')}\n\n**Recommendations:**\n${recs.map(r => `- ${r}`).join('\n')}\n\nQuestions answered: ${questionsAnswered}/${totalQuestions}. Response time avg: ${metrics.averageResponseTime?.toFixed(1) ?? '—'}s. Words spoken: ${metrics.totalWordsSpoken ?? 0}.`;
}

/** Next markdown section header like **Key Strengths:** (any order in document). */
const SUMMARY_NEXT_SECTION_HDR =
  /\r?\n\s*\*{0,2}\s*(?:Key\s+Strengths|Areas?\s+for\s+Improvement|Recommendation|Recommendations?|Key\s+Insights)\s*\*{0,2}\s*:/i;

function extractBulletListAfterHeader(markdown: string, headerRegex: RegExp): string[] {
  const m = markdown.match(headerRegex);
  if (!m || m.index === undefined) return [];
  const tail = markdown.slice(m.index + m[0].length);
  const nextSame = tail.search(SUMMARY_NEXT_SECTION_HDR);
  const qLine = tail.search(/\r?\n\s*Questions answered\b/i);
  let end = tail.length;
  if (nextSame >= 0) end = Math.min(end, nextSame);
  if (qLine >= 0) end = Math.min(end, qLine);
  const body = tail.slice(0, end);
  const items: string[] = [];
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const bm = line.match(/^\s*[-*•–—]\s+(.+)$/);
    if (bm) {
      const item = stripSummaryMarkdownNoise(bm[1].trim());
      if (item && !isSummaryBulletJunk(item)) items.push(item);
    }
  }
  return items;
}

/** `**Recommendation:** Practice and retry` on its own line (before or after other sections). */
function extractInlineRecommendationLine(markdown: string): string | null {
  const m = markdown.match(
    /(?:^|\r?\n)\s*\*{0,2}\s*Recommendation\s*\*{0,2}\s*:\s*([^\r\n]+)/i
  );
  if (!m) return null;
  const v = stripSummaryMarkdownNoise(m[1].trim());
  if (!v || isSummaryBulletJunk(v)) return null;
  return v;
}

function dedupeSummaryLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of lines) {
    const k = x.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(x.replace(/\s+/g, ' ').trim());
  }
  return out;
}

/**
 * Parse AI / fallback summary markdown into structured arrays.
 * Section-based extraction (not line state machine) so bullets are not lost when **Recommendation:**
 * appears before **Key Strengths:**, or when dash bullets differ (– vs -).
 */
function parseSummaryMarkdown(markdown: string): SummaryStructured {
  const strengths = extractBulletListAfterHeader(
    markdown,
    /(?:^|\r?\n)\s*\*{0,2}\s*Key\s+Strengths\s*\*{0,2}\s*:/i
  );
  const areasForImprovement = extractBulletListAfterHeader(
    markdown,
    /(?:^|\r?\n)\s*\*{0,2}\s*Areas?\s+for\s+Improvement\s*\*{0,2}\s*:/i
  );
  let recommendations = extractBulletListAfterHeader(
    markdown,
    /(?:^|\r?\n)\s*\*{0,2}\s*Recommendations?\s*\*{0,2}\s*:/i
  );
  const keyInsights = extractBulletListAfterHeader(
    markdown,
    /(?:^|\r?\n)\s*\*{0,2}\s*Key\s+Insights\s*\*{0,2}\s*:/i
  );

  const inlineRec = extractInlineRecommendationLine(markdown);
  if (inlineRec) {
    const lower = inlineRec.toLowerCase();
    recommendations = [
      inlineRec,
      ...recommendations.filter(r => r.toLowerCase() !== lower),
    ];
  }

  return {
    strengths: dedupeSummaryLines(strengths).filter(s => !isSummaryBulletJunk(s)),
    areasForImprovement: dedupeSummaryLines(areasForImprovement).filter(s => !isSummaryBulletJunk(s)),
    recommendations: dedupeSummaryLines(recommendations).filter(s => !isSummaryBulletJunk(s)),
    keyInsights: dedupeSummaryLines(keyInsights).filter(s => !isSummaryBulletJunk(s)),
  };
}

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

function extractStrengths(response: string, wordCount: number, category?: string): string[] {
  const strengths: string[] = [];
  const lower = response.toLowerCase();
  const cat = (category ?? '').toLowerCase();

  if (wordCount > 50) strengths.push('Provided detailed response');
  if (wordCount > 100) strengths.push('Comprehensive explanation');
  if (/\d+\s*%|\d+\s+percent/i.test(response)) {
    strengths.push('Cited measurable impact (numbers or percentages)');
  }
  if (/\b(api|apis|docker|firebase|database|react|typescript|kubernetes|microservices?)\b/i.test(response)) {
    strengths.push('Referenced concrete tools or technologies');
  }
  if (lower.includes('example') || lower.includes('instance')) {
    strengths.push('Used concrete examples');
  }
  if (
    lower.includes('result') ||
    lower.includes('outcome') ||
    lower.includes('achieved') ||
    lower.includes('reduced') ||
    lower.includes('improved')
  ) {
    strengths.push('Focused on results or impact');
  }
  if (lower.includes('team') || lower.includes('collaborat')) {
    strengths.push('Demonstrated teamwork');
  }
  if (cat.includes('technical') && /\b(test|deploy|scal|perform|security|auth)\b/i.test(lower)) {
    strengths.push('Addressed technical depth (quality, scale, or delivery)');
  }
  if (cat.includes('behavioral') && /\b(stakeholder|communicat|led|mentor)\b/i.test(lower)) {
    strengths.push('Highlighted collaboration or communication');
  }

  const seen = new Set<string>();
  const uniq = strengths.filter(s => {
    const k = s.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return uniq.length > 0 ? uniq : ['Responded to the question'];
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
