import mongoose, { Schema, Document } from 'mongoose';

export interface IResumeAnalysis extends Document {
    userId: mongoose.Types.ObjectId;
    fileName: string;
    matchScore: number;
    extractedSkills: Array<{
        name: string;
        category: string;
        level?: number;
    }>;
    skillGaps: Array<{
        skill: string;
        importance: string;
        recommendation: string;
    }>;
    suggestedQuestions: Array<{
        question: string;
        category: string;
        difficulty: string;
    }>;
    analyzedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const resumeAnalysisSchema = new Schema<IResumeAnalysis>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // one analysis per user (upsert replaces on re-upload)
            index: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        matchScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        extractedSkills: [
            {
                name: { type: String, required: true },
                category: { type: String, required: true },
                level: { type: Number, min: 0, max: 100 },
            },
        ],
        skillGaps: [
            {
                skill: { type: String, required: true },
                importance: { type: String, required: true },
                recommendation: { type: String, required: true },
            },
        ],
        suggestedQuestions: [
            {
                question: { type: String, required: true },
                category: { type: String, required: true },
                difficulty: { type: String, required: true },
            },
        ],
        analyzedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export const ResumeAnalysis = mongoose.model<IResumeAnalysis>(
    'ResumeAnalysis',
    resumeAnalysisSchema
);
