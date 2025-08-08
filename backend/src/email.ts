// src/config/email.ts
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// Interface pour les options d'email
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      // Option 1: Utiliser Gmail avec mot de passe d'application
      if (process.env.EMAIL_SERVICE === 'gmail') {
        this.transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD // Mot de passe d'application, pas le mot de passe normal
          }
        });
      }
      
      // Option 2: Utiliser OAuth2 (plus sécurisé)
      else if (process.env.EMAIL_SERVICE === 'gmail-oauth2') {
        const oAuth2Client = new google.auth.OAuth2(
          process.env.GMAIL_CLIENT_ID,
          process.env.GMAIL_CLIENT_SECRET,
          process.env.GMAIL_REDIRECT_URI
        );

        oAuth2Client.setCredentials({
          refresh_token: process.env.GMAIL_REFRESH_TOKEN
        });

        const accessToken = await oAuth2Client.getAccessToken();

        this.transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_USER,
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN,
            accessToken: accessToken.token!
          }
        });
      }
      
      // Option 3: Utiliser un service SMTP générique
      else {
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour autres ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
      }

      // Vérifier la configuration
      if (this.transporter) {
        await this.transporter.verify();
        console.log('✅ Service email configuré avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur configuration email:', error);
      // Ne pas faire crasher l'app si l'email ne fonctionne pas
      console.warn('⚠️  Le service email n\'est pas disponible. Les emails ne seront pas envoyés.');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('⚠️  Transporter email non configuré. Email non envoyé:', options.subject);
      return false;
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'AfriStocks'}" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email envoyé:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      return false;
    }
  }

  // Convertir HTML en texte simple
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Templates d'emails
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bienvenue sur AfriStocks</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue sur AfriStocks ! 🚀</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${userName},</h2>
              <p>Nous sommes ravis de vous accueillir sur AfriStocks, la plateforme d'investissement dans les startups africaines.</p>
              
              <p>Votre compte a été créé avec succès. Vous pouvez maintenant :</p>
              <ul>
                <li>Explorer les startups disponibles</li>
                <li>Investir dans des projets prometteurs</li>
                <li>Suivre votre portfolio en temps réel</li>
                <li>Participer à la croissance de l'écosystème africain</li>
              </ul>
              
              <center>
                <a href="${process.env.FRONTEND_URL}/login" class="button">Accéder à mon compte</a>
              </center>
              
              <p><strong>Prochaines étapes :</strong></p>
              <ol>
                <li>Complétez votre profil</li>
                <li>Vérifiez votre identité (KYC)</li>
                <li>Effectuez votre premier dépôt</li>
                <li>Commencez à investir !</li>
              </ol>
              
              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
              
              <p>Cordialement,<br>L'équipe AfriStocks</p>
            </div>
            <div class="footer">
              <p>© 2025 AfriStocks. Tous droits réservés.</p>
              <p>Cet email a été envoyé à ${userEmail}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Bienvenue sur AfriStocks - Votre compte est créé ! 🎉',
      html
    });
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Réinitialisation de mot de passe</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e293b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Réinitialisation de mot de passe</h1>
            </div>
            <div class="content">
              <p>Bonjour,</p>
              <p>Vous avez demandé la réinitialisation de votre mot de passe AfriStocks.</p>
              
              <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              
              <center>
                <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
              </center>
              
              <div class="warning">
                <strong>⚠️ Important :</strong>
                <ul>
                  <li>Ce lien expire dans 1 heure</li>
                  <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                  <li>Votre mot de passe actuel reste valide tant que vous ne le changez pas</li>
                </ul>
              </div>
              
              <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #0066cc;">${resetUrl}</p>
              
              <p>Cordialement,<br>L'équipe AfriStocks</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'AfriStocks - Réinitialisation de votre mot de passe',
      html
    });
  }

  async send2FACode(userEmail: string, code: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Code de vérification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e293b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
            .code { font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 8px; margin: 30px 0; padding: 20px; background: white; border-radius: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Code de vérification AfriStocks</h1>
            </div>
            <div class="content">
              <p>Voici votre code de vérification à 6 chiffres :</p>
              
              <div class="code">${code}</div>
              
              <p>Ce code expire dans 10 minutes.</p>
              <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `${code} est votre code de vérification AfriStocks`,
      html
    });
  }
}

// Exporter une instance unique
export const emailService = new EmailService();