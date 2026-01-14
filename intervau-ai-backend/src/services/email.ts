import nodemailer from 'nodemailer';
import { config } from '../config/environment';

/**
 * Email service for sending notifications
 */
export class EmailService {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
    });
  }

  /**
   * Send email
   */
  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: config.smtp.from,
        to,
        subject,
        html,
      });
      console.log('✓ Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('✗ Email send failed:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email: string, name: string) {
    const html = `
      <h2>Welcome to Intervau.AI</h2>
      <p>Hi ${name},</p>
      <p>Thank you for registering with Intervau.AI!</p>
      <p>You can now log in and start your interview journey.</p>
      <p>Best regards,<br/>Intervau.AI Team</p>
    `;
    return this.sendEmail(email, 'Welcome to Intervau.AI', html);
  }

  /**
   * Send interview scheduled email
   */
  async sendInterviewScheduledEmail(
    candidateEmail: string,
    candidateName: string,
    interviewDate: string,
    position: string
  ) {
    const html = `
      <h2>Interview Scheduled</h2>
      <p>Hi ${candidateName},</p>
      <p>Your interview for the position of <strong>${position}</strong> has been scheduled.</p>
      <p><strong>Date & Time:</strong> ${interviewDate}</p>
      <p>Please log in to the platform to join the interview.</p>
      <p>Best regards,<br/>Intervau.AI Team</p>
    `;
    return this.sendEmail(candidateEmail, 'Interview Scheduled', html);
  }

  /**
   * Send interview feedback email
   */
  async sendInterviewFeedbackEmail(
    candidateEmail: string,
    candidateName: string,
    score: number,
    feedback: string
  ) {
    const html = `
      <h2>Interview Feedback</h2>
      <p>Hi ${candidateName},</p>
      <p>Thank you for completing the interview!</p>
      <p><strong>Your Score:</strong> ${score}/100</p>
      <p><strong>Feedback:</strong></p>
      <p>${feedback}</p>
      <p>Best regards,<br/>Intervau.AI Team</p>
    `;
    return this.sendEmail(candidateEmail, 'Interview Feedback', html);
  }
}

export const emailService = new EmailService();
