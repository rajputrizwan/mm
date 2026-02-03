import { Request, Response } from 'express';
import { InterviewTemplate } from '../models/InterviewTemplate';

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

            const templates = await InterviewTemplate.find(filter)
                .sort({ createdAt: -1 })
                .lean();

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

            const template = await InterviewTemplate.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

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
    static async generateQuestions(req: Request, res: Response) {
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

            // Validate required fields
            if (!jobPosition || !jobDescription || !interviewModes || interviewModes.length === 0) {
                console.warn(`[${requestId}] ⚠️ Validation failed - missing required fields`);
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Job position, description, and at least one interview mode are required',
                    details: {
                        jobPosition: !jobPosition ? 'Missing job position' : undefined,
                        jobDescription: !jobDescription ? 'Missing job description' : undefined,
                        interviewModes: !interviewModes || interviewModes.length === 0
                            ? 'At least one interview mode is required'
                            : undefined,
                    },
                });
            }

            // Check API key configuration
            const apiKey = process.env.OPENROUTER_API_KEY;
            if (!apiKey) {
                console.error(`[${requestId}] ❌ OpenRouter API key not configured in environment`);
                return res.status(500).json({
                    success: false,
                    error: 'Configuration Error',
                    message: 'OpenRouter API key not configured. Please contact support.',
                });
            }

            // Format interview modes for the prompt
            const typeString = Array.isArray(interviewModes)
                ? interviewModes.map((mode: string) => mode.replace('_', ' ')).join(', ')
                : interviewModes;

            // Use the improved prompt template from the reference
            const prompt = `You are an expert technical interviewer.
Based on the following inputs, generate a well-structured list of high-quality interview questions:

Job Title: ${jobPosition}
Job Description: ${jobDescription}
Interview Duration: ${duration}
Interview Type: ${typeString}
Difficulty Level: ${difficultyLevel || 'mid'}

📝 Your task:
Analyze the job description to identify key responsibilities, required skills, and expected experience.
Generate a list of interview questions depends on interview duration (approximately ${questionCount} questions).
Adjust the number and depth of questions to match the interview duration.
Ensure the questions match the tone and structure of a real-life ${typeString} interview.

🍀 Format your response in JSON format with array list of questions.
Return ONLY a valid JSON array with no additional text. Each object should have:
- "text": The question text
- "type": One of [${interviewModes.map((m: string) => `"${m}"`).join(', ')}]
- "expectedAnswer": A brief ideal answer outline (2-3 sentences)

format:
[
  {
    "text": "Can you describe your experience with...",
    "type": "technical",
    "expectedAnswer": "The candidate should mention..."
  }
]

🎯 The goal is to create a structured, relevant, and time-optimized interview plan for a ${jobPosition} role.`;

            console.log(`[${requestId}] 📝 Generating questions with OpenRouter AI...`);
            console.log(`[${requestId}] 🎯 Target: ${questionCount} questions for ${duration} duration`);

            // Make API request to OpenRouter
            const apiStartTime = Date.now();
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
                            content: prompt,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 4000, // Increased to prevent truncation
                }),
            });

            const apiDuration = Date.now() - apiStartTime;
            console.log(`[${requestId}] 🌐 OpenRouter API responded in ${apiDuration}ms with status: ${response.status}`);

            if (!response.ok) {
                const errorData = await response.text();
                console.error(`[${requestId}] ❌ OpenRouter API error:`, {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData.substring(0, 500),
                });
                return res.status(500).json({
                    success: false,
                    error: 'AI Service Error',
                    message: 'Failed to generate questions from AI service. Please try again.',
                    ...(process.env.NODE_ENV === 'development' && {
                        details: { status: response.status, error: errorData },
                    }),
                });
            }

            const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
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

                    const parsed = JSON.parse(jsonMatch[0]);
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
                    let fixedJson = jsonMatch[0]
                        .replace(/'/g, '"')           // Replace single quotes
                        .replace(/,\s*}/g, '}')       // Remove trailing commas in objects
                        .replace(/,\s*\]/g, ']');     // Remove trailing commas in arrays

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

            // Normalize question format to ensure consistency
            const normalizedQuestions = questions.map((q: any, index: number) => ({
                text: q.text || q.question || '',
                type: q.type || 'General',
                expectedAnswer: q.expectedAnswer || '',
            }));

            const totalDuration = Date.now() - startTime;
            console.log(`[${requestId}] ✅ Successfully generated ${normalizedQuestions.length} questions in ${totalDuration}ms`);

            res.status(200).json({
                success: true,
                data: normalizedQuestions,
                message: `Generated ${normalizedQuestions.length} interview questions`,
                ...(process.env.NODE_ENV === 'development' && {
                    meta: { requestId, duration: `${totalDuration}ms`, apiDuration: `${apiDuration}ms` },
                }),
            });
        } catch (error: any) {
            const totalDuration = Date.now() - startTime;
            console.error(`[${requestId}] ❌ Unexpected error in generateQuestions after ${totalDuration}ms:`, {
                error: error.message,
                stack: error.stack,
                name: error.name,
            });
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
