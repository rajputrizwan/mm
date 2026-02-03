const axios = require('axios');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Question generation prompt template
 */
const QUESTION_PROMPT = `You are an expert technical interviewer.
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

/**
 * Generate interview questions using OpenRouter AI
 * @param {Object} formData - Interview configuration data
 * @param {string} formData.jobPosition - Job title
 * @param {string} formData.jobDescription - Job description
 * @param {string} formData.duration - Interview duration
 * @param {string[]} formData.interviewType - Types of interview questions
 * @returns {Promise<Array<{question: string, type: string}>>}
 */
async function generateInterviewQuestions(formData) {
    try {
        const { jobPosition, jobDescription, duration, interviewType } = formData;

        // Prepare the prompt by replacing placeholders
        let prompt = QUESTION_PROMPT
            .replace(/{{jobTitle}}/g, jobPosition)
            .replace(/{{jobDescription}}/g, jobDescription)
            .replace(/{{Duration}}/g, duration)
            .replace(/{{type}}/g, Array.isArray(interviewType) ? interviewType.join(', ') : interviewType);

        console.log('🤖 Sending request to OpenRouter AI...');

        // Call OpenRouter API
        const response = await axios.post(
            OPENROUTER_API_URL,
            {
                model: 'openai/gpt-3.5-turbo', // You can change to other models
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert technical interviewer who generates high-quality interview questions in JSON format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.BACKEND_URL || 'http://localhost:5000',
                    'X-Title': 'Intervau AI - Interview Question Generator'
                },
                timeout: parseInt(process.env.OPENAI_TIMEOUT) || 30000
            }
        );

        console.log('✅ Received response from OpenRouter AI');

        // Extract the AI's response content
        const aiContent = response.data.choices[0].message.content;
        console.log('🧪 Raw AI content:', aiContent);

        // Parse the JSON response
        const questions = parseAIResponse(aiContent);

        return questions;
    } catch (error) {
        console.error('❌ Error generating questions:', error.message);

        if (error.response) {
            console.error('API Error Response:', error.response.data);
            throw new Error(`AI API Error: ${error.response.data.error?.message || 'Unknown error'}`);
        } else if (error.request) {
            throw new Error('No response from AI service. Please check your internet connection.');
        } else {
            throw new Error(`Failed to generate questions: ${error.message}`);
        }
    }
}

/**
 * Parse AI response to extract interview questions
 * @param {string} content - Raw AI response content
 * @returns {Array<{question: string, type: string}>}
 */
function parseAIResponse(content) {
    try {
        // Remove markdown code blocks if present
        let cleaned = content.replace(/```json|```/g, '').trim();

        // Try to extract JSON from the response
        const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (!jsonMatch) {
            throw new Error('No valid JSON structure found in AI response');
        }

        let parsed;
        try {
            parsed = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            // Last resort: try to evaluate it (use with caution)
            console.warn('⚠️ JSON.parse failed, trying eval fallback');
            parsed = eval('(' + jsonMatch[0] + ')');
        }

        // Extract the questions array
        let questions;
        if (Array.isArray(parsed)) {
            questions = parsed;
        } else if (parsed.interviewQuestions && Array.isArray(parsed.interviewQuestions)) {
            questions = parsed.interviewQuestions;
        } else {
            throw new Error('Parsed data does not contain a valid questions array');
        }

        // Validate question format
        if (!questions.every(q => q.question && q.type)) {
            throw new Error('Invalid question format: missing "question" or "type" fields');
        }

        console.log(`✅ Successfully parsed ${questions.length} questions`);
        return questions;
    } catch (error) {
        console.error('❌ Error parsing AI response:', error.message);
        throw new Error(`Failed to parse AI response: ${error.message}`);
    }
}

module.exports = {
    generateInterviewQuestions
};
