// backend/src/services/email.service.ts
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { EmailTemplate } from '../templates/email';

export class EmailService {
  private sendgrid: any;
  private transporter: any;

  constructor() {
    // SendGrid pour production
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    this.sendgrid = sgMail;

    // SMTP pour développement
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendWelcomeEmail(user: any) {
    const template = EmailTemplate.welcome(user);
    
    const msg = {
      to: user.email,
      from: {
        email: 'noreply@afristocks.com',
        name: 'AfriStocks'
      },
      subject: template.subject,
      html: template.html,
      text: template.text
    };

    try {
      if (process.env.NODE_ENV === 'production') {
        await this.sendgrid.send(msg);
      } else {
        await this.transporter.sendMail(msg);
      }
      console.log('Email envoyé à:', user.email);
    } catch (error) {
      console.error('Erreur envoi email:', error);
      throw error;
    }
  }

  async sendInvestmentConfirmation(investment: any) {
    const template = EmailTemplate.investmentConfirmation(investment);
    // ... même logique
  }

  async sendKYCApproval(user: any) {
    const template = EmailTemplate.kycApproval(user);
    // ... même logique
  }

  async sendPasswordReset(user: any, resetToken: string) {
    const resetUrl = `https://afristocks.com/reset-password?token=${resetToken}`;
    const template = EmailTemplate.passwordReset(user, resetUrl);
    // ... même logique
  }
}