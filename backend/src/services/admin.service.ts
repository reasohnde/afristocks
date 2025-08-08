// backend/src/services/admin.service.ts

import { PrismaClient, UserRole, KycStatus } from '@prisma/client';
import { redis } from '../config/redis';

const prisma = new PrismaClient();

export class AdminService {
  // Obtenir les statistiques du tableau de bord CORRIGÉES
  static async getDashboardStats() {
    try {
      // Compter les utilisateurs par rôle
      const userStats = await prisma.user.groupBy({
        by: ['role'],
        _count: true
      });

      // Transformer en objet pour un accès facile
      const roleCount = userStats.reduce((acc, stat) => {
        acc[stat.role] = stat._count;
        return acc;
      }, {} as Record<string, number>);

      // Statistiques supplémentaires
      const [
        pendingVerifications,
        totalInvestments,
        totalTransactions,
        verifiedStartups,
        totalStartupEntries
      ] = await Promise.all([
        prisma.user.count({ where: { kycStatus: KycStatus.PENDING } }),
        prisma.investment.count(),
        prisma.transaction.count(),
        prisma.startup.count({ where: { verified: true } }),
        prisma.startup.count() // Total des entrées dans la table startup
      ]);

      const totalInvestedAmount = await prisma.investment.aggregate({
        _sum: { amount: true }
      });

      // Calculer les totaux corrects
      const investorCount = (roleCount.USER || 0) + (roleCount.INVESTOR || 0);
      const startupCount = roleCount.STARTUP || 0;
      const adminCount = roleCount.ADMIN || 0;
      const totalUsers = investorCount + startupCount + adminCount;

      return {
        // Totaux principaux
        totalUsers: totalUsers,
        totalInvestors: investorCount,
        totalStartups: startupCount,
        totalAdmins: adminCount,
        
        // Détails par rôle
        usersByRole: {
          USER: roleCount.USER || 0,
          INVESTOR: roleCount.INVESTOR || 0,
          STARTUP: roleCount.STARTUP || 0,
          ADMIN: roleCount.ADMIN || 0
        },
        
        // Autres statistiques
        pendingVerifications,
        totalInvestments,
        totalInvestedAmount: totalInvestedAmount._sum.amount || 0,
        totalTransactions,
        verifiedStartups,
        totalStartupEntries,
        
        // Statistiques détaillées
        startupStats: {
          total: startupCount,
          verified: verifiedStartups,
          pending: totalStartupEntries - verifiedStartups
        }
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  // Obtenir toutes les startups avec filtres
  static async getStartups(filters: {
    status?: 'all' | 'pending' | 'verified' | 'rejected';
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'pending') {
        where.verified = false;
      } else if (filters.status === 'verified') {
        where.verified = true;
      } else if (filters.status === 'rejected') {
        where.verified = false;
        where.isActive = false;
      }
    }

    const startups = await prisma.startup.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            name: true,
            phone_number: true
          }
        },
        documents: true,
        investments: {
          select: {
            amount: true
          }
        }
      },
      take: filters.limit || 20,
      skip: filters.offset || 0,
      orderBy: { createdAt: 'desc' }
    });

    return startups;
  }

  // Approuver une startup
  static async approveStartup(startupId: string, adminId: string) {
    const startup = await prisma.startup.update({
      where: { id: startupId },
      data: {
        verified: true,
        isActive: true,
        updatedAt: new Date()
      }
    });

    // Créer une notification pour la startup
    await prisma.notification.create({
      data: {
        userId: startup.userId,
        title: 'Startup approuvée',
        message: 'Votre startup a été vérifiée et est maintenant visible aux investisseurs.',
        type: 'success'
      }
    });

    // Invalider le cache Redis si disponible
    try {
      await redis.del('startups:verified');
    } catch (e) {
      console.log('Redis cache invalidation skipped');
    }

    return startup;
  }

  // Rejeter une startup avec raison
  static async rejectStartup(startupId: string, reason: string, adminId: string) {
    const startup = await prisma.startup.update({
      where: { id: startupId },
      data: {
        verified: false,
        isActive: false,
        updatedAt: new Date()
      }
    });

    // Créer une notification avec la raison
    await prisma.notification.create({
      data: {
        userId: startup.userId,
        title: 'Startup rejetée',
        message: `Votre startup a été rejetée. Raison: ${reason}`,
        type: 'error'
      }
    });

    return startup;
  }

  // Obtenir tous les utilisateurs avec filtres AMÉLIORÉ
  static async getUsers(filters: {
    role?: UserRole;
    kycStatus?: KycStatus;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.role) {
      where.role = filters.role;
    }
    
    if (filters.kycStatus) {
      where.kycStatus = filters.kycStatus;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        profile: true,
        startup: {
          select: {
            id: true,
            companyName: true,
            sector: true,
            verified: true,
            city: true,
            country: true
          }
        },
        investments: {
          select: {
            amount: true,
            status: true
          }
        },
        wallets: {
          select: {
            currency: true,
            balance: true
          }
        }
      },
      take: filters.limit || 50,
      skip: filters.offset || 0,
      orderBy: { created_at: 'desc' }
    });

    return users.map(user => ({
      ...user,
      displayRole: user.role === 'USER' ? 'Investisseur' : 
                   user.role === 'STARTUP' ? 'Startup' :
                   user.role === 'INVESTOR' ? 'Investisseur Pro' :
                   user.role === 'ADMIN' ? 'Administrateur' : user.role,
      totalInvested: user.investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
    }));
  }

  // Valider le KYC d'un utilisateur
  static async verifyUserKYC(userId: string, adminId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: KycStatus.VERIFIED,
        email_verified: true
      }
    });

    await prisma.notification.create({
      data: {
        userId: userId,
        title: 'KYC Vérifié',
        message: 'Votre vérification KYC a été approuvée. Vous pouvez maintenant investir.',
        type: 'success'
      }
    });

    return user;
  }

  // Rejeter le KYC avec raison
  static async rejectUserKYC(userId: string, reason: string, adminId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: KycStatus.REJECTED
      }
    });

    await prisma.notification.create({
      data: {
        userId: userId,
        title: 'KYC Rejeté',
        message: `Votre vérification KYC a été rejetée. Raison: ${reason}`,
        type: 'error'
      }
    });

    return user;
  }

  // Obtenir les transactions récentes
  static async getRecentTransactions(limit: number = 10) {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return transactions;
  }

  // Bloquer/Débloquer un utilisateur
  static async toggleUserStatus(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) throw new Error('Utilisateur non trouvé');

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: !user.isActive
      }
    });

    return updatedUser;
  }

  // Obtenir les documents en attente de vérification
  static async getPendingDocuments() {
    const documents = await prisma.startupDocument.findMany({
      where: {
        startup: {
          verified: false
        }
      },
      include: {
        startup: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return documents;
  }
}