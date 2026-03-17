import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

/**
 * Extract text content from uploaded resume file
 * Supports PDF, DOC, and DOCX formats
 */
export async function extractTextFromFile(filePath: string, mimetype: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(filePath);
    const extension = path.extname(filePath).toLowerCase();

    const isPdf = mimetype === 'application/pdf' || extension === '.pdf';
    const isWord =
      mimetype === 'application/msword' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      extension === '.doc' ||
      extension === '.docx';

    // Handle PDF files
    if (isPdf) {
      // pdf-parse v1.1.1 uses simple function API
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return normalizeExtractedText(data.text || '');
    }

    // Handle DOC and DOCX files
    if (isWord) {
      const result = await mammoth.extractRawText({ buffer });
      return normalizeExtractedText(result.value || '');
    }

    throw new Error('Unsupported file type');
  } catch (error) {
    console.error('Error extracting text from file:', error);
    const errorMessage = (error as Error).message || 'Unknown error';
    throw new Error(`Failed to extract text from resume: ${errorMessage}`);
  }
}

function normalizeExtractedText(text: string): string {
  return text
    .replace(/\u0000/g, '')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\t ]+/g, ' ')
    .trim();
}
