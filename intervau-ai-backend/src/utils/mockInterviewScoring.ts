const PLACEHOLDER_ANSWER_PATTERN =
  /^\(?\s*(no answer provided|no response provided|no response|n\/?a|none)\s*\)?[.!?]*$/i;

const LOW_INFORMATION_EXACT_PATTERN =
  /^(?:sorry[,\s]+)?(?:i\s*(?:do\s*not|don't|dont)\s*know|i\s*(?:am|'m)?\s*not\s*sure|not\s*sure|no\s*idea|idk|i\s*(?:can(?:not|'t)|cannot)\s*(?:remember|recall)|i\s*forgot|i\s*(?:do\s*not|don't|dont)\s*have\s*(?:an\s*)?answer|pass|skip(?:\s*this)?(?:\s*question)?|next(?:\s*question)?)\s*[.!?]*$/i;

const LOW_INFORMATION_INTENT_PATTERN =
  /\b(i\s*(?:do\s*not|don't|dont)\s*know|i\s*(?:am|'m)?\s*not\s*sure|not\s*sure|no\s*idea|idk|i\s*(?:do\s*not|don't|dont)\s*have\s*(?:an\s*)?answer|i\s*(?:can(?:not|'t)|cannot)\s*(?:remember|recall)|i\s*forgot)\b/i;

const SKIP_INTENT_PATTERN =
  /\b(skip|pass|next\s*question|move\s*(?:to|on\s*to)\s*(?:the\s*)?next|proceed\s*(?:to|with)\s*(?:the\s*)?next)\b/i;

export type CandidateAnswerQuality = 'invalid' | 'low-information' | 'substantive';

export function normalizeCandidateAnswer(answer: string): string {
  return (answer ?? '').replace(/\s+/g, ' ').trim();
}

export function classifyCandidateAnswer(answer: string): CandidateAnswerQuality {
  const normalized = normalizeCandidateAnswer(answer);
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;

  if (!normalized) return 'invalid';
  if (PLACEHOLDER_ANSWER_PATTERN.test(normalized)) return 'invalid';
  if (/^[\W_]+$/.test(normalized)) return 'invalid';
  if (LOW_INFORMATION_EXACT_PATTERN.test(normalized)) return 'low-information';

  const hasLowInformationIntent = LOW_INFORMATION_INTENT_PATTERN.test(normalized);
  const hasSkipIntent = SKIP_INTENT_PATTERN.test(normalized);
  if ((hasLowInformationIntent && hasSkipIntent) || (hasLowInformationIntent && wordCount <= 20)) {
    return 'low-information';
  }

  return 'substantive';
}

export function isValidCandidateAnswer(answer: string): boolean {
  return classifyCandidateAnswer(answer) !== 'invalid';
}
