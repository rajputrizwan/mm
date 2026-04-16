import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer extends Document {
  questionId: mongoose.Types.ObjectId;
  interviewId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  text: string;
  audioUrl?: string;
  videoUrl?: string;
  duration: number;
  score?: number;
  feedback?: string;
  aiAnalysis?: {
    sentiment: string;
    confidence: number;
    keywords: string[];
    summary: string;
  };
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: String,
    audioUrl: String,
    videoUrl: String,
    duration: Number,
    score: Number,
    feedback: String,
    aiAnalysis: {
      sentiment: String,
      confidence: Number,
      keywords: [String],
      summary: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Answer = mongoose.model<IAnswer>('Answer', answerSchema);
