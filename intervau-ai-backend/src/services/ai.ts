import { OpenAI } from 'openai';
import { config } from '../config/environment';

/**
 * AI service for generating feedback using OpenAI
 */
export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Generate feedback for interview answer
   */
  async generateFeedback(
    question: string,
    expectedAnswer: string,
    candidateAnswer: string,
    difficulty: string
  ) {
    try {
      const prompt = `
        You are an expert interview feedback provider. Analyze the candidate's answer and provide constructive feedback.
        
        Question: ${question}
        Difficulty: ${difficulty}
        Expected Answer: ${expectedAnswer}
        Candidate's Answer: ${candidateAnswer}
        
        Provide feedback in JSON format with:
        {
          "score": (0-100),
          "strengths": [list of strengths],
          "improvements": [list of improvements],
          "summary": "brief summary of the answer"
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('✗ AI feedback generation failed:', error);
      throw error;
    }
  }

  /**
   * Analyze interview answers
   */
  async analyzeInterview(answers: Array<{ question: string; answer: string }>) {
    try {
      const prompt = `
        Analyze these interview answers and provide an overall assessment:
        
        ${answers.map((a, i) => `Question ${i + 1}: ${a.question}\nAnswer: ${a.answer}`).join('\n\n')}
        
        Provide assessment in JSON format with:
        {
          "overallScore": (0-100),
          "communicationScore": (0-100),
          "technicalScore": (0-100),
          "confidenceScore": (0-100),
          "summary": "overall assessment"
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('✗ Interview analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze sentiment of response
   */
  async analyzeSentiment(text: string) {
    try {
      const prompt = `
        Analyze the sentiment and confidence of this text:
        "${text}"
        
        Provide analysis in JSON format with:
        {
          "sentiment": "positive|neutral|negative",
          "confidence": (0-100),
          "keywords": [important keywords],
          "tone": "professional|casual|formal"
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('✗ Sentiment analysis failed:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
