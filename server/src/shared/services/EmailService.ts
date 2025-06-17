// src/shared/services/emailService.ts
import nodemailer from 'nodemailer';
import { IEmailService } from './IEmailService';
import dotenv from 'dotenv';

dotenv.config();

class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;
  
  constructor() {

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-account/${token}`;
    
    await this.transporter.sendMail({
      from: `"${process.env.APP_NAME || 'Learning Platform'}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Verify Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Account</h2>
          <p>Thank you for registering! Please click the button below to verify your account:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Verify Account
          </a>
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `
    });
  }
  
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    
    await this.transporter.sendMail({
      from: `"${process.env.APP_NAME || 'Learning Platform'}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested a password reset. Please click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Reset Password
          </a>
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `
    });
  }
}

export default new EmailService();