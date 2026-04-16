import { Request, Response } from 'express';
import { InterviewTemplate } from '../models/InterviewTemplate';
import { JobPosition } from '../models/JobPosition';
import { ResumeAnalysis } from '../models/ResumeAnalysis';
import { AuthRequest } from '../middleware/auth';

type DescriptionSource = 'user_input' | 'db_match' | 'template_fallback';

const DEFAULT_OPENROUTER_MODELS = [
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'openai/gpt-4o-mini',
  'google/gemini-2.0-flash-001',
];

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getOpenRouterModels = (): string[] => {
  const fromList = process.env.OPENROUTER_MODELS?.split(',')
    .map(model => model.trim())
    .filter(Boolean);

  if (fromList && fromList.length > 0) {
    return fromList;
  }

  const singleModel = process.env.OPENROUTER_MODEL?.trim();
  return singleModel ? [singleModel, ...DEFAULT_OPENROUTER_MODELS] : DEFAULT_OPENROUTER_MODELS;
};

const buildTemplateJobDescription = (jobPosition: string) =>
  `This is a ${jobPosition} role focused on delivering high-quality, maintainable solutions, collaborating with cross-functional teams, and demonstrating strong communication, problem-solving, and execution in real-world project scenarios.`;

const resolveJobDescription = async (
  jobPosition: string,
  inputDescription?: string
): Promise<{ description: string; source: DescriptionSource }> => {
  const trimmedDescription = typeof inputDescription === 'string' ? inputDescription.trim() : '';
  if (trimmedDescription) {
    return { description: trimmedDescription, source: 'user_input' };
  }

  const trimmedPosition = (jobPosition || '').trim();
  if (trimmedPosition) {
    const exactTitleRegex = new RegExp(`^${escapeRegex(trimmedPosition)}$`, 'i');

    const dbMatch = await JobPosition.findOne({
      title: { $regex: exactTitleRegex },
      description: { $exists: true, $ne: '' },
      status: { $in: ['active', 'open'] },
    })
      .sort({ updatedAt: -1 })
      .select('description')
      .lean();

    if (dbMatch?.description && dbMatch.description.trim()) {
      return { description: dbMatch.description.trim(), source: 'db_match' };
    }
  }

  return {
    description: buildTemplateJobDescription(trimmedPosition || 'this position'),
    source: 'template_fallback',
  };
};

const buildFallbackQuestions = (
  jobPosition: string,
  jobDescription: string,
  interviewModes: string[] | string,
  questionCount: number,
  difficultyLevel?: string,
  resumeSkills: string[] = []
) => {
  const modes = Array.isArray(interviewModes) ? interviewModes : [interviewModes || 'general'];
  const keyResponsibilities = extractJobKeywords(jobDescription);
  const primarySkill = resumeSkills[0] || keyResponsibilities[0] || jobPosition;
  const secondarySkill = resumeSkills[1] || keyResponsibilities[1] || 'your core toolkit';

  const fallbackPool = [
    {
      text: `Walk me through a project where you used ${primarySkill} in a ${jobPosition} context to solve a challenge that is similar to this role's requirements.`,
      expectedAnswer: `The candidate should describe a specific project with clear context, explain the technical challenge, detail why ${primarySkill} was chosen, and quantify the result with metrics.`,
    },
    {
      text: `This role expects strong execution in ${secondarySkill}. How do you keep your ${secondarySkill} skills current and production-ready?`,
      expectedAnswer: `A strong answer names concrete learning sources, recent concepts adopted, and practical examples where the candidate applied the new knowledge in production or projects.`,
    },
    {
      text: `Describe a technical decision you made under pressure that directly impacted one of these responsibilities: ${keyResponsibilities.slice(0, 2).join(', ') || 'delivery, quality'}.`,
      expectedAnswer: `The candidate should provide a real scenario, explain alternatives and trade-offs, justify the final decision, and describe post-decision outcomes.`,
    },
    {
      text: `How would you ensure maintainability and testability for systems in this ${jobPosition} role given the job description priorities?`,
      expectedAnswer: `Look for practical mention of coding standards, automated tests, code reviews, observability, and CI/CD gates tied to the responsibilities in the job description.`,
    },
    {
      text: `Tell me about a disagreement with a teammate or stakeholder while delivering work related to ${keyResponsibilities[0] || 'this role'}. How did you resolve it?`,
      expectedAnswer: `A good response demonstrates active listening, structured communication, and a collaborative resolution while maintaining delivery quality.`,
    },
    {
      text: `Given this role's scope, how do you prioritize competing work across ${keyResponsibilities.slice(0, 3).join(', ') || 'delivery, quality, communication'}?`,
      expectedAnswer: `Look for impact-based prioritization, clear trade-off reasoning, stakeholder alignment, and examples of balancing speed with quality.`,
    },
    {
      text: `Describe how you ramped up quickly on an unfamiliar stack element relevant to this role, such as ${secondarySkill}.`,
      expectedAnswer: `Strong answers include a structured learning plan, practical experimentation, collaboration with teammates, and proof of business impact after ramp-up.`,
    },
    {
      text: `What process would you follow from requirement intake to release for a feature in this ${jobPosition} role?`,
      expectedAnswer: `The candidate should discuss requirements clarification, solution design, risk handling, testing strategy, rollout planning, and communication with stakeholders.`,
    },
    {
      text: `Describe a project where your work with ${primarySkill} delivered measurable business impact relevant to this role's objectives.`,
      expectedAnswer: `Look for measurable impact (performance, reliability, conversion, cost, velocity), an explanation of technical choices, and clear communication of outcomes.`,
    },
    {
      text: `What major technical risks do you anticipate for this ${jobPosition} role based on the job description, and how would you mitigate them?`,
      expectedAnswer: `The candidate should show forward thinking around scalability, reliability, collaboration, and risk mitigation with concrete and realistic plans.`,
    },
  ];

  const normalizedCount = Math.max(3, Math.min(questionCount || 5, 20));
  const questions = Array.from({ length: normalizedCount }).map((_, index) => {
    const type = modes[index % modes.length] || 'general';
    const base = fallbackPool[index % fallbackPool.length];
    return {
      text: base.text,
      type,
      expectedAnswer: base.expectedAnswer,
    };
  });

  return questions;
};

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'this',
  'that',
  'from',
  'your',
  'will',
  'have',
  'has',
  'our',
  'are',
  'you',
  'but',
  'not',
  'job',
  'role',
  'work',
  'team',
  'years',
  'experience',
]);

const extractJobKeywords = (jobDescription: string, limit = 6): string[] => {
  if (!jobDescription || typeof jobDescription !== 'string') return [];

  const tokens = jobDescription
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));

  const frequencies = new Map<string, number>();
  for (const token of tokens) {
    frequencies.set(token, (frequencies.get(token) || 0) + 1);
  }

  return [...frequencies.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([token]) => token);
};

const buildResumePromptContext = (analysis: any) => {
  if (!analysis) {
    return {
      contextBlock: '',
      resumeRules: '',
      resumeSkillNames: [] as string[],
    };
  }

  const resumeSkillNames: string[] = Array.isArray(analysis.extractedSkills)
    ? analysis.extractedSkills
        .slice()
        .sort((a: any, b: any) => (b.level || 0) - (a.level || 0))
        .slice(0, 10)
        .map((s: any) => s.name)
        .filter(Boolean)
    : [];

  const gapNames: string[] = Array.isArray(analysis.skillGaps)
    ? analysis.skillGaps
        .slice(0, 5)
        .map((g: any) => g.skill)
        .filter(Boolean)
    : [];

  const contextBlock = `\nCandidate Resume Context:
- Match Score Against Target Role: ${analysis.matchScore ?? 'N/A'}%
- Resume Skills (top): ${resumeSkillNames.join(', ') || 'Not available'}
- Skill Gaps: ${gapNames.join(', ') || 'Not available'}
- Resume Target Job Position: ${analysis.targetJobPosition || 'Not provided'}
- Resume Target Job Description: ${analysis.targetJobDescription || 'Not provided'}\n`;

  const resumeRules = `
10. At least 40% of questions must explicitly reference one or more of these resume skills where relevant: ${resumeSkillNames.join(', ') || 'candidate skills'}.
11. Include at least one question that probes a likely skill gap: ${gapNames.join(', ') || 'N/A'}.
12. If resume and JD overlap on a skill, prefer scenario-based questions using that shared skill context.`;

  return {
    contextBlock,
    resumeRules,
    resumeSkillNames,
  };
};

