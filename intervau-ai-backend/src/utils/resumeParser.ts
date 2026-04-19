import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

/**
 * Extract text content from uploaded resume file.
 * Supports PDF, DOC, and DOCX formats.
 */
export async function extractTextFromFile(filePath: string, mimetype: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(filePath);
    const extension = path.extname(filePath).toLowerCase();

    const isPdf =
      mimetype === 'application/pdf' || extension === '.pdf';
    const isWord =
      mimetype === 'application/msword' ||
      mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      extension === '.doc' ||
      extension === '.docx';

    if (isPdf) {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return normalizeExtractedText(data.text || '');
    }

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

/**
 * Comprehensive text normalisation pipeline.
 *
 * Steps (in order):
 *   1. Strip null bytes
 *   2. Expand common PDF ligatures
 *   3. Replace bullet / separator chars with newlines
 *   4. Strip page-number lines ("Page X of Y", "- 2 -", etc.)
 *   5. Fix hyphenated word-breaks across lines
 *   6. Expand common domain abbreviations
 *   7. Collapse whitespace / blank lines
 */
function normalizeExtractedText(text: string): string {
  let t = text;

  // 1. Remove null bytes
  t = t.replace(/\u0000/g, '');

  // 2. PDF ligatures → correct characters
  t = t
    .replace(/ﬁ/g, 'fi')
    .replace(/ﬂ/g, 'fl')
    .replace(/ﬀ/g, 'ff')
    .replace(/ﬃ/g, 'ffi')
    .replace(/ﬄ/g, 'ffl')
    .replace(/ﬅ/g, 'st')
    .replace(/ﬆ/g, 'st');

  // 3. Bullet / separator chars → newline so they become parseable line breaks
  t = t.replace(/[•·▪▸▹◦‣⁃→➔➢►●○■□]/g, '\n');

  // 4. Strip standalone page-number lines
  //    "Page 1 of 3"  /  "- 2 -"  /  "1 | Resume"
  t = t.replace(/^\s*[-–]?\s*[Pp]age\s+\d+\s*(of\s+\d+)?\s*[-–]?\s*$/gm, '');
  t = t.replace(/^\s*-+\s*\d+\s*-+\s*$/gm, '');
  t = t.replace(/^\s*\d+\s*\|\s*.{0,40}$/gm, '');   // "2 | John Doe"

  // 5. Repair hyphenated line-breaks  (e.g. "micro-\nservices" → "microservices")
  t = t.replace(/(\w)-\s*\n\s*(\w)/g, '$1$2');

  // 6. Expand common abbreviated terms so the skill detector works correctly
  const abbreviations: Record<string, string> = {
    'Elec\\.\\s*Eng\\.': 'Electrical Engineering',
    'Mech\\.\\s*Eng\\.': 'Mechanical Engineering',
    'Comp\\.\\s*Sci\\.': 'Computer Science',
    'Info\\.\\s*Tech\\.': 'Information Technology',
    'Mgmt\\.': 'Management',
    'Dev\\.': 'Development',
    'Prog\\.': 'Programming',
    'Dept\\.': 'Department',
    'Sr\\.': 'Senior',
    'Jr\\.': 'Junior',
    'w/': 'with',
    'yr': 'year',
    'yrs': 'years',
  };
  for (const [pattern, replacement] of Object.entries(abbreviations)) {
    t = t.replace(new RegExp(pattern, 'gi'), replacement);
  }

  // 7. Normalise line-endings, collapse runs of blank lines, trim spaces
  t = t
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  return t;
}
