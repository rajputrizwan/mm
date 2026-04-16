import {
  classifyCandidateAnswer,
  isValidCandidateAnswer,
  normalizeCandidateAnswer,
} from './mockInterviewScoring';

describe('mockInterviewScoring', () => {
  describe('normalizeCandidateAnswer', () => {
    it('should trim and collapse extra whitespace', () => {
      expect(normalizeCandidateAnswer('  hello    world  ')).toBe('hello world');
    });
  });

  describe('isValidCandidateAnswer', () => {
    it('should reject empty and whitespace-only values', () => {
      expect(isValidCandidateAnswer('')).toBe(false);
      expect(isValidCandidateAnswer('   ')).toBe(false);
    });

    it('should reject no-answer placeholder values', () => {
      expect(isValidCandidateAnswer('(No answer provided)')).toBe(false);
      expect(isValidCandidateAnswer('no answer provided')).toBe(false);
      expect(isValidCandidateAnswer('N/A')).toBe(false);
      expect(isValidCandidateAnswer('none')).toBe(false);
    });

    it('should classify low-information answers as valid but low-information', () => {
      expect(classifyCandidateAnswer("I don't know")).toBe('low-information');
      expect(classifyCandidateAnswer('not sure')).toBe('low-information');
      expect(classifyCandidateAnswer('No idea.')).toBe('low-information');
      expect(
        classifyCandidateAnswer(
          "Sorry, I don't know how to answer. Can you proceed towards the next?"
        )
      ).toBe('low-information');
      expect(classifyCandidateAnswer("Sorry, I don't have answer, uh, to this question.")).toBe(
        'low-information'
      );

      expect(isValidCandidateAnswer("I don't know")).toBe(true);
      expect(isValidCandidateAnswer('not sure')).toBe(true);
    });

    it('should reject punctuation-only text', () => {
      expect(isValidCandidateAnswer('...')).toBe(false);
      expect(isValidCandidateAnswer('---')).toBe(false);
    });

    it('should accept meaningful candidate responses', () => {
      expect(isValidCandidateAnswer('I improved page load by 40% using lazy loading.')).toBe(true);
      expect(isValidCandidateAnswer('Used React Query and caching to reduce API latency.')).toBe(
        true
      );
      expect(classifyCandidateAnswer('Used React Query and caching to reduce API latency.')).toBe(
        'substantive'
      );
    });
  });
});
