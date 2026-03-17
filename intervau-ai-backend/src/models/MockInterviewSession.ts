import mongoose, { Document, Schema } from 'mongoose';

export interface IMockInterviewSession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  position: string;
  jobDescription: string;
  duration: number;
  questionCount: number;
  difficulty: string;
  questions: Array<{
    id: number;
    category: string;
    difficulty: string;
    text: string;
    duration: number;
    answer?: string;
    aiAnalysis?: {
      score: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
    };
  }>;
  status: 'ready' | 'in_progress' | 'completed' | 'abandoned';
  systemCheckPassed: boolean;
  currentQuestionIndex: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  transcript: Array<{
    speaker: 'ai' | 'candidate';
    text: string;
    timestamp: Date;
    questionIndex?: number;
  }>;
  metrics?: {
    overallScore: number;
    confidence: number;
    clarity: number;
    technicalAccuracy: number;
    communicationSkills: number;
    fillerWords: number;
    averageResponseTime: number;
    totalWordsSpoken?: number;
    speakingPaceWPM?: number;
    overallRating?: string;
    recommendation?: string;
    aiAnalysisPercentage?: number;
    resumeMatchPercentage?: number;
  };
  summary?: {
    text?: string;
    strengths?: string[];
    areasForImprovement?: string[];
    recommendations?: string[];
    keyInsights?: string[];
  };
}

const MockInterviewSessionSchema = new Schema<IMockInterviewSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    position: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    questionCount: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    questions: [
      {
        id: Number,
        category: String,
        difficulty: String,
        text: String,
        duration: Number,
        answer: String,
        aiAnalysis: {
          score: Number,
          feedback: String,
          strengths: [String],
          improvements: [String],
        },
      },
    ],
    status: {
      type: String,
      enum: ['ready', 'in_progress', 'completed', 'abandoned'],
      default: 'ready',
    },
    systemCheckPassed: {
      type: Boolean,
      default: false,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    startedAt: Date,
    completedAt: Date,
    transcript: [
      {
        speaker: {
          type: String,
          enum: ['ai', 'candidate'],
        },
        text: String,
        timestamp: Date,
        questionIndex: Number,
      },
    ],
    metrics: {
      overallScore: Number,
      confidence: Number,
      clarity: Number,
      technicalAccuracy: Number,
      communicationSkills: Number,
      fillerWords: Number,
      averageResponseTime: Number,
      totalWordsSpoken: Number,
      speakingPaceWPM: Number,
      overallRating: String,
      recommendation: String,
      aiAnalysisPercentage: Number,
      resumeMatchPercentage: Number,
    },
    summary: {
      text: String,
      strengths: [String],
      areasForImprovement: [String],
      recommendations: [String],
      keyInsights: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
MockInterviewSessionSchema.index({ userId: 1, createdAt: -1 });
MockInterviewSessionSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IMockInterviewSession>(
  'MockInterviewSession',
  MockInterviewSessionSchema
);
