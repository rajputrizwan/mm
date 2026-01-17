import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
  userId: mongoose.Types.ObjectId;
  resume?: {
    url: string;
    uploadedAt: Date;
  };
  skills: string[];
  experience: string;
  education: string;
  bio?: string;
  portfolio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  interviewCount: number;
  averageScore?: number;
  status: 'active' | 'rejected' | 'accepted' | 'pending';
  appliedPositions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const candidateSchema = new Schema<ICandidate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    resume: {
      url: String,
      uploadedAt: Date,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      default: '',
    },
    education: {
      type: String,
      default: '',
    },
    bio: String,
    portfolio: String,
    linkedinUrl: String,
    githubUrl: String,
    interviewCount: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['active', 'rejected', 'accepted', 'pending'],
      default: 'active',
    },
    appliedPositions: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'JobPosition',
      }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
candidateSchema.index({ userId: 1 });
candidateSchema.index({ status: 1 });

export const Candidate = mongoose.model<ICandidate>('Candidate', candidateSchema);
