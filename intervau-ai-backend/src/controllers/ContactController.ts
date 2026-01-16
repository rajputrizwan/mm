import { Request, Response } from "express";
import Contact from "../models/Contact";

export class ContactController {
    /**
     * Submit a new contact form
     * POST /api/contact
     */
    static async submitContactForm(req: Request, res: Response): Promise<void> {
        try {
            const { fullName, email, subject, message } = req.body;

            // Validation
            if (!fullName || !email || !subject || !message) {
                res.status(400).json({
                    success: false,
                    message: "All fields are required",
                });
                return;
            }

            // Email validation
            const emailRegex = /\S+@\S+\.\S+/;
            if (!emailRegex.test(email)) {
                res.status(400).json({
                    success: false,
                    message: "Please provide a valid email address",
                });
                return;
            }

            // Create new contact entry
            const contact = new Contact({
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                subject: subject.trim(),
                message: message.trim(),
            });

            await contact.save();

            res.status(201).json({
                success: true,
                message: "Thank you for contacting us! We'll get back to you soon.",
                data: {
                    id: contact._id,
                    createdAt: contact.createdAt,
                },
            });
        } catch (error: any) {
            console.error("Contact form submission error:", error);
            res.status(500).json({
                success: false,
                message: "An error occurred while submitting your message. Please try again later.",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }
    }

    /**
     * Get all contact messages (Admin only)
     * GET /api/contact
     */
    static async getAllContactMessages(req: Request, res: Response): Promise<void> {
        try {
            const { status, page = 1, limit = 10 } = req.query;

            const query: any = {};
            if (status) {
                query.status = status;
            }

            const skip = (Number(page) - 1) * Number(limit);

            const [contacts, total] = await Promise.all([
                Contact.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit)),
                Contact.countDocuments(query),
            ]);

            res.status(200).json({
                success: true,
                data: contacts,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit)),
                },
            });
        } catch (error: any) {
            console.error("Fetch contact messages error:", error);
            res.status(500).json({
                success: false,
                message: "An error occurred while fetching contact messages",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }
    }

    /**
     * Update contact message status (Admin only)
     * PATCH /api/contact/:id
     */
    static async updateContactStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!["new", "read", "replied", "archived"].includes(status)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid status value",
                });
                return;
            }

            const contact = await Contact.findByIdAndUpdate(
                id,
                { status },
                { new: true, runValidators: true }
            );

            if (!contact) {
                res.status(404).json({
                    success: false,
                    message: "Contact message not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Status updated successfully",
                data: contact,
            });
        } catch (error: any) {
            console.error("Update contact status error:", error);
            res.status(500).json({
                success: false,
                message: "An error occurred while updating the status",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }
    }

    /**
     * Delete contact message (Admin only)
     * DELETE /api/contact/:id
     */
    static async deleteContactMessage(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const contact = await Contact.findByIdAndDelete(id);

            if (!contact) {
                res.status(404).json({
                    success: false,
                    message: "Contact message not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Contact message deleted successfully",
            });
        } catch (error: any) {
            console.error("Delete contact message error:", error);
            res.status(500).json({
                success: false,
                message: "An error occurred while deleting the message",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            });
        }
    }
}
