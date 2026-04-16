import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
  candidateId: mongoose.Types.ObjectId;
  hrId: mongoose.Types.ObjectId;
  jobPositionId: mongoose.Types.ObjectId;
  type: 'mock' | 'live';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  score?: number;
  feedback?: string;
  questions: mongoose.Types.ObjectId[];
  answers: mongoose.Types.ObjectId[];
  transcript?: string;
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hrId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    jobPositionId: {
      type: Schema.Types.ObjectId,
      ref: 'JobPosition',
    },
    type: {
      type: String,
      enum: ['mock', 'live'],
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    scheduledAt: Date,
    startedAt: Date,
    endedAt: Date,
    duration: Number,
    score: Number,
    feedback: String,
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    answers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Answer',
      },
    ],
    transcript: String,
    recordingUrl: String,
  },
  {
    timestamps: true,
  }
);

export const Interview = mongoose.model<IInterview>('Interview', interviewSchema);
