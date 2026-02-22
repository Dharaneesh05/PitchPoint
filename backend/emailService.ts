import crypto from 'crypto';

interface EmailService {
  sendVerificationEmail(email: string, token: string, username: string): Promise<boolean>;
  sendPasswordResetEmail(email: string, token: string, username: string): Promise<boolean>;
  sendWelcomeEmail(email: string, username: string): Promise<boolean>;
}

class MockEmailService implements EmailService {
  async sendVerificationEmail(email: string, token: string, username: string): Promise<boolean> {
    // In a real application, you would integrate with services like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Resend
    // - Mailgun
    
    console.log(`📧 Mock Email Service: Sending verification email`);
    console.log(`To: ${email}`);
    console.log(`Subject: Verify your CricketPro account`);
    console.log(`Username: ${username}`);
    console.log(`Verification Token: ${token}`);
    console.log(`Verification URL: ${process.env.CLIENT_URL || 'http://localhost:5000'}/verify-email?token=${token}`);
    
    // Mock successful delivery
    return true;
  }

  async sendPasswordResetEmail(email: string, token: string, username: string): Promise<boolean> {
    console.log(`📧 Mock Email Service: Sending password reset email`);
    console.log(`To: ${email}`);
    console.log(`Subject: Reset your CricketPro password`);
    console.log(`Username: ${username}`);
    console.log(`Reset Token: ${token}`);
    console.log(`Reset URL: ${process.env.CLIENT_URL || 'http://localhost:5000'}/reset-password?token=${token}`);
    
    return true;
  }

  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    console.log(`📧 Mock Email Service: Sending welcome email`);
    console.log(`To: ${email}`);
    console.log(`Subject: Welcome to CricketPro!`);
    console.log(`Username: ${username}`);
    
    return true;
  }
}

// Real implementation example (commented out)
/*
import sgMail from '@sendgrid/mail';

class SendGridEmailService implements EmailService {
  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async sendVerificationEmail(email: string, token: string, username: string): Promise<boolean> {
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@cricketpro.com',
      subject: 'Verify your CricketPro account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to CricketPro!</h1>
          <p>Hi ${username},</p>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/verify-email?token=${token}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>This verification link will expire in 24 hours.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">CricketPro - Professional Cricket Analytics Platform</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, token: string, username: string): Promise<boolean> {
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@cricketpro.com',
      subject: 'Reset your CricketPro password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Password Reset Request</h1>
          <p>Hi ${username},</p>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/reset-password?token=${token}" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          <p>This reset link will expire in 1 hour.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">CricketPro - Professional Cricket Analytics Platform</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@cricketpro.com',
      subject: 'Welcome to CricketPro!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to CricketPro! 🏏</h1>
          <p>Hi ${username},</p>
          <p>Welcome to the future of cricket analytics! Your account has been successfully verified.</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>What you can do now:</h3>
            <ul>
              <li>🏆 Access professional cricket analytics</li>
              <li>📊 Analyze player performance data</li>
              <li>⚡ Get real-time match insights</li>
              <li>🎯 Make data-driven predictions</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard" 
               style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Get Started
            </a>
          </div>
          <p>If you have any questions, feel free to contact our support team.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">CricketPro - Professional Cricket Analytics Platform</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }
}
*/

export class OTPService {
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static generateExpiry(minutes: number = 15): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  static isTokenValid(expires: Date): boolean {
    return new Date() < expires;
  }
}

// Use mock service for development, real service for production
export const emailService: EmailService = new MockEmailService();

// For production, uncomment this:
// export const emailService: EmailService = new SendGridEmailService();

export type { EmailService };