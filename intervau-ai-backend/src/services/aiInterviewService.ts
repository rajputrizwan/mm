/**
 * AI Interview Service
 * Handles AI-powered interview question generation and live interview conduction
 * Uses Mistral via OpenRouter API
 */

// Generation System Message - for creating interview questions
export const GENERATION_SYSTEM_MESSAGE = `Return a JSON array of objects for a {{jobTitle}} interview at {{difficulty}} level.
Format: [{"id": 1, "question": "string", "type": "Experience|Technical|Behavioral|Problem Solving|Leadership"}]
Do not include any conversational text, only the JSON.`;

// Live Interview Context - for conducting the interview
export const LIVE_INTERVIEW_CONTEXT = `You are Intervau.AI. You are interviewing {{candidateName}} for the {{jobTitle}} position.
Rules:
1. Stay in character as a professional interviewer.
2. If the user's answer is too short (less than 10 words), ask one follow-up to clarify.
3. Once the user provides a detailed answer, move to the next question in the list.
4. If they ask for help, politely remind them this is an interview but provide a small hint if they are stuck for more than 30 seconds.`;

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface QuestionGenerationParams {
    jobTitle: string;
    techStack: string[];
    difficulty: 'junior' | 'mid' | 'senior';
    interviewModes: string[];
    questionCount: number;
}

interface GeneratedQuestion {
    id: number;
    question: string;
    type: string;
}

interface LiveInterviewParams {
    candidateName: string;
    jobTitle: string;
    currentQuestion: string;
    currentQuestionIndex: number;
    totalQuestions: number;
    candidateResponse: string;
    conversationHistory: Message[];
}

interface AIResponse {
    content: string;
    shouldMoveToNext: boolean;
    isFollowUp: boolean;
}

// OpenRouter API response type
interface OpenRouterResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

/**
 * Generate interview questions using Mistral via OpenRouter
 */
export async function generateInterviewQuestions(
    params: QuestionGenerationParams
): Promise<GeneratedQuestion[]> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('OpenRouter API key not configured');
    }

    const prompt = GENERATION_SYSTEM_MESSAGE
        .replace('{{jobTitle}}', params.jobTitle)
        .replace('{{difficulty}}', params.difficulty);

    const techStackInfo = params.techStack.length > 0
        ? `\nTech Stack: ${params.techStack.join(', ')}`
        : '';

    const modesInfo = params.interviewModes.length > 0
        ? `\nQuestion Types to include: ${params.interviewModes.map(m => m.replace('_', ' ')).join(', ')}`
        : '';

    const userPrompt = `Generate exactly ${params.questionCount} interview questions for a ${params.jobTitle} position.${techStackInfo}${modesInfo}

Difficulty Level: ${params.difficulty}

${prompt}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
            'X-Title': 'Intervau AI Platform',
        },
        body: JSON.stringify({
            model: 'mistralai/mistral-7b-instruct',
            messages: [
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 2000,
        }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API error:', errorData);
        throw new Error('Failed to generate questions from AI service');
    }

    const data = await response.json() as OpenRouterResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('No response from AI service');
    }

    // Parse JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
    }

    return JSON.parse(jsonMatch[0]) as GeneratedQuestion[];
}

/**
 * Conduct live interview - get AI response to candidate's answer
 */
export async function conductInterview(
    params: LiveInterviewParams
): Promise<AIResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('OpenRouter API key not configured');
    }

    const systemContext = LIVE_INTERVIEW_CONTEXT
        .replace('{{candidateName}}', params.candidateName)
        .replace('{{jobTitle}}', params.jobTitle);

    // Build conversation messages
    const messages: Message[] = [
        {
            role: 'system',
            content: `${systemContext}

Current Question (${params.currentQuestionIndex + 1}/${params.totalQuestions}): ${params.currentQuestion}

Based on the candidate's response, either:
- Ask a follow-up question if the answer is too short or unclear
- Acknowledge their answer and transition to the next question
- Provide encouragement while maintaining professionalism

Keep responses concise (2-3 sentences max).`,
        },
        ...params.conversationHistory,
        {
            role: 'user',
            content: params.candidateResponse,
        },
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
            'X-Title': 'Intervau AI Platform',
        },
        body: JSON.stringify({
            model: 'mistralai/mistral-7b-instruct',
            messages,
            temperature: 0.7,
            max_tokens: 500,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to get AI response');
    }

    const data = await response.json() as OpenRouterResponse;
    const content = data.choices?.[0]?.message?.content || '';

    // Determine if this is a follow-up or if we should move to next question
    const wordCount = params.candidateResponse.trim().split(/\s+/).length;
    const isShortAnswer = wordCount < 10;
    const isFollowUp = isShortAnswer || content.toLowerCase().includes('could you') ||
        content.toLowerCase().includes('can you elaborate') ||
        content.toLowerCase().includes('tell me more');

    return {
        content,
        shouldMoveToNext: !isFollowUp,
        isFollowUp,
    };
}

/**
 * Generate interview summary after completion
 */
export async function generateInterviewSummary(
    candidateName: string,
    jobTitle: string,
    transcript: Array<{ speaker: string; text: string }>,
    questions: string[]
): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('OpenRouter API key not configured');
    }

    const transcriptText = transcript
        .map(t => `${t.speaker}: ${t.text}`)
        .join('\n');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
            'X-Title': 'Intervau AI Platform',
        },
        body: JSON.stringify({
            model: 'mistralai/mistral-7b-instruct',
            messages: [
                {
                    role: 'user',
                    content: `Analyze this interview transcript for ${candidateName} applying for ${jobTitle}.

Questions asked:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Transcript:
${transcriptText}

Provide a professional summary including:
1. Overall Performance (score out of 100)
2. Key Strengths (3-5 bullet points)
3. Areas for Improvement (2-3 bullet points)
4. Communication Quality Assessment
5. Final Recommendation

Format as clean markdown.`,
                },
            ],
            temperature: 0.5,
            max_tokens: 1000,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to generate summary');
    }

    const data = await response.json() as OpenRouterResponse;
    return data.choices?.[0]?.message?.content || 'Summary generation failed';
}

export default {
    generateInterviewQuestions,
    conductInterview,
    generateInterviewSummary,
    GENERATION_SYSTEM_MESSAGE,
    LIVE_INTERVIEW_CONTEXT,
};
