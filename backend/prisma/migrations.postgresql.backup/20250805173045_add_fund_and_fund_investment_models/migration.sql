/*
  Warnings:

  - You are about to drop the column `created_at` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `is_read` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `read_at` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `notifications` table. All the data in the column will be lost.
  - Added the required column `body` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FundStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('MARKET_UPDATE', 'STARTUP_NEWS', 'INVESTMENT', 'REGULATION', 'TECHNOLOGY', 'ANALYSIS', 'EVENT', 'PARTNERSHIP');

-- CreateEnum
CREATE TYPE "NewsImportance" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'FUND_INVESTMENT';

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropIndex
DROP INDEX "notifications_is_read_idx";

-- DropIndex
DROP INDEX "notifications_user_id_idx";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "created_at",
DROP COLUMN "is_read",
DROP COLUMN "message",
DROP COLUMN "metadata",
DROP COLUMN "read_at",
DROP COLUMN "type",
ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "clicked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clickedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "data" JSONB,
ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "topic" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "document_name" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fund" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "targetAmount" DOUBLE PRECISION NOT NULL DEFAULT 50000,
    "raisedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minInvestment" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "maxInvestment" DOUBLE PRECISION NOT NULL DEFAULT 10000,
    "expectedReturn" TEXT NOT NULL DEFAULT '15-25%',
    "duration" TEXT NOT NULL DEFAULT '3-5 ans',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "riskLevel" TEXT,
    "investmentType" TEXT,
    "sector" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Côte d''Ivoire',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "email" TEXT NOT NULL DEFAULT 'invest@afristocks.com',
    "phone" TEXT NOT NULL DEFAULT '+225 01 23 45 67 89',
    "whatsapp" TEXT NOT NULL DEFAULT '+225 01 23 45 67 89',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_funds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target_amount" DECIMAL(20,2) NOT NULL,
    "raised_amount" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "min_investment" DECIMAL(20,2) NOT NULL,
    "max_investment" DECIMAL(20,2),
    "expected_return" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "status" "FundStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_funds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundInvestment" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "fundId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundInvestment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_investments" (
    "id" TEXT NOT NULL,
    "fund_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(20,2) NOT NULL,
    "participation_percent" DECIMAL(5,2) NOT NULL,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "payment_method" TEXT NOT NULL,
    "payment_reference" TEXT,
    "kyc_data" JSONB,
    "invested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),
    "certificate_issued" BOOLEAN NOT NULL DEFAULT false,
    "certificate_issued_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fund_investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_updates" (
    "id" TEXT NOT NULL,
    "fund_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fund_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "category" "NewsCategory" NOT NULL,
    "importance" "NewsImportance" NOT NULL DEFAULT 'NORMAL',
    "tags" TEXT[],
    "metadata" JSONB DEFAULT '{}',
    "authorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "completedReads" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_devices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fcmToken" TEXT,
    "platform" TEXT NOT NULL,
    "deviceInfo" JSONB,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_views" (
    "id" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_interactions" (
    "id" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "value" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_metrics" (
    "id" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "scrollDepth" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FundInvestment_fundId_idx" ON "FundInvestment"("fundId");

-- CreateIndex
CREATE INDEX "FundInvestment_userId_idx" ON "FundInvestment"("userId");

-- CreateIndex
CREATE INDEX "fund_investments_fund_id_idx" ON "fund_investments"("fund_id");

-- CreateIndex
CREATE INDEX "fund_investments_user_id_idx" ON "fund_investments"("user_id");

-- CreateIndex
CREATE INDEX "fund_investments_status_idx" ON "fund_investments"("status");

-- CreateIndex
CREATE INDEX "news_publishedAt_importance_idx" ON "news"("publishedAt", "importance");

-- CreateIndex
CREATE INDEX "news_category_idx" ON "news"("category");

-- CreateIndex
CREATE INDEX "news_isActive_publishedAt_idx" ON "news"("isActive", "publishedAt");

-- CreateIndex
CREATE INDEX "news_notifications_userId_read_idx" ON "news_notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "news_notifications_newsId_idx" ON "news_notifications"("newsId");

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_fcmToken_key" ON "user_devices"("fcmToken");

-- CreateIndex
CREATE INDEX "user_devices_userId_idx" ON "user_devices"("userId");

-- CreateIndex
CREATE INDEX "user_devices_fcmToken_idx" ON "user_devices"("fcmToken");

-- CreateIndex
CREATE INDEX "user_subscriptions_topic_idx" ON "user_subscriptions"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_userId_topic_key" ON "user_subscriptions"("userId", "topic");

-- CreateIndex
CREATE INDEX "news_views_newsId_idx" ON "news_views"("newsId");

-- CreateIndex
CREATE INDEX "news_views_userId_idx" ON "news_views"("userId");

-- CreateIndex
CREATE INDEX "news_views_viewedAt_idx" ON "news_views"("viewedAt");

-- CreateIndex
CREATE INDEX "news_views_source_idx" ON "news_views"("source");

-- CreateIndex
CREATE INDEX "news_interactions_newsId_action_idx" ON "news_interactions"("newsId", "action");

-- CreateIndex
CREATE INDEX "news_interactions_userId_idx" ON "news_interactions"("userId");

-- CreateIndex
CREATE INDEX "news_interactions_createdAt_idx" ON "news_interactions"("createdAt");

-- CreateIndex
CREATE INDEX "reading_metrics_newsId_idx" ON "reading_metrics"("newsId");

-- CreateIndex
CREATE INDEX "reading_metrics_userId_idx" ON "reading_metrics"("userId");

-- CreateIndex
CREATE INDEX "reading_metrics_completed_idx" ON "reading_metrics"("completed");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_idx" ON "notifications"("user_id", "read");

-- CreateIndex
CREATE INDEX "notifications_topic_idx" ON "notifications"("topic");

-- CreateIndex
CREATE INDEX "notifications_sentAt_idx" ON "notifications"("sentAt");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundInvestment" ADD CONSTRAINT "FundInvestment_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundInvestment" ADD CONSTRAINT "FundInvestment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_investments" ADD CONSTRAINT "fund_investments_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "investment_funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_investments" ADD CONSTRAINT "fund_investments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_updates" ADD CONSTRAINT "fund_updates_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "investment_funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_notifications" ADD CONSTRAINT "news_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_notifications" ADD CONSTRAINT "news_notifications_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_views" ADD CONSTRAINT "news_views_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_views" ADD CONSTRAINT "news_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_interactions" ADD CONSTRAINT "news_interactions_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_interactions" ADD CONSTRAINT "news_interactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_metrics" ADD CONSTRAINT "reading_metrics_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_metrics" ADD CONSTRAINT "reading_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
