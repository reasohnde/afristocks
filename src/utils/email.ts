// src/utils/email.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Interface pour les options d'email
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Fonction pour envoyer un email
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: `AfriStocks <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Version texte simple
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé à ${options.to}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

// Templates d'email
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Bienvenue sur AfriStocks !',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Bienvenue sur AfriStocks, ${name} !</h1>
        <p>Nous sommes ravis de vous compter parmi nous.</p>
        <p>Avec AfriStocks, vous pouvez :</p>
        <ul>
          <li>Investir dans des startups africaines prometteuses</li>
          <li>Gérer votre portefeuille en temps réel</li>
          <li>Utiliser Mobile Money pour vos transactions</li>
        </ul>
        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        <p>Cordialement,<br>L'équipe AfriStocks</p>
      </div>
    `,
  }),

  resetPassword: (name: string, resetLink: string) => ({
    subject: 'Réinitialisation de votre mot de passe AfriStocks',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Réinitialisation du mot de passe</h1>
        <p>Bonjour ${name},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
        <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Réinitialiser mon mot de passe</a></p>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <p>Cordialement,<br>L'équipe AfriStocks</p>
      </div>
    `,
  }),

  twoFactorCode: (code: string) => ({
    subject: 'Code de vérification AfriStocks',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Code de vérification</h1>
        <p>Votre code de vérification est :</p>
        <h2 style="background-color: #f0f0f0; padding: 20px; text-align: center; letter-spacing: 5px;">${code}</h2>
        <p>Ce code expirera dans 10 minutes.</p>
        <p>Cordialement,<br>L'équipe AfriStocks</p>
      </div>
    `,
  }),

  transactionConfirmation: (type: string, amount: number, currency: string = 'XOF') => ({
    subject: `Confirmation de ${type} - AfriStocks`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Transaction confirmée</h1>
        <p>Votre ${type} a été effectué avec succès.</p>
        <p><strong>Montant :</strong> ${amount.toLocaleString()} ${currency}</p>
        <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
        <p>Vous pouvez consulter l'historique de vos transactions dans votre espace personnel.</p>
        <p>Cordialement,<br>L'équipe AfriStocks</p>
      </div>
    `,
  }),
};
