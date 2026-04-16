import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
    fullName: string;
    email: string;
    subject: string;
    message: string;
    status: "new" | "read" | "replied" | "archived";
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema: Schema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
        },
        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
        },
        status: {
            type: String,
            enum: ["new", "read", "replied", "archived"],
            default: "new",
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ status: 1 });

export default mongoose.model<IContact>("Contact", ContactSchema);
