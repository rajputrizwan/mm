import mongoose, { Schema, Document } from 'mongoose';

export interface IPendingRegistration extends Document {
  email: string;
  hashedPassword: string;
  name: string;
  role: 'candidate' | 'hr';
  companyName?: string;
  verificationToken: string; // SHA-256 hashed token stored in DB
  expiresAt: Date;
  createdAt: Date;
}

const pendingRegistrationSchema = new Schema<IPendingRegistration>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['candidate', 'hr'],
      required: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    verificationToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // MongoDB TTL index: auto-delete document when expiresAt is reached
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one pending registration per email at a time
pendingRegistrationSchema.index({ email: 1 }, { unique: true });

export const PendingRegistration = mongoose.model<IPendingRegistration>(
  'PendingRegistration',
  pendingRegistrationSchema
);
