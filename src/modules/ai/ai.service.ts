import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../../utils/errors';

export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required for AI module');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async enhanceContent(prompt: string, context: { field: string; currentValue: string }) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const aiPrompt = `
        You are an expert portfolio content enhancer.
        Request: ${prompt}
        Field to enhance: ${context.field}
        Current value: "${context.currentValue}"
        
        Provide only the enhanced text, without any additional comments or formatting.
      `;

      const result = await model.generateContent(aiPrompt);
      const response = await result.response;
      const enhanced = response.text().trim();

      return {
        enhanced,
        original: context.currentValue,
      };
    } catch (err: any) {
      throw new AppError(`AI Enhancement failed: ${err.message}`, 500);
    }
  }

  async extractPortfolioData(content: string) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const aiPrompt = `
        You are an expert at extracting professional information from text.
        Given the following content (which could be a GitHub README or a Resume), extract "Education" and "Experience" sections.
        
        Return the result ONLY as a JSON object with this EXACT structure:
        {
          "education": [
            { "school": "university name", "degree": "degree name", "fieldOfStudy": "field", "startDate": "date string", "endDate": "date string", "description": "detail" }
          ],
          "experience": [
            { "company": "company name", "position": "title", "location": "city/country", "startDate": "date string", "endDate": "date string", "description": "detail", "isCurrent": boolean }
          ]
        }
        
        Rules:
        - Dates should be kept as strings exactly as they appear (e.g., "Jan 2020", "2022", "Present").
        - If a field is missing, use null.
        - If no education or experience is found, return an empty array for that field.
        - Provide ONLY the JSON object. No markdown formatting, no comments, no explanation.
        
        Content:
        ${content}
      `;

      const result = await model.generateContent(aiPrompt);
      const response = await result.response;
      let text = response.text().trim();
      
      // Basic cleaning of AI response to ensure valid JSON
      if (text.startsWith('```json')) {
        text = text.replace(/```json\n?/, '').replace(/\n?```/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/```\n?/, '').replace(/\n?```/, '');
      }

      return JSON.parse(text);
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        throw new AppError(`AI provided invalid JSON: ${err.message}`, 500);
      }
      throw new AppError(`AI Extraction failed: ${err.message}`, 500);
    }
  }
}
