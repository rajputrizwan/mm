import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
    candidateId: mongoose.Types.ObjectId;
    jobPositionId: mongoose.Types.ObjectId;
    ai_score: number;
    status: 'Qualified' | 'In Interview' | 'Under Review' | 'Rejected' | 'Accepted';
    appliedAt: Date;
    notes?: string;
    resumeUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
    {
        candidateId: {
            type: Schema.Types.ObjectId,
            ref: 'Candidate',
            required: true,
        },
        jobPositionId: {
            type: Schema.Types.ObjectId,
            ref: 'JobPosition',
            required: true,
        },
        ai_score: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 0,
        },
        status: {
            type: String,
            enum: ['Qualified', 'In Interview', 'Under Review', 'Rejected', 'Accepted'],
            default: 'Under Review',
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
        notes: String,
        resumeUrl: String,
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
applicationSchema.index({ candidateId: 1 });
applicationSchema.index({ jobPositionId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ appliedAt: -1 });
applicationSchema.index({ ai_score: -1 });

// Compound index for dashboard queries
applicationSchema.index({ status: 1, appliedAt: -1 });

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
