import crypto from 'crypto';
import bcrypt from 'bcrypt';

export class SecurityUtils {
  // Générer un code de vérification
  static generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Générer un token sécurisé
  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Valider la force du mot de passe
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Masquer des informations sensibles
  static maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    const masked = username.substring(0, 2) + '***' + username.substring(username.length - 1);
    return `${masked}@${domain}`;
  }

  static maskPhone(phone: string): string {
    if (!phone || phone.length < 4) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(phone.length - 3);
  }

  // Nettoyer les entrées utilisateur
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Enlever les balises HTML
      .replace(/javascript:/gi, '') // Prévenir les injections JS
      .substring(0, 1000); // Limiter la longueur
  }

  // Vérifier l'IP pour la sécurité
  static async checkIPSecurity(ip: string, userId: string): Promise<{
    isSecure: boolean;
    reason?: string;
  }> {
    // Ici vous pouvez implémenter :
    // - Vérification de liste noire
    // - Détection de changement d'IP inhabituel
    // - Limite de tentatives par IP

    return { isSecure: true };
  }
}