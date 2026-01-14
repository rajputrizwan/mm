import mongoose, { Schema, Document } from "mongoose";

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
  interviewCount: number;
  averageScore?: number;
  status: "active" | "rejected" | "accepted" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

const candidateSchema = new Schema<ICandidate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      url: String,
      uploadedAt: Date,
    },
    skills: [String],
    experience: String,
    education: String,
    bio: String,
    interviewCount: {
      type: Number,
      default: 0,
    },
    averageScore: Number,
    status: {
      type: String,
      enum: ["active", "rejected", "accepted", "pending"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const Candidate = mongoose.model<ICandidate>(
  "Candidate",
  candidateSchema
);
