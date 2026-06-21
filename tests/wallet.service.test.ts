// Prisma est mocké : ces tests valident la LOGIQUE métier (solde, frais, verrouillage),
// sans base de données.
jest.mock('../src/config/database', () => ({
  prisma: {
    $transaction: jest.fn(),
    wallet: { findUnique: jest.fn(), update: jest.fn() },
    transaction: { create: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  },
}));

import { WalletService } from '../src/services/wallet.service';
import { prisma } from '../src/config/database';
import { Decimal } from '@prisma/client/runtime/library';

const tx = prisma as any;

function runTransactionWith(txMock: any) {
  (prisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => cb(txMock));
}

describe('WalletService.withdraw', () => {
  it('refuse si le solde est insuffisant', async () => {
    runTransactionWith({
      wallet: { findUnique: jest.fn().mockResolvedValue({ id: 'w1', balance: new Decimal(100) }), update: jest.fn() },
      transaction: { create: jest.fn() },
    });
    await expect(
      WalletService.withdraw('u1', 200, { bankName: 'Ecobank' })
    ).rejects.toThrow('Solde insuffisant');
  });

  it('refuse si le solde ne couvre pas les frais (1%)', async () => {
    // solde 100, retrait 100 -> total 101 > 100 => refus
    runTransactionWith({
      wallet: { findUnique: jest.fn().mockResolvedValue({ id: 'w1', balance: new Decimal(100) }), update: jest.fn() },
      transaction: { create: jest.fn() },
    });
    await expect(
      WalletService.withdraw('u1', 100, { bankName: 'Ecobank' })
    ).rejects.toThrow('Solde insuffisant (frais inclus)');
  });

  it('applique un frais de 1% et verrouille le total', async () => {
    const walletUpdate = jest.fn().mockResolvedValue({});
    runTransactionWith({
      wallet: { findUnique: jest.fn().mockResolvedValue({ id: 'w1', balance: new Decimal(1000) }), update: walletUpdate },
      transaction: {
        create: jest.fn().mockResolvedValue({
          id: 't1', reference: 'WTH-x', amount: new Decimal(100), fee: new Decimal(1), status: 'PENDING',
        }),
      },
    });
    const result = await WalletService.withdraw('u1', 100, { bankName: 'Ecobank' });
    expect(result.success).toBe(true);
    expect(result.transaction.fee).toBe(1);
    expect(result.transaction.status).toBe('PENDING');
    expect(walletUpdate).toHaveBeenCalled();
  });

  it('échoue si le wallet est introuvable', async () => {
    runTransactionWith({
      wallet: { findUnique: jest.fn().mockResolvedValue(null), update: jest.fn() },
      transaction: { create: jest.fn() },
    });
    await expect(
      WalletService.withdraw('u1', 10, { bankName: 'Ecobank' })
    ).rejects.toThrow('Wallet non trouvé');
  });
});

describe('WalletService.deposit', () => {
  it('crédite le wallet et marque la transaction COMPLETED', async () => {
    const walletUpdate = jest.fn().mockResolvedValue({});
    const txUpdate = jest.fn().mockResolvedValue({});
    runTransactionWith({
      wallet: { findUnique: jest.fn().mockResolvedValue({ id: 'w1' }), update: walletUpdate },
      transaction: {
        create: jest.fn().mockResolvedValue({ id: 't1', reference: 'DEP-x', amount: new Decimal(500), status: 'PENDING' }),
        update: txUpdate,
      },
    });
    const result = await WalletService.deposit('u1', 500, 'WAVE');
    expect(result.success).toBe(true);
    expect(walletUpdate).toHaveBeenCalled();
    expect(txUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'COMPLETED' } }));
  });
});
