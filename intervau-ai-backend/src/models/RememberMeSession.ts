import mongoose, { Schema, Document } from 'mongoose';

export interface IRememberMeSession extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  refreshToken: string;
  isActive: boolean;
  lastActivityAt: Date;
  createdAt: Date;
  expiresAt: Date;
}

const rememberMeSessionSchema = new Schema<IRememberMeSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceName: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
      default: 'desktop',
    },
    browser: {
      type: String,
      required: true,
    },
    operatingSystem: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      // Automatically delete expired documents
      expires: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
rememberMeSessionSchema.index({ userId: 1, isActive: 1 });
rememberMeSessionSchema.index({ createdAt: -1 });

export const RememberMeSession = mongoose.model<IRememberMeSession>(
  'RememberMeSession',
  rememberMeSessionSchema
);
