/*
  Warnings:

  - You are about to drop the column `country` on the `Fund` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Fund` table. All the data in the column will be lost.
  - You are about to drop the column `investmentType` on the `Fund` table. All the data in the column will be lost.
  - You are about to drop the column `riskLevel` on the `Fund` table. All the data in the column will be lost.
  - You are about to drop the column `sector` on the `Fund` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "FundInvestment" DROP CONSTRAINT "FundInvestment_userId_fkey";

-- AlterTable
ALTER TABLE "Fund" DROP COLUMN "country",
DROP COLUMN "currency",
DROP COLUMN "investmentType",
DROP COLUMN "riskLevel",
DROP COLUMN "sector";

-- CreateIndex
CREATE INDEX "FundInvestment_userEmail_idx" ON "FundInvestment"("userEmail");

-- AddForeignKey
ALTER TABLE "FundInvestment" ADD CONSTRAINT "FundInvestment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
