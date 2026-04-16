/**
 * Question Generation Service
 * Handles AI-powered interview question generation using the proven prompt template
 * from the reference implementation
 * Uses OpenRouter with Mistral model
 */

// Question Prompt - Generates structured interview questions
export const QUESTION_PROMPT = `You are an expert technical interviewer.
Based on the following inputs, generate a well-structured list of high-quality interview questions:

Job Title: {{jobTitle}}
Job Description: {{jobDescription}}
Interview Duration: {{Duration}}
Interview Type: {{type}}

📝 Your task:
Analyze the job description to identify key responsibilities, required skills, and expected experience.
Generate a list of interview questions depends on interview duration
Adjust the number and depth of questions to match the interview duration.
Ensure the questions match the tone and structure of a real-life {{type}} interview.

🍀 Format your response in JSON format with array list of questions.
format: interviewQuestions=[
  {
    question: "",
    type: 'Technical/Behavioral/Experience/Problem Solving/Leadership'
  },
  {
    ...
  }
]

🎯 The goal is to create a structured, relevant, and time-optimized interview plan for a {{jobTitle}} role.
`;

// Feedback Prompt - Evaluates interview performance
export const FEEDBACK_PROMPT = `{{conversation}}

Based on this interview conversation between the assistant and the user,
provide feedback for the user's interview.

Give a rating out of 10 for:
- Technical Skills
- Communication
- Problem Solving
- Experience

Also:
- Summarize the interview in 3 lines.
- Clearly state whether the candidate is recommended for hire or not, along with a short message.

Return the response in the following JSON format:
{
  "feedback": {
    "rating": {
      "technicalSkills": 5,
      "communication": 6,
      "problemSolving": 4,
      "experience": 7
    },
    "summary": "<3-line summary>",
    "recommendation": "Yes" | "No",
    "recommendationMsg": "<short message>"
  }
}`;

// Types
interface QuestionGenerationParams {
    jobTitle: string;
    jobDescription: string;
    duration: string;
    interviewTypes: string[];
}

interface GeneratedQuestion {
    question: string;
    type: string;
}

interface FeedbackResult {
    rating: {
        technicalSkills: number;
        communication: number;
        problemSolving: number;
        experience: number;
    };
    summary: string;
    recommendation: 'Yes' | 'No';
    recommendationMsg: string;
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
 * Generate interview questions using the proven prompt template
 */
export async function generateQuestions(
    params: QuestionGenerationParams
): Promise<GeneratedQuestion[]> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('OpenRouter API key not configured');
    }

    // Build the final prompt with parameters
    const typeString = Array.isArray(params.interviewTypes)
        ? params.interviewTypes.join(', ')
        : params.interviewTypes;

    const finalPrompt = QUESTION_PROMPT
        .replace(/{{jobTitle}}/g, params.jobTitle)
        .replace(/{{jobDescription}}/g, params.jobDescription)
        .replace(/{{Duration}}/g, params.duration)
        .replace(/{{type}}/g, typeString);

    console.log('📝 Generating questions with prompt:', finalPrompt.substring(0, 200) + '...');

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
                    content: finalPrompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 3000,
        }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API error:', errorData);
        throw new Error('Failed to generate questions from AI service');
    }

    const data = await response.json() as OpenRouterResponse;
    let content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('No response from AI service');
    }

    console.log('🧪 Raw AI content:', content.substring(0, 500));

    // Remove markdown formatting if present
    content = content.replace(/```json|```/g, '').trim();

    // Extract the first valid JSON object or array
    const match = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!match) {
        throw new Error('No valid JSON structure found in AI response');
    }

    let parsed: any;
    try {
        parsed = JSON.parse(match[0]);
    } catch (err) {
        // Try to fix common JSON issues
        let fixedJson = match[0]
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/(\w+):/g, '"$1":') // Add quotes around keys
            .replace(/,\s*}/g, '}') // Remove trailing commas
            .replace(/,\s*\]/g, ']');

        try {
            parsed = JSON.parse(fixedJson);
        } catch (err2) {
            console.error('❌ JSON parsing failed:', err);
            throw new Error('Invalid JSON response from AI');
        }
    }

    // Extract interviewQuestions array (handle both formats)
    const questions = Array.isArray(parsed)
        ? parsed
        : parsed.interviewQuestions || parsed.questions || [];

    if (!Array.isArray(questions)) {
        throw new Error('Parsed data is not an array of questions');
    }

    // Normalize question format
    return questions.map((q: any, index: number) => ({
        question: q.question || q.text || '',
        type: q.type || 'General',
    }));
}

/**
 * Generate interview feedback based on conversation
 */
export async function generateFeedback(
    conversation: string
): Promise<FeedbackResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('OpenRouter API key not configured');
    }

    const finalPrompt = FEEDBACK_PROMPT.replace('{{conversation}}', conversation);

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
                    content: finalPrompt,
                },
            ],
            temperature: 0.5,
            max_tokens: 1000,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to generate feedback');
    }

    const data = await response.json() as OpenRouterResponse;
    let content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('No feedback response from AI');
    }

    // Parse JSON response
    content = content.replace(/```json|```/g, '').trim();
    const match = content.match(/\{[\s\S]*\}/);

    if (!match) {
        throw new Error('Invalid feedback format from AI');
    }

    const parsed = JSON.parse(match[0]);
    return parsed.feedback || parsed;
}

export default {
    generateQuestions,
    generateFeedback,
    QUESTION_PROMPT,
    FEEDBACK_PROMPT,
};
