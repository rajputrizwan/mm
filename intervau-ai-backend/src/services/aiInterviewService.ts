/**
 * AI Interview Service
 * Handles AI-powered interview question generation and live interview conduction
 * Uses OpenRouter API with configurable model selection
 *
 * All fetch() calls are now wrapped with an AbortController timeout so that
 * a slow or hung OpenRouter response can never freeze a route handler indefinitely.
 */

const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_OPENROUTER_MODELS = [
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'google/gemini-2.0-flash-001',
];
const DEFAULT_SUMMARY_MODEL = 'openai/gpt-4o-mini';

// ─── Timeout constants ────────────────────────────────────────────────────────
/** Max time to wait for question generation or conduction responses (ms) */
const FETCH_TIMEOUT_MS = 20_000;
/** Max time to wait for summary generation — longer because the prompt is large (ms) */
const SUMMARY_FETCH_TIMEOUT_MS = 45_000;

const dedupeModels = (models: string[]): string[] => {
  const seen = new Set<string>();
  return models.filter(model => {
    if (!model || seen.has(model)) return false;
    seen.add(model);
    return true;
  });
};

const getOpenRouterModels = (): string[] => {
  const fromList =
    process.env.OPENROUTER_MODELS?.split(',')
      .map(model => model.trim())
      .filter(Boolean) || [];

  const singleModel = process.env.OPENROUTER_MODEL?.trim();
  return dedupeModels([
    ...(singleModel ? [singleModel] : []),
    ...fromList,
    ...DEFAULT_OPENROUTER_MODELS,
  ]);
};

const getSummaryModels = (): string[] => {
  const summaryModel = process.env.OPENROUTER_SUMMARY_MODEL?.trim() || DEFAULT_SUMMARY_MODEL;
  return dedupeModels([summaryModel, ...getOpenRouterModels()]);
};

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
  techStack?: string[];
  difficulty?: 'junior' | 'mid' | 'senior';
  interviewModes?: string[];
  questionCount?: number;
  // Aliases used by the route handler
  jobPosition?: string;
  jobDescription?: string;
  duration?: number;
  interviewType?: string | string[];
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Perform a fetch() with a hard timeout enforced by AbortController.
 * If the request takes longer than `timeoutMs`, it is aborted and an error is thrown.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  label: string
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
    console.error(`[AIService] ⏱️  ${label} timed out after ${timeoutMs / 1000}s — request aborted`);
  }, timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Build the common OpenRouter request headers.
 */
function buildHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
    'X-Title': 'Intervau AI Platform',
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate interview questions using OpenRouter.
 */
export async function generateInterviewQuestions(
  params: QuestionGenerationParams
): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  // Support both camelCase aliases used from the route handler
  const jobTitle = (params.jobTitle || params.jobPosition || '').trim();
  const difficulty = params.difficulty || 'mid';

  const prompt = GENERATION_SYSTEM_MESSAGE
    .replace('{{jobTitle}}', jobTitle)
    .replace('{{difficulty}}', difficulty);

  const techStack = params.techStack ?? [];
  const interviewModes = params.interviewModes ?? (
    Array.isArray(params.interviewType)
      ? params.interviewType
      : params.interviewType ? [params.interviewType] : []
  );
  const questionCount = params.questionCount ?? 5;

  const techStackInfo = techStack.length > 0 ? `\nTech Stack: ${techStack.join(', ')}` : '';
  const modesInfo =
    interviewModes.length > 0
      ? `\nQuestion Types to include: ${interviewModes.map(m => m.replace('_', ' ')).join(', ')}`
      : '';

  const userPrompt = `Generate exactly ${questionCount} interview questions for a ${jobTitle} position.${techStackInfo}${modesInfo}

Difficulty Level: ${difficulty}

${prompt}`;

  const model = process.env.OPENROUTER_MODEL?.trim() || 'mistralai/mistral-small-3.1-24b-instruct:free';
  console.log(`[AIService] generateInterviewQuestions → model=${model}, jobTitle=${jobTitle}`);

  const response = await fetchWithTimeout(
    OPENROUTER_CHAT_URL,
    {
      method: 'POST',
      headers: buildHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: userPrompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    },
    FETCH_TIMEOUT_MS,
    'generateInterviewQuestions'
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error('[AIService] generateInterviewQuestions OpenRouter error:', {
      status: response.status,
      body: errorData.substring(0, 500),
    });
    throw new Error(`Failed to generate questions from AI service (HTTP ${response.status})`);
  }

  const data = (await response.json()) as OpenRouterResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No response content from AI service');
  }

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error('[AIService] generateInterviewQuestions — unexpected response format:', content.substring(0, 300));
    throw new Error('Invalid JSON response from AI — no array found');
  }

  return JSON.parse(jsonMatch[0]) as GeneratedQuestion[];
}

