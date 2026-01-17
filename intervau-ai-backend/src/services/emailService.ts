import nodemailer from 'nodemailer';
import { config } from '../config/environment';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465, // true for 465, false for other ports
  auth: {
    user: config.smtp.user,
    pass: config.smtp.password,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error);
  } else {
    console.log('✓ Email service ready');
  }
});

interface ContactFormData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  submittedAt?: Date;
}

/**
 * Send contact form notification email
 */
export const sendContactNotification = async (formData: ContactFormData): Promise<void> => {
  try {
    const { fullName, email, subject, message, submittedAt = new Date() } = formData;

    // Format the submission time
    const formattedDate = submittedAt.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    // Create well-formatted HTML email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
              color: white;
              padding: 25px;
              border-radius: 8px;
              margin-bottom: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .header p {
              margin: 10px 0 0 0;
              opacity: 0.95;
              font-size: 14px;
            }
            .info-section {
              margin: 25px 0;
            }
            .info-row {
              display: flex;
              margin-bottom: 15px;
              padding: 12px;
              background: #f8fafc;
              border-radius: 6px;
              border-left: 3px solid #2563eb;
            }
            .info-label {
              font-weight: 600;
              color: #1e293b;
              min-width: 120px;
              font-size: 14px;
            }
            .info-value {
              color: #475569;
              flex: 1;
              font-size: 14px;
            }
            .message-box {
              background: #f1f5f9;
              border-left: 4px solid #06b6d4;
              padding: 20px;
              border-radius: 8px;
              margin: 25px 0;
            }
            .message-box h3 {
              margin: 0 0 15px 0;
              color: #1e293b;
              font-size: 16px;
            }
            .message-content {
              color: #334155;
              white-space: pre-wrap;
              word-wrap: break-word;
              line-height: 1.7;
              font-size: 14px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #64748b;
              font-size: 12px;
            }
            .footer strong {
              color: #2563eb;
            }
            .timestamp {
              background: #dbeafe;
              color: #1e40af;
              padding: 8px 15px;
              border-radius: 6px;
              display: inline-block;
              margin-top: 10px;
              font-size: 13px;
              font-weight: 500;
            }
            @media only screen and (max-width: 600px) {
              .info-row {
                flex-direction: column;
              }
              .info-label {
                margin-bottom: 5px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📩 New Contact Form Submission</h1>
              <p>Intervau.AI Platform</p>
            </div>

            <div class="info-section">
              <div class="info-row">
                <span class="info-label">👤 Name:</span>
                <span class="info-value"><strong>${fullName}</strong></span>
              </div>
              
              <div class="info-row">
                <span class="info-label">📧 Email:</span>
                <span class="info-value"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></span>
              </div>
              
              <div class="info-row">
                <span class="info-label">📋 Subject:</span>
                <span class="info-value"><strong>${subject}</strong></span>
              </div>
            </div>

            <div class="message-box">
              <h3>💬 Message:</h3>
              <div class="message-content">${message}</div>
            </div>

            <div style="text-align: center;">
              <div class="timestamp">
                🕐 Submitted: ${formattedDate}
              </div>
            </div>

            <div class="footer">
              <p>This is an automated notification from <strong>Intervau.AI</strong></p>
              <p>You can reply directly to <a href="mailto:${email}" style="color: #2563eb;">${email}</a> to respond to this inquiry.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Plain text version for email clients that don't support HTML
    const textContent = `
New Contact Form Submission - Intervau.AI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NAME: ${fullName}
EMAIL: ${email}
SUBJECT: ${subject}

MESSAGE:
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Submitted: ${formattedDate}

You can reply to this inquiry at: ${email}
    `.trim();

    // Send email
    const info = await transporter.sendMail({
      from: `"Intervau.AI Contact Form" <${config.smtp.from}>`,
      to: config.contactNotificationEmail,
      replyTo: email, // Allow direct reply to the person who submitted the form
      subject: `📩 New Contact: ${subject}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('✓ Contact notification email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send contact notification email:', error);
    throw error;
  }
};

/**
 * Send confirmation email to the person who submitted the form
 */
export const sendContactConfirmation = async (formData: ContactFormData): Promise<void> => {
  try {
    const { fullName, email, subject } = formData;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
              color: white;
              padding: 25px;
              border-radius: 8px;
              margin-bottom: 25px;
              text-align: center;
            }
            .content {
              color: #475569;
              line-height: 1.8;
            }
            .highlight {
              background: #dbeafe;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #2563eb;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #64748b;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Message Received!</h1>
            </div>
            
            <div class="content">
              <p>Hi <strong>${fullName}</strong>,</p>
              
              <p>Thank you for contacting <strong>Intervau.AI</strong>! We've received your message and our team will review it shortly.</p>
              
              <div class="highlight">
                <p style="margin: 0;"><strong>Your inquiry:</strong> ${subject}</p>
              </div>
              
              <p>We typically respond within <strong>24-48 hours</strong>. If your matter is urgent, please feel free to reach out to us directly at <a href="mailto:${config.smtp.user}" style="color: #2563eb;">${config.smtp.user}</a>.</p>
              
              <p>In the meantime, feel free to explore our platform and prepare for your next interview with confidence!</p>
              
              <p>Best regards,<br><strong>The Intervau.AI Team</strong></p>
            </div>
            
            <div class="footer">
              <p><strong>Intervau.AI</strong> - AI-Powered Interview Intelligence</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Hi ${fullName},

Thank you for contacting Intervau.AI! We've received your message and our team will review it shortly.

Your inquiry: ${subject}

We typically respond within 24-48 hours. If your matter is urgent, please feel free to reach out to us directly at ${config.smtp.user}.

In the meantime, feel free to explore our platform and prepare for your next interview with confidence!

Best regards,
The Intervau.AI Team
    `.trim();

    await transporter.sendMail({
      from: `"Intervau.AI" <${config.smtp.from}>`,
      to: email,
      subject: `✅ We received your message - Intervau.AI`,
      text: textContent,
      html: htmlContent,
    });

    console.log('✓ Confirmation email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
    // Don't throw error here - confirmation email failure shouldn't break the flow
  }
};

/**
 * Send password reset email with secure token link
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
): Promise<void> => {
  try {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
    const expiryMinutes = 60; // 1 hour

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
              color: white;
              padding: 25px;
              border-radius: 8px;
              margin-bottom: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              color: #475569;
              line-height: 1.8;
            }
            .reset-button {
              display: inline-block;
              background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
              color: white;
              text-decoration: none;
              padding: 14px 32px;
              border-radius: 8px;
              font-weight: 600;
              margin: 25px 0;
              text-align: center;
            }
            .warning-box {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .expiry-info {
              background: #dbeafe;
              padding: 12px;
              border-radius: 6px;
              text-align: center;
              margin: 20px 0;
              font-weight: 500;
              color: #1e40af;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #64748b;
              font-size: 13px;
            }
            .footer a {
              color: #2563eb;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            
            <div class="content">
              <p>Hi <strong>${name}</strong>,</p>
              
              <p>We received a request to reset your password for your <strong>Intervau.AI</strong> account. If you didn't make this request, you can safely ignore this email.</p>
              
              <p>To reset your password, click the button below:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="reset-button">Reset My Password</a>
              </div>
              
              <div class="expiry-info">
                ⏰ This link will expire in ${expiryMinutes} minutes
              </div>
              
              <div class="warning-box">
                <strong>⚠️ Security Reminder:</strong> If you didn't request this password reset, please secure your account immediately by changing your password or contacting our support team.
              </div>
              
              <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
            
            <div class="footer">
              <p><strong>Intervau.AI</strong> - AI-Powered Interview Intelligence</p>
              <p>Need help? Contact us at <a href="mailto:${config.smtp.user}">${config.smtp.user}</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Hi ${name},

We received a request to reset your password for your Intervau.AI account. If you didn't make this request, you can safely ignore this email.

To reset your password, visit this link:
${resetUrl}

This link will expire in ${expiryMinutes} minutes.

SECURITY REMINDER: If you didn't request this password reset, please secure your account immediately by changing your password or contacting our support team.

Best regards,
The Intervau.AI Team

Need help? Contact us at ${config.smtp.user}
    `.trim();

    const info = await transporter.sendMail({
      from: `"Intervau.AI Security" <${config.smtp.from}>`,
      to: email,
      subject: '🔐 Reset Your Password - Intervau.AI',
      text: textContent,
      html: htmlContent,
    });

    console.log('✓ Password reset email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw error;
  }
};

/**
 * Send password reset confirmation email
 */
export const sendPasswordResetConfirmation = async (
  email: string,
  name: string
): Promise<void> => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 25px;
              border-radius: 8px;
              margin-bottom: 25px;
              text-align: center;
            }
            .content {
              color: #475569;
              line-height: 1.8;
            }
            .success-box {
              background: #d1fae5;
              border-left: 4px solid #10b981;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #64748b;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Reset Successful</h1>
            </div>
            
            <div class="content">
              <p>Hi <strong>${name}</strong>,</p>
              
              <p>This is a confirmation that your password for your <strong>Intervau.AI</strong> account has been successfully changed.</p>
              
              <div class="success-box">
                <strong>✓ Your password has been updated</strong><br>
                You can now log in using your new password.
              </div>
              
              <p>If you didn't make this change, please contact our support team immediately at <a href="mailto:${config.smtp.user}" style="color: #2563eb;">${config.smtp.user}</a>.</p>
              
              <p>Best regards,<br><strong>The Intervau.AI Team</strong></p>
            </div>
            
            <div class="footer">
              <p><strong>Intervau.AI</strong> - AI-Powered Interview Intelligence</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Hi ${name},

This is a confirmation that your password for your Intervau.AI account has been successfully changed.

You can now log in using your new password.

If you didn't make this change, please contact our support team immediately at ${config.smtp.user}.

Best regards,
The Intervau.AI Team
    `.trim();

    await transporter.sendMail({
      from: `"Intervau.AI Security" <${config.smtp.from}>`,
      to: email,
      subject: '✅ Password Reset Successful - Intervau.AI',
      text: textContent,
      html: htmlContent,
    });

    console.log('✓ Password reset confirmation sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send password reset confirmation:', error);
    // Don't throw - confirmation email failure shouldn't break the flow
  }
};

export default {
  sendContactNotification,
  sendContactConfirmation,
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
};