const sanitizeJsonString = (input: string) => {
  let result = '';
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inString) {
      if (isEscaped) {
        result += char;
        isEscaped = false;
        continue;
      }

      if (char === '\\') {
        result += char;
        isEscaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
        result += char;
        continue;
      }

      if (char === '\n') {
        result += '\\n';
        continue;
      }

      if (char === '\r') {
        result += '\\r';
        continue;
      }

      if (char === '\t') {
        result += '\\t';
        continue;
      }

      result += char;
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      continue;
    }

    result += char;
  }

  return result;
};

const stripMarkdown = (value: string) => {
  if (!value) return value;
  return value
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/#+\s?/g, '')
    .replace(/>\s?/g, '')
    .trim();
};

export class InterviewTemplateController {
  // Create a new interview template
  static async create(req: Request, res: Response) {
    try {
      const {
        jobPosition,
        jobDescription,
        interviewType,
        interviewModes,
        duration,
        availability,
        visibility,
        aiSettings,
        questions,
      } = req.body;

      const template = new InterviewTemplate({
        hrId: (req as any).user?.id,
        jobPosition,
        jobDescription,
        interviewType,
        interviewModes,
        duration,
        availability,
        visibility,
        aiSettings,
        questions: questions || [],
        status: questions && questions.length > 0 ? 'active' : 'draft',
      });

      await template.save();

      res.status(201).json({
        success: true,
        data: template,
        message: 'Interview template created successfully',
      });
    } catch (error: any) {
      console.error('Error creating interview template:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create interview template',
      });
    }
  }

  // Get all templates for the HR user
  static async getAll(req: Request, res: Response) {
    try {
      const hrId = (req as any).user?.id;
      const { status, interviewType } = req.query;

      const filter: any = { hrId };
      if (status) filter.status = status;
      if (interviewType) filter.interviewType = interviewType;

      const templates = await InterviewTemplate.find(filter).sort({ createdAt: -1 }).lean();

      res.status(200).json({
        success: true,
        data: templates,
        count: templates.length,
      });
    } catch (error: any) {
      console.error('Error fetching interview templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch interview templates',
      });
    }
  }

  // Get a single template by ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await InterviewTemplate.findById(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Interview template not found',
        });
      }

      res.status(200).json({
        success: true,
        data: template,
      });
    } catch (error: any) {
      console.error('Error fetching interview template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch interview template',
      });
    }
  }

  // Update a template
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // If questions are being added and template was draft, make it active
      if (updateData.questions && updateData.questions.length > 0) {
        updateData.status = 'active';
      }

      const template = await InterviewTemplate.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Interview template not found',
        });
      }

      res.status(200).json({
        success: true,
        data: template,
        message: 'Interview template updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating interview template:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update interview template',
      });
    }
  }

  // Delete a template
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await InterviewTemplate.findByIdAndDelete(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Interview template not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Interview template deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting interview template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete interview template',
      });
    }
  }

  // Generate interview questions using OpenRouter AI with improved prompt
  static async generateQuestions(req: AuthRequest, res: Response) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    try {
      const {
        jobPosition,
        jobDescription,
        interviewModes,
        difficultyLevel,
        duration = '30 Min',
        questionCount = 5,
      } = req.body;

      const normalizedInterviewModes = Array.isArray(interviewModes)
        ? interviewModes
        : [interviewModes].filter(Boolean);

      // Log incoming request
      console.log(`[${requestId}] 📥 Generate questions request received:`, {
        jobPosition,
        hasDescription: !!jobDescription,
        interviewModes,
        difficultyLevel,
        duration,
        questionCount,
        userId: (req as any).user?.id,
      });

      const { description: resolvedJobDescription, source: descriptionSource } =
        await resolveJobDescription(jobPosition, jobDescription);

      console.log(`[${requestId}] ℹ️ Job description source resolved: ${descriptionSource}`);

      const userId = req.user?.id;
      const resumeAnalysis = userId
        ? await ResumeAnalysis.findOne({ userId }).select(
            'matchScore extractedSkills skillGaps targetJobPosition targetJobDescription'
          )
        : null;
      const { contextBlock, resumeRules, resumeSkillNames } = buildResumePromptContext(
        resumeAnalysis?.toObject?.() || null
      );

      // Validate required fields
      if (!jobPosition || normalizedInterviewModes.length === 0) {
        console.warn(`[${requestId}] ⚠️ Validation failed - missing required fields`);
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Job position and at least one interview mode are required',
          details: {
            jobPosition: !jobPosition ? 'Missing job position' : undefined,
            interviewModes:
              normalizedInterviewModes.length === 0
                ? 'At least one interview mode is required'
                : undefined,
          },
        });
      }

      // Check API key configuration
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        console.warn(
          `[${requestId}] ⚠️ OpenRouter API key not configured. Using fallback questions.`
        );
        const fallbackQuestions = buildFallbackQuestions(
          jobPosition,
          resolvedJobDescription,
          normalizedInterviewModes,
          questionCount,
          difficultyLevel,
          resumeSkillNames
        );
        return res.status(200).json({
          success: true,
          data: fallbackQuestions,
          message: `Generated ${fallbackQuestions.length} fallback interview questions`,
          ...(process.env.NODE_ENV === 'development' && {
            meta: { requestId, fallback: true, descriptionSource },
          }),
        });
      }

      // Format interview modes for the prompt
      const typeString = Array.isArray(interviewModes)
        ? interviewModes.map((mode: string) => mode.replace('_', ' ')).join(', ')
        : normalizedInterviewModes.join(', ');

      // Use the improved prompt template
      const prompt = `You are a senior technical hiring manager with 15+ years of experience interviewing candidates for ${jobPosition} roles.

Your task is to generate exactly ${questionCount} high-quality, specific, and challenging interview questions for the following position:

Job Title: ${jobPosition}
Job Description: ${resolvedJobDescription}
Interview Duration: ${duration}
Interview Focus: ${typeString}
Difficulty Level: ${difficultyLevel || 'mid'} (junior = entry level, mid = 2-5 years experience, senior = 5+ years)
${contextBlock}

IMPORTANT RULES:
1. Questions MUST be specific to the "${jobPosition}" role and the job description provided — not generic.
2. DO NOT append "(Role: ...)" or any role label at the end of questions.
3. Each question must be substantive and require a detailed, thoughtful answer.
4. Questions should reflect the difficulty level: ${difficultyLevel || 'mid'}-level depth.
5. For technical questions: ask about specific technologies, architecture decisions, real problem-solving, or system design relevant to the job description.
6. For behavioral questions: use the STAR format context and ask about concrete past experiences.
7. The expectedAnswer should be 2-4 sentences outlining what a strong answer would include.
8. Do NOT use markdown formatting inside JSON string values (no **, *, #, backticks).
9. Return ONLY a valid JSON array. No preamble, no explanation, no trailing text.
${resumeRules}

Return exactly ${questionCount} questions as a JSON array:
[
  {
    "text": "<specific, challenging question directly relevant to ${jobPosition}>",
    "type": "<one of: ${normalizedInterviewModes.map((m: string) => m).join(', ')}>",
    "expectedAnswer": "<2-4 sentences describing what a strong answer should cover>"
  }
]

Generate the questions now:`;

      console.log(`[${requestId}] 📝 Generating questions with OpenRouter AI...`);
      console.log(`[${requestId}] 🎯 Target: ${questionCount} questions for ${duration} duration`);

      const modelCandidates = getOpenRouterModels();
      let response: any = null;
      let apiDuration = 0;
      let modelUsed: string | null = null;
      let lastStatus: number | null = null;

      for (const model of modelCandidates) {
        const apiStartTime = Date.now();
        const candidateResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
            'X-Title': 'Intervau AI Platform',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 4000,
          }),
        });

        apiDuration = Date.now() - apiStartTime;
        lastStatus = candidateResponse.status;

        if (!candidateResponse.ok) {
          const errorData = await candidateResponse.text();
          console.error(`[${requestId}] ❌ OpenRouter API error:`, {
            model,
            status: candidateResponse.status,
            statusText: candidateResponse.statusText,
            error: errorData.substring(0, 500),
          });

          if (candidateResponse.status === 404) {
            console.warn(
              `[${requestId}] ⚠️ Model unavailable, retrying with next fallback model: ${model}`
            );
            continue;
          }

          if (candidateResponse.status === 429) {
            console.warn(
              `[${requestId}] ⚠️ Model rate-limited, retrying with next fallback model: ${model}`
            );
            continue;
          }

          if (candidateResponse.status >= 500) {
            console.warn(`[${requestId}] ⚠️ Upstream error, retrying with next model: ${model}`);
            continue;
          }

          continue;
        }

        response = candidateResponse;
        modelUsed = model;
        break;
      }

      if (!response) {
        console.warn(
          `[${requestId}] ⚠️ OpenRouter failed across all models. Using fallback questions.`
        );
        const fallbackQuestions = buildFallbackQuestions(
          jobPosition,
          resolvedJobDescription,
          normalizedInterviewModes,
          questionCount,
          difficultyLevel,
          resumeSkillNames
        );
        return res.status(200).json({
          success: true,
          data: fallbackQuestions,
          message: `Generated ${fallbackQuestions.length} fallback interview questions`,
          ...(process.env.NODE_ENV === 'development' && {
            meta: {
              requestId,
              fallback: true,
              status: lastStatus,
              descriptionSource,
              modelsTried: modelCandidates,
            },
          }),
        });
      }

      console.log(
        `[${requestId}] 🌐 OpenRouter API responded in ${apiDuration}ms using model ${modelUsed}`
      );

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      let content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.error(`[${requestId}] ❌ No content in AI response:`, data);
        return res.status(500).json({
          success: false,
          error: 'AI Service Error',
          message: 'No response from AI service. Please try again.',
        });
      }

      console.log(`[${requestId}] 🧪 Raw AI content length: ${content.length} characters`);
      console.log(`[${requestId}] 🧪 Raw AI content preview:`, content.substring(0, 200) + '...');

      // Remove markdown formatting if present
      content = content.replace(/```json|```/g, '').trim();
      // Sanitize unescaped newlines/tabs inside JSON strings
      content = sanitizeJsonString(content);

      // Parse the JSON response
      let questions;
      try {
        // Try parsing the whole content as JSON first
        try {
          const parsed = JSON.parse(content);
          questions = Array.isArray(parsed)
            ? parsed
            : parsed.interviewQuestions || parsed.questions || [];
          console.log(`[${requestId}] ✅ Direct JSON parsing successful`);
        } catch (directParseError) {
          console.log(`[${requestId}] ⚠️ Direct parsing failed, attempting regex extraction...`);
          // If direct parsing fails, try extracting JSON array/object
          const jsonMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
          if (!jsonMatch) {
            throw new Error('No valid JSON structure found in AI response');
          }

          const parsed = JSON.parse(sanitizeJsonString(jsonMatch[0]));
          questions = Array.isArray(parsed)
            ? parsed
            : parsed.interviewQuestions || parsed.questions || [];
          console.log(`[${requestId}] ✅ Regex extraction successful`);
        }
      } catch (parseError) {
        console.log(`[${requestId}] ⚠️ JSON parsing failed, attempting fixes...`);
        // Last resort: try to fix common JSON issues and use eval as fallback
        try {
          const jsonMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
          if (!jsonMatch) {
            throw new Error('No JSON structure found');
          }

          // Try fixing common issues
          let fixedJson = sanitizeJsonString(jsonMatch[0])
            .replace(/'/g, '"') // Replace single quotes
            .replace(/,\s*}/g, '}') // Remove trailing commas in objects
            .replace(/,\s*\]/g, ']'); // Remove trailing commas in arrays

          try {
            questions = JSON.parse(fixedJson);
            console.log(`[${requestId}] ✅ Fixed JSON parsing successful`);
          } catch (err) {
            // Unsafe fallback: eval (similar to Next.js implementation)
            console.warn(`[${requestId}] ⚠️ Using eval fallback for JSON parsing`);
            const evaluated = eval('(' + jsonMatch[0] + ')');
            questions = Array.isArray(evaluated)
              ? evaluated
              : evaluated.interviewQuestions || evaluated.questions || [];
          }
        } catch (err: any) {
          console.error(`[${requestId}] ❌ Failed to parse AI response:`, {
            error: err.message,
            contentPreview: content.substring(0, 500),
          });
          return res.status(500).json({
            success: false,
            error: 'Parsing Error',
            message: 'Failed to parse AI-generated questions. Please try again.',
            ...(process.env.NODE_ENV === 'development' && {
              details: { parseError: err.message, contentPreview: content.substring(0, 500) },
            }),
          });
        }
      }

      // Validate that we have an array of questions
      if (!Array.isArray(questions) || questions.length === 0) {
        console.error(`[${requestId}] ❌ Parsed data is not a valid array:`, typeof questions);
        return res.status(500).json({
          success: false,
          error: 'Validation Error',
          message: 'AI did not return valid questions. Please try again.',
        });
      }

      const requestedCount = Math.max(
        1,
        Math.min(50, Number.isFinite(Number(questionCount)) ? Number(questionCount) : 0)
      );

      // Normalize question format to ensure consistency
      const normalizedQuestions = questions
        .map((q: any, index: number) => ({
          text: stripMarkdown(q.text || q.question || ''),
          type: q.type || 'General',
          expectedAnswer: stripMarkdown(q.expectedAnswer || ''),
        }))
        .filter((q: any) => q.text && q.text.trim().length > 0);

      const finalQuestions =
        requestedCount > 0 ? normalizedQuestions.slice(0, requestedCount) : normalizedQuestions;

      const totalDuration = Date.now() - startTime;
      console.log(
        `[${requestId}] ✅ Successfully generated ${finalQuestions.length} questions in ${totalDuration}ms`
      );

      res.status(200).json({
        success: true,
        data: finalQuestions,
        message: `Generated ${finalQuestions.length} interview questions`,
        ...(process.env.NODE_ENV === 'development' && {
          meta: {
            requestId,
            duration: `${totalDuration}ms`,
            apiDuration: `${apiDuration}ms`,
            modelUsed,
            descriptionSource,
          },
        }),
      });
    } catch (error: any) {
      const totalDuration = Date.now() - startTime;
      console.error(
        `[${requestId}] ❌ Unexpected error in generateQuestions after ${totalDuration}ms:`,
        {
          error: error.message,
          stack: error.stack,
          name: error.name,
        }
      );
      res.status(500).json({
        success: false,
        error: error.name || 'Internal Server Error',
        message: error.message || 'Failed to generate interview questions',
        ...(process.env.NODE_ENV === 'development' && {
          details: { stack: error.stack, requestId },
        }),
      });
    }
  }

  // Get public interview templates (for candidates)
  static async getPublicTemplates(req: Request, res: Response) {
    try {
      const { interviewType } = req.query;

      const filter: any = {
        visibility: 'public',
        status: 'active',
      };
      if (interviewType) filter.interviewType = interviewType;

      const templates = await InterviewTemplate.find(filter)
        .select('-questions.expectedAnswer') // Hide expected answers from candidates
        .populate('hrId', 'name companyName')
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({
        success: true,
        data: templates,
        count: templates.length,
      });
    } catch (error: any) {
      console.error('Error fetching public templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch interview templates',
      });
    }
  }
}
