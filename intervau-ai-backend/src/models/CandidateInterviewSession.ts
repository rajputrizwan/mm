import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidateInterviewSession extends Document {
  sessionId: string;
  templateId?: mongoose.Types.ObjectId;
  shareableLink?: string;
  candidateName: string;
  candidateEmail: string;
  jobPosition: string;
  questions: Array<{
    id: number;
    text: string;
    type: string;
  }>;
  conversation: Array<{
    question: string;
    answer: string;
  }>;
  transcript: Array<{
    speaker: 'assistant' | 'candidate';
    text: string;
    timestamp: Date;
  }>;
  feedback?: Record<string, unknown>;
  status: 'active' | 'completed' | 'abandoned';
  startedAt?: Date;
  endedAt?: Date;
  durationSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateInterviewSessionSchema = new Schema<ICandidateInterviewSession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'InterviewTemplate',
    },
    shareableLink: {
      type: String,
      index: true,
    },
    candidateName: {
      type: String,
      required: true,
      trim: true,
    },
    candidateEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    jobPosition: {
      type: String,
      required: true,
      trim: true,
    },
    questions: [
      {
        id: Number,
        text: String,
        type: String,
      },
    ],
    conversation: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          default: '(No answer provided)',
        },
      },
    ],
    transcript: [
      {
        speaker: {
          type: String,
          enum: ['assistant', 'candidate'],
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          required: true,
        },
      },
    ],
    feedback: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
      index: true,
    },
    startedAt: Date,
    endedAt: Date,
    durationSeconds: Number,
  },
  {
    timestamps: true,
  }
);

CandidateInterviewSessionSchema.index({ candidateEmail: 1, createdAt: -1 });
CandidateInterviewSessionSchema.index({ templateId: 1, createdAt: -1 });

export default mongoose.model<ICandidateInterviewSession>(
  'CandidateInterviewSession',
  CandidateInterviewSessionSchema
);
