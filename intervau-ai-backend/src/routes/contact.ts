import { Router } from "express";
import { ContactController } from "../controllers/ContactController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Public route - Submit contact form
router.post("/", ContactController.submitContactForm);

// Admin routes - Require authentication
// Uncomment these when you want to add admin functionality
// router.get("/", authMiddleware, ContactController.getAllContactMessages);
// router.patch("/:id", authMiddleware, ContactController.updateContactStatus);
// router.delete("/:id", authMiddleware, ContactController.deleteContactMessage);

export default router;
