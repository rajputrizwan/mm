import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { generateInterviewQuestions } from '../services/aiService';

const router = Router();

// All routes require authentication and candidate role
router.use(authMiddleware);
router.use(roleMiddleware('candidate'));

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
  } catch (error: any) {
    console.error('❌ Error in generate-questions endpoint:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate interview questions',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

export default router;
