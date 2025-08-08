import { PrismaClient, TransactionType, TransactionStatus, Currency } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class TransactionService {
  // Créer un dépôt
  static async createDeposit(data: {
    userId: string;
    amount: number;
    method: string;
    currency: string;
  }) {
    // Vérifier que l'utilisateur a un wallet pour cette devise
    let wallet = await prisma.wallet.findFirst({
      where: {
        userId: data.userId,
        currency: data.currency as Currency,
        isActive: true
      }
    });

    if (!wallet) {
      // Créer un wallet si nécessaire
      wallet = await prisma.wallet.create({
        data: {
          userId: data.userId,
          currency: data.currency as Currency,
          walletType: 'FIAT',
          balance: 0,
          lockedBalance: 0,
          isPrimary: true,
          isActive: true
        }
      });
    }

    // Créer la transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: data.userId,
        toWalletId: wallet.id,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING,
        amount: data.amount,
        fee: data.amount * 0.005, // 0.5% de frais
        description: `Dépôt via ${data.method}`,
        reference: `DEP-${Date.now()}-${uuidv4().substring(0, 8)}`,
        metadata: {
          method: data.method,
          currency: data.currency
        }
      }
    });

    // Simuler l'approbation automatique pour la démo
    setTimeout(async () => {
      await this.processTransaction(transaction.id);
    }, 3000);

    return transaction;
  }

  // Créer un retrait
  static async createWithdrawal(data: {
    userId: string;
    amount: number;
    method: string;
    currency: string;
    accountDetails: any;
  }) {
    // Vérifier le solde
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: data.userId,
        currency: data.currency as Currency,
        isActive: true
      }
    });

    if (!wallet || Number(wallet.balance) < data.amount) {
      throw new Error('Solde insuffisant');
    }

    // Créer la transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: data.userId,
        fromWalletId: wallet.id,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING,
        amount: data.amount,
        fee: data.amount * 0.01, // 1% de frais
        description: `Retrait via ${data.method}`,
        reference: `WTH-${Date.now()}-${uuidv4().substring(0, 8)}`,
        metadata: {
          method: data.method,
          currency: data.currency,
          accountDetails: data.accountDetails
        }
      }
    });

    // Bloquer le montant
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: data.amount },
        lockedBalance: { increment: data.amount }
      }
    });

    return transaction;
  }

  // Traiter une transaction (approuver)
  static async processTransaction(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction || transaction.status !== TransactionStatus.PENDING) {
      throw new Error('Transaction invalide');
    }

    if (transaction.type === TransactionType.DEPOSIT && transaction.toWalletId) {
      // Créditer le wallet
      await prisma.wallet.update({
        where: { id: transaction.toWalletId },
        data: {
          balance: { increment: transaction.amount }
        }
      });
    } else if (transaction.type === TransactionType.WITHDRAWAL && transaction.fromWalletId) {
      // Débloquer les fonds (déjà débités)
      await prisma.wallet.update({
        where: { id: transaction.fromWalletId },
        data: {
          lockedBalance: { decrement: transaction.amount }
        }
      });
    }

    // Mettre à jour le statut
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.COMPLETED,
        updatedAt: new Date()
      }
    });

    // Notification
    await prisma.notification.create({
      data: {
        userId: transaction.userId,
        title: 'Transaction complétée',
        message: `Votre ${transaction.type === 'DEPOSIT' ? 'dépôt' : 'retrait'} de ${transaction.amount} XOF a été complété`,
        type: 'success'
      }
    });
  }

  // Obtenir les transactions d'un utilisateur
  static async getUserTransactions(userId: string, filters: any) {
    const where: any = { userId };

    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        fromWallet: true,
        toWallet: true
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit,
      skip: filters.offset
    });

    return transactions;
  }
}