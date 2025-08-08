import { prisma } from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';
import { WalletType, Currency } from '@prisma/client';

export class WalletService {
  static async getBalance(walletId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
      include: {
        transactions: {
          orderBy: { created_at: 'desc' },
          take: 10
        }
      }
    });

    if (!wallet) {
      throw new Error('Wallet non trouvé');
    }

    return {
      balance: wallet.balance.toNumber(),
      lockedBalance: wallet.locked_balance.toNumber(),
      currency: wallet.currency,
      recentTransactions: wallet.transactions
    };
  }

  static async deposit(walletId: string, userId: string, amount: number, paymentMethod: string) {
    const reference = `DEP-${Date.now()}-${uuidv4().slice(0, 8)}`;

    const transaction = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });

      if (!wallet) throw new Error('Wallet non trouvé');

      const transaction = await tx.transaction.create({
        data: {
          user_id: userId,
          wallet_id: wallet.id,
          type: 'DEPOSIT',
          status: 'PENDING',
          amount: new Decimal(amount),
          fee: new Decimal(0),
          reference,
          description: `Dépôt via ${paymentMethod}`,
          metadata: { paymentMethod }
        }
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: amount
          }
        }
      });

      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' }
      });

      return transaction;
    });

    return {
      success: true,
      transaction: {
        id: transaction.id,
        reference: transaction.reference,
        amount: transaction.amount.toNumber(),
        status: transaction.status
      }
    };
  }

  static async withdraw(walletId: string, userId: string, amount: number, bankDetails: any) {
    const reference = `WTH-${Date.now()}-${uuidv4().slice(0, 8)}`;

    const transaction = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) throw new Error('Wallet non trouvé');

      if (wallet.balance.lessThan(amount)) throw new Error('Solde insuffisant');

      const fee = amount * 0.01;
      const totalAmount = amount + fee;

      if (wallet.balance.lessThan(totalAmount)) throw new Error('Solde insuffisant (frais inclus)');

      const transaction = await tx.transaction.create({
        data: {
          user_id: userId,
          wallet_id: wallet.id,
          type: 'WITHDRAWAL',
          status: 'PENDING',
          amount: new Decimal(amount),
          fee: new Decimal(fee),
          reference,
          description: `Retrait vers ${bankDetails.bankName}`,
          metadata: { bankDetails }
        }
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: totalAmount
          },
          locked_balance: {
            increment: totalAmount
          }
        }
      });

      return transaction;
    });

    return {
      success: true,
      transaction: {
        id: transaction.id,
        reference: transaction.reference,
        amount: transaction.amount.toNumber(),
        fee: transaction.fee.toNumber(),
        status: transaction.status,
        estimatedCompletion: '2-3 jours ouvrables'
      }
    };
  }

  static async getTransactionHistory(walletId: string, limit = 20, offset = 0) {
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) throw new Error('Wallet non trouvé');

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { wallet_id: wallet.id },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.transaction.count({ where: { wallet_id: wallet.id } })
    ]);

    return {
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        status: t.status,
        amount: t.amount.toNumber(),
        fee: t.fee.toNumber(),
        reference: t.reference,
        description: t.description,
        createdAt: t.created_at
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }
}
