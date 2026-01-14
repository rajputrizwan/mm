import mongoose, { Schema, Document } from "mongoose";

export interface IJobPosition extends Document {
  hrId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  department: string;
  requiredSkills: string[];
  experience: string;
  salary?: string;
  location: string;
  applicants: mongoose.Types.ObjectId[];
  interviews: mongoose.Types.ObjectId[];
  status: "open" | "closed" | "filled";
  createdAt: Date;
  updatedAt: Date;
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
    department: String,
    requiredSkills: [String],
    experience: String,
    salary: String,
    location: String,
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
      enum: ["open", "closed", "filled"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

export const JobPosition = mongoose.model<IJobPosition>(
  "JobPosition",
  jobPositionSchema
);
