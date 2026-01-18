import mongoose, { Schema, Document } from "mongoose";

export interface IJobPosition extends Document {
  hrId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  department: string;
  requiredSkills: string[];
  experience: string;
  salary?: string;
  salary_range?: string;
  location: string;
  applicants: mongoose.Types.ObjectId[];
  interviews: mongoose.Types.ObjectId[];
  status: "active" | "paused" | "open" | "closed" | "filled";
  posted_at: Date;
  createdAt: Date;
  updatedAt: Date;
  total_applicants?: number;
  qualified_count?: number;
}

const jobPositionSchema = new Schema<IJobPosition>(
  {
    hrId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    department: {
      type: String,
      required: true,
    },
    requiredSkills: [String],
    experience: String,
    salary: String,
    salary_range: String,
    location: String,
    posted_at: {
      type: Date,
      default: Date.now,
    },
    applicants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Candidate",
      },
    ],
    interviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Interview",
      },
    ],
    status: {
      type: String,
      enum: ["active", "paused", "open", "closed", "filled"],
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
jobPositionSchema.index({ title: 'text' });
jobPositionSchema.index({ department: 1 });
jobPositionSchema.index({ status: 1 });
jobPositionSchema.index({ posted_at: -1 });

export const JobPosition = mongoose.model<IJobPosition>(
  "JobPosition",
  jobPositionSchema
);
