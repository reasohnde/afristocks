import { prisma } from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';

export class InvestmentService {
  static async getStartups(limit = 20, offset = 0) {
    const [startups, total] = await Promise.all([
      prisma.startup.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.startup.count({
        where: { isActive: true }
      })
    ]);

    return {
      startups: startups.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        logo: s.logo,
        website: s.website,
        valuationTarget: s.valuationTarget.toNumber(),
        raisedAmount: s.raisedAmount.toNumber(),
        minInvestment: s.minInvestment.toNumber(),
        maxInvestment: s.maxInvestment.toNumber(),
        startDate: s.startDate,
        endDate: s.endDate,
        progress: (s.raisedAmount.toNumber() / s.valuationTarget.toNumber()) * 100
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  static async getStartupDetails(startupId: string) {
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: {
        investments: {
          select: {
            id: true,
            amount: true,
            investedAt: true
          }
        }
      }
    });

    if (!startup) {
      throw new Error('Startup non trouvée');
    }

    const investorCount = await prisma.investment.groupBy({
      by: ['userId'],
      where: { startupId },
      _count: true
    });

    return {
      ...startup,
      valuationTarget: startup.valuationTarget.toNumber(),
      raisedAmount: startup.raisedAmount.toNumber(),
      minInvestment: startup.minInvestment.toNumber(),
      maxInvestment: startup.maxInvestment.toNumber(),
      investorCount: investorCount.length,
      totalInvestments: startup.investments.length
    };
  }

  static async invest(userId: string, startupId: string, amount: number) {
    return await prisma.$transaction(async (tx) => {
      const startup = await tx.startup.findUnique({
        where: { id: startupId }
      });

      if (!startup || !startup.isActive) {
        throw new Error('Startup non disponible');
      }

      if (amount < startup.minInvestment.toNumber()) {
        throw new Error(`Le montant minimum est de ${startup.minInvestment} XOF`);
      }

      if (amount > startup.maxInvestment.toNumber()) {
        throw new Error(`Le montant maximum est de ${startup.maxInvestment} XOF`);
      }

      const now = new Date();
      if (now < startup.startDate || now > startup.endDate) {
        throw new Error('La campagne d\'investissement n\'est pas active');
      }

      const wallet = await tx.wallet.findUnique({
        where: { userId }
      });

      if (!wallet || wallet.balance.lessThan(amount)) {
        throw new Error('Solde insuffisant');
      }

      const investment = await tx.investment.create({
        data: {
          userId,
          startupId,
          amount: new Decimal(amount),
          status: 'ACTIVE'
        }
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amount
          }
        }
      });

      await tx.startup.update({
        where: { id: startupId },
        data: {
          raisedAmount: {
            increment: amount
          }
        }
      });

      const reference = `INV-${Date.now()}-${uuidv4().slice(0, 8)}`;
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'INVESTMENT',
          status: 'COMPLETED',
          amount: new Decimal(amount),
          fee: new Decimal(0),
          reference,
          description: `Investissement dans ${startup.name}`,
          metadata: { startupId, investmentId: investment.id }
        }
      });

      return {
        success: true,
        investment: {
          id: investment.id,
          amount: investment.amount.toNumber(),
          startup: {
            id: startup.id,
            name: startup.name
          }
        }
      };
    });
  }

  static async getUserInvestments(userId: string) {
    const investments = await prisma.investment.findMany({
      where: { userId },
      include: {
        startup: true
      },
      orderBy: { investedAt: 'desc' }
    });

    return investments.map(inv => ({
      id: inv.id,
      amount: inv.amount.toNumber(),
      status: inv.status,
      investedAt: inv.investedAt,
      startup: {
        id: inv.startup.id,
        name: inv.startup.name,
        logo: inv.startup.logo
      }
    }));
  }
}
