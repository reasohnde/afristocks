/*
  Warnings:

  - You are about to drop the column `wallet_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `balance` on the `wallets` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,2)` to `Decimal(20,8)`.
  - You are about to alter the column `locked_balance` on the `wallets` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,2)` to `Decimal(20,8)`.
  - A unique constraint covering the columns `[user_id,wallet_type,currency]` on the table `wallets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wallet_type` to the `wallets` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `currency` on the `wallets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('FIAT', 'CRYPTO', 'MOBILE_MONEY');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('EUR', 'USD', 'XOF', 'XAF', 'BTC', 'ETH', 'USDT', 'ORANGE_MONEY', 'MTN_MONEY', 'MOOV_MONEY', 'WAVE');

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'TRANSFER';

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_wallet_id_fkey";

-- DropIndex
DROP INDEX "transactions_wallet_id_idx";

-- DropIndex
DROP INDEX "wallets_user_id_key";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "wallet_id",
ADD COLUMN     "from_wallet_id" TEXT,
ADD COLUMN     "to_wallet_id" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "passwordHash",
ADD COLUMN     "password_hash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "iban" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_primary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mobile_number" TEXT,
ADD COLUMN     "wallet_address" TEXT,
ADD COLUMN     "wallet_type" "WalletType" NOT NULL,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "locked_balance" SET DATA TYPE DECIMAL(20,8),
DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL;

-- CreateIndex
CREATE INDEX "transactions_from_wallet_id_idx" ON "transactions"("from_wallet_id");

-- CreateIndex
CREATE INDEX "transactions_to_wallet_id_idx" ON "transactions"("to_wallet_id");

-- CreateIndex
CREATE INDEX "wallets_user_id_idx" ON "wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_wallet_type_currency_key" ON "wallets"("user_id", "wallet_type", "currency");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_from_wallet_id_fkey" FOREIGN KEY ("from_wallet_id") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_wallet_id_fkey" FOREIGN KEY ("to_wallet_id") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
