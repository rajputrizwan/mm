import { config } from './src/config/environment';
import nodemailer from 'nodemailer';

/**
 * Email Configuration Test Script
 * Run this to verify SMTP settings are working correctly
 */

async function testEmailConfiguration() {
    console.log('\n🧪 Testing Email Configuration...\n');

    // Display SMTP settings (without password)
    console.log('📧 SMTP Configuration:');
    console.log(`   Host: ${config.smtp.host}`);
    console.log(`   Port: ${config.smtp.port}`);
    console.log(`   User: ${config.smtp.user}`);
    console.log(`   From: ${config.smtp.from}`);
    console.log(`   Secure: ${config.smtp.port === 465}`);
    console.log('');

    // Create transporter
    const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: {
            user: config.smtp.user,
            pass: config.smtp.password,
        },
    });

    try {
        // Verify connection
        console.log('🔌 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully!\n');

        // Send test email
        console.log('📨 Sending test email...');
        const info = await transporter.sendMail({
            from: `"Intervau.AI Test" <${config.smtp.from}>`,
            to: config.smtp.user,
            subject: '✅ Email Configuration Test - Intervau.AI',
            text: `
This is a test email to verify your SMTP configuration is working correctly.

If you received this email, your email service is properly configured and ready to send password reset emails!

Configuration Details:
- Host: ${config.smtp.host}
- Port: ${config.smtp.port}
- From: ${config.smtp.from}

Timestamp: ${new Date().toISOString()}

You can now use the Forgot Password feature with confidence!
            `.trim(),
            html: `
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
        .info-box {
            background: #f1f5f9;
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
            <h1>✅ Email Configuration Test</h1>
        </div>
        
        <div class="content">
            <p><strong>Congratulations!</strong></p>
            
            <p>This is a test email to verify your SMTP configuration is working correctly.</p>
            
            <div class="success-box">
                <strong>✓ Email Service is Operational</strong><br>
                If you received this email, your email service is properly configured and ready to send password reset emails!
            </div>
            
            <div class="info-box">
                <strong>Configuration Details:</strong><br>
                <ul style="margin: 10px 0;">
                    <li>Host: ${config.smtp.host}</li>
                    <li>Port: ${config.smtp.port}</li>
                    <li>From: ${config.smtp.from}</li>
                </ul>
                <p style="margin: 10px 0; font-size: 12px; color: #64748b;">
                    Timestamp: ${new Date().toISOString()}
                </p>
            </div>
            
            <p>You can now use the Forgot Password feature with confidence!</p>
        </div>
        
        <div class="footer">
            <p><strong>Intervau.AI</strong> - Email Configuration Test</p>
        </div>
    </div>
</body>
</html>
            `.trim(),
        });

        console.log('✅ Test email sent successfully!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   To: ${config.smtp.user}`);
        console.log('');
        console.log('✅ Email configuration is working correctly!');
        console.log('   Check your inbox to confirm receipt.');
        console.log('');

    } catch (error) {
        console.error('❌ Email configuration test failed!');
        console.error('');
        console.error('Error details:');
        console.error(error);
        console.error('');
        console.error('Common solutions:');
        console.error('1. Check SMTP credentials in .env file');
        console.error('2. For Gmail: Use App Password, not regular password');
        console.error('3. Ensure 2FA is enabled on Gmail account');
        console.error('4. Check firewall/network settings');
        console.error('5. Verify SMTP_HOST and SMTP_PORT are correct');
        console.error('');
        process.exit(1);
    }
}

// Run the test
testEmailConfiguration()
    .then(() => {
        console.log('🎉 Email configuration test completed successfully!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Unexpected error:', error);
        process.exit(1);
    });
