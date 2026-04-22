import mongoose, { Document, Schema } from 'mongoose';

export interface IBugReport extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId?: string;
  sessionType: 'mock' | 'live' | 'public' | 'general';
  category:
    | 'audio'
    | 'video'
    | 'ai_response'
    | 'ui_freeze'
    | 'connection'
    | 'scoring'
    | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BugReportSchema = new Schema<IBugReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      trim: true,
    },
    sessionType: {
      type: String,
      enum: ['mock', 'live', 'public', 'general'],
      default: 'mock',
    },
    category: {
      type: String,
      enum: [
        'audio',
        'video',
        'ai_response',
        'ui_freeze',
        'connection',
        'scoring',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 2000,
      trim: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_review', 'resolved', 'closed'],
      default: 'open',
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying by the review team
BugReportSchema.index({ status: 1, createdAt: -1 });
BugReportSchema.index({ userId: 1, createdAt: -1 });
BugReportSchema.index({ sessionId: 1 });

export default mongoose.model<IBugReport>('BugReport', BugReportSchema);
