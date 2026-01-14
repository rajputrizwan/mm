import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  interviewId: mongoose.Types.ObjectId;
  text: string;
  type: 'technical' | 'behavioral' | 'situational' | 'coding';
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  expectedAnswer?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'situational', 'coding'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    category: String,
    expectedAnswer: String,
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