/**
 * Conduct live interview — get AI response to candidate's answer.
 */
export async function conductInterview(params: LiveInterviewParams): Promise<AIResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const systemContext = LIVE_INTERVIEW_CONTEXT
    .replace('{{candidateName}}', params.candidateName)
    .replace('{{jobTitle}}', params.jobTitle);

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

  const model = process.env.OPENROUTER_MODEL?.trim() || 'mistralai/mistral-small-3.1-24b-instruct:free';

  const response = await fetchWithTimeout(
    OPENROUTER_CHAT_URL,
    {
      method: 'POST',
      headers: buildHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    },
    FETCH_TIMEOUT_MS,
    `conductInterview q=${params.currentQuestionIndex + 1}`
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error('[AIService] conductInterview OpenRouter error:', {
      status: response.status,
      body: errorData.substring(0, 300),
    });
    throw new Error(`Failed to get AI response (HTTP ${response.status})`);
  }

  const data = (await response.json()) as OpenRouterResponse;
  const content = data.choices?.[0]?.message?.content || '';

  const wordCount = params.candidateResponse.trim().split(/\s+/).length;
  const isShortAnswer = wordCount < 10;
  const isFollowUp =
    isShortAnswer ||
    content.toLowerCase().includes('could you') ||
    content.toLowerCase().includes('can you elaborate') ||
    content.toLowerCase().includes('tell me more');

  return {
    content,
    shouldMoveToNext: !isFollowUp,
    isFollowUp,
  };
}

/**
 * Generate interview summary after completion.
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

  const transcriptText = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');
  const summaryPrompt = `Analyze this interview transcript for ${candidateName} applying for ${jobTitle}.

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

Format as clean markdown.`;

  const modelCandidates = getSummaryModels();
  let lastError = 'Unknown summary generation error';

  for (const model of modelCandidates) {
    console.log(`[AIService] generateInterviewSummary → trying model=${model}`);

    let response: Response;
    try {
      response = await fetchWithTimeout(
        OPENROUTER_CHAT_URL,
        {
          method: 'POST',
          headers: buildHeaders(apiKey),
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: summaryPrompt }],
            temperature: 0.5,
            max_tokens: 1000,
          }),
        },
        SUMMARY_FETCH_TIMEOUT_MS,
        `generateInterviewSummary model=${model}`
      );
    } catch (fetchErr) {
      lastError = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      console.warn(`[AIService] generateInterviewSummary model=${model} fetch error: ${lastError}`);
      continue;
    }

    if (!response.ok) {
      const errorText = await response.text();
      lastError = `HTTP ${response.status} ${response.statusText}`;
      console.error('[AIService] generateInterviewSummary OpenRouter error:', {
        model,
        status: response.status,
        statusText: response.statusText,
        error: errorText.substring(0, 500),
      });
      continue;
    }

    const data = (await response.json()) as OpenRouterResponse;
    const content = data.choices?.[0]?.message?.content;

    if (content && content.trim()) {
      console.log(`[AIService] generateInterviewSummary ✓ model=${model}`);
      return content;
    }

    lastError = `Empty content from model ${model}`;
    console.warn(`[AIService] generateInterviewSummary: ${lastError}`);
  }

  throw new Error(`Failed to generate summary after trying ${modelCandidates.length} models: ${lastError}`);
}

export default {
  generateInterviewQuestions,
  conductInterview,
  generateInterviewSummary,
  GENERATION_SYSTEM_MESSAGE,
  LIVE_INTERVIEW_CONTEXT,
};
