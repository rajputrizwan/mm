import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Evaluation prompt template for Mistral via OpenRouter.
 * Returns a structured JSON evaluation of the candidate's interview performance.
 */
const EVALUATION_PROMPT = `You are a senior technical recruiter evaluating an AI-conducted interview.

Below is the interview conversation:

{{conversation}}

Evaluate the candidate based on:
- Technical Knowledge
- Problem Solving Ability
- Communication Skills
- Confidence
- Clarity of Explanation
- Relevance of Answers

Score each category from 0 to 10.

Then provide:
- Overall Score (average of all scores, out of 10)
- Strengths (array of strings)
- Weaknesses (array of strings)
- Observations (array of strings)
- Suggestions for Improvement (array of strings)
- Hiring Recommendation

Recommendation must be one of: "Strong Hire", "Hire", "Neutral", "No Hire"

Return ONLY valid JSON with no extra text or markdown:

{
  "technical_knowledge": 0,
  "problem_solving": 0,
  "communication_skills": 0,
  "confidence": 0,
  "clarity": 0,
  "relevance": 0,
  "overall_score": 0,
  "strengths": [],
  "weaknesses": [],
  "observations": [],
  "suggestions": [],
  "recommendation": ""
}`;

interface ConversationEntry {
  question: string;
  answer: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * POST /api/interview-feedback
 * Sends interview transcript to Mistral via OpenRouter for structured evaluation.
 *
 * Body:
 *   conversation: Array<{ question: string; answer: string }>
 *   candidateName?: string
 *   jobPosition?: string
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { conversation, candidateName, jobPosition } = req.body;

    // Validate request
    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'conversation is required and must be a non-empty array of { question, answer } pairs',
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'AI evaluation service is not configured (missing OPENROUTER_API_KEY)',
      });
    }

    // Build human-readable transcript
    const conversationText = (conversation as ConversationEntry[])
      .map(
        (entry, i) => `Q${i + 1}: ${entry.question}\nA: ${entry.answer || '(No answer provided)'}`
      )
      .join('\n\n');

    const contextHeader =
      candidateName && jobPosition
        ? `Candidate: ${candidateName}\nPosition: ${jobPosition}\n\n`
        : '';

    const prompt = EVALUATION_PROMPT.replace('{{conversation}}', contextHeader + conversationText);

    // Call OpenRouter with Mistral model
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
        'X-Title': 'Intervau AI Platform',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Low temperature for consistent JSON output
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return res.status(502).json({
        success: false,
        message: 'Failed to get evaluation from AI service',
      });
    }

    const data = (await response.json()) as OpenRouterResponse;
    const content = data.choices?.[0]?.message?.content?.trim() || '';

    if (!content) {
      throw new Error('AI service returned an empty response');
    }

    // Extract JSON from the response (handles cases where model wraps in markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Non-JSON AI response:', content);
      throw new Error('AI service returned an invalid response format');
    }

    let feedback: Record<string, unknown>;
    try {
      feedback = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error('Failed to parse AI evaluation JSON');
    }

    // Validate required fields and add defaults for safety
    const result = {
      technical_knowledge: Number(feedback.technical_knowledge) || 0,
      problem_solving: Number(feedback.problem_solving) || 0,
      communication_skills: Number(feedback.communication_skills) || 0,
      confidence: Number(feedback.confidence) || 0,
      clarity: Number(feedback.clarity) || 0,
      relevance: Number(feedback.relevance) || 0,
      overall_score: Number(feedback.overall_score) || 0,
      strengths: Array.isArray(feedback.strengths) ? feedback.strengths : [],
      weaknesses: Array.isArray(feedback.weaknesses) ? feedback.weaknesses : [],
      observations: Array.isArray(feedback.observations) ? feedback.observations : [],
      suggestions: Array.isArray(feedback.suggestions) ? feedback.suggestions : [],
      recommendation: String(feedback.recommendation || 'Neutral'),
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error generating interview feedback:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate interview feedback',
    });
  }
});

export default router;
