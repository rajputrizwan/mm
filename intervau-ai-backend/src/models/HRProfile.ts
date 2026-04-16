import mongoose, { Schema, Document } from 'mongoose';

export interface IHRProfile extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  companyWebsite?: string;
  companyLogo?: string;
  department?: string;
  designation?: string;
  phone?: string;
  bio?: string;
  postedPositions: mongoose.Types.ObjectId[];
  totalInterviewsConducted: number;
  averageRating?: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const hrProfileSchema = new Schema<IHRProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyWebsite: String,
    companyLogo: String,
    department: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    phone: String,
    bio: String,
    postedPositions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'JobPosition',
      },
    ],
    totalInterviewsConducted: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
hrProfileSchema.index({ userId: 1 });
hrProfileSchema.index({ isVerified: 1 });

export const HRProfile = mongoose.model<IHRProfile>('HRProfile', hrProfileSchema);
