const pdf = require('pdf-parse');
import mammoth from 'mammoth';
import { AppError } from './errors';

export class ResumeParser {
  /**
   * Extracts text from a buffer based on the filename extension
   */
  static async parse(buffer: Buffer, filename: string): Promise<string> {
    const extension = filename.split('.').pop()?.toLowerCase();

    try {
      if (extension === 'pdf') {
        const data = await pdf(buffer);
        return data.text;
      } else if (extension === 'docx' || extension === 'doc') {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      } else if (extension === 'txt') {
        return buffer.toString('utf-8');
      } else {
        throw new AppError(`Unsupported file format: .${extension}`, 400);
      }
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Failed to parse resume file: ${err.message}`, 500);
    }
  }
}
