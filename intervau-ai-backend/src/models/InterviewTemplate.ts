import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IInterviewTemplate extends Document {
    hrId: mongoose.Types.ObjectId;
    jobPosition: string;
    jobDescription: string;
    techStack: string[];
    interviewType: 'mock' | 'live';
    interviewModes: string[];
    duration: 15 | 30 | 45 | 60;
    availability: {
        type: 'anytime' | 'scheduled';
        scheduledDate?: Date;
    };
    visibility: 'public' | 'private';
    aiSettings: {
        difficultyLevel: 'junior' | 'mid' | 'senior';
        autoScore: boolean;
        enableAiFeedback: boolean;
    };
    questions: Array<{
        id: number;
        text: string;
        type: string;
        expectedAnswer?: string;
    }>;
    shareableLink: string;
    status: 'draft' | 'active' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}

const interviewTemplateSchema = new Schema<IInterviewTemplate>(
    {
        hrId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        jobPosition: {
            type: String,
            required: true,
            trim: true,
        },
        jobDescription: {
            type: String,
            required: true,
        },
        techStack: {
            type: [String],
            default: [],
        },
        interviewType: {
            type: String,
            enum: ['mock', 'live'],
            required: true,
        },
        interviewModes: {
            type: [String],
            enum: ['technical', 'behavioral', 'experience', 'problem_solving', 'leadership'],
            required: true,
        },
        duration: {
            type: Number,
            enum: [15, 30, 45, 60],
            default: 30,
        },
        availability: {
            type: {
                type: String,
                enum: ['anytime', 'scheduled'],
                default: 'anytime',
            },
            scheduledDate: Date,
        },
        visibility: {
            type: String,
            enum: ['public', 'private'],
            default: 'public',
        },
        aiSettings: {
            difficultyLevel: {
                type: String,
                enum: ['junior', 'mid', 'senior'],
                default: 'mid',
            },
            autoScore: {
                type: Boolean,
                default: true,
            },
            enableAiFeedback: {
                type: Boolean,
                default: true,
            },
        },
        questions: [
            {
                id: {
                    type: Number,
                    required: true,
                },
                text: {
                    type: String,
                    required: true,
                },
                type: {
                    type: String,
                    required: true,
                },
                expectedAnswer: String,
            },
        ],
        shareableLink: {
            type: String,
            unique: true,
            sparse: true,
        },
        status: {
            type: String,
            enum: ['draft', 'active', 'archived'],
            default: 'draft',
        },
    },
    {
        timestamps: true,
    }
);

// Generate shareable link before saving
interviewTemplateSchema.pre('save', function (next) {
    if (!this.shareableLink) {
        this.shareableLink = uuidv4();
    }
    next();
});

// Index for faster queries
interviewTemplateSchema.index({ hrId: 1, status: 1 });
interviewTemplateSchema.index({ visibility: 1, status: 1 });
interviewTemplateSchema.index({ shareableLink: 1 });

export const InterviewTemplate = mongoose.model<IInterviewTemplate>(
    'InterviewTemplate',
    interviewTemplateSchema
);
