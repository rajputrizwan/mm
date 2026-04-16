export interface Question {
  id: number;
  category: string;
  difficulty: string;
  text: string;
  duration: number;
}

export interface SessionConfig {
  id: string;
  position: string;
  duration: number;
  questionCount: number;
  difficulty: string;
  questions: Question[];
  startedAt: string;
}

export interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  time: string;
  isCandidate: boolean;
}

export interface LiveMetrics {
  confidence: number;
  clarity: number;
  pace: number;
  eyeContact: number;
  technicalAccuracy: number;
  articulation: number;
}

export interface SpeakingPatterns {
  fillerWords: number;
  avgResponseTime: string;
  totalWords: number;
  avgWordsPerMinute: number;
}

export type TipType = "success" | "warning" | "info";

export interface RealTimeTip {
  type: TipType;
  message: string;
}
