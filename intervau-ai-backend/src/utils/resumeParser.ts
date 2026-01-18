import fs from 'fs';
import mammoth from 'mammoth';

/**
 * Extract text content from uploaded resume file
 * Supports PDF, DOC, and DOCX formats
 */
export async function extractTextFromFile(
    filePath: string,
    mimetype: string
): Promise<string> {
    try {
        const buffer = fs.readFileSync(filePath);

        // Handle PDF files
        if (mimetype === 'application/pdf') {
            // pdf-parse exports a default function, not an object
            const pdfParse = require('pdf-parse');
            const data = await pdfParse(buffer);
            return data.text;
        }

        // Handle DOC and DOCX files
        if (
            mimetype === 'application/msword' ||
            mimetype ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        }

        throw new Error('Unsupported file type');
    } catch (error) {
        console.error('Error extracting text from file:', error);
        const errorMessage = (error as Error).message || 'Unknown error';
        throw new Error(`Failed to extract text from resume: ${errorMessage}`);
    }
}
