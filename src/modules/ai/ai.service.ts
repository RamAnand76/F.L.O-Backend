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
}
