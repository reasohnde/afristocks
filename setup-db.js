// Setup DB schema directly via pg client (bypasses Prisma CLI engine requirements)
const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || 'postgresql://afristocks:afristocks@localhost:5433/afristocks';

const SCHEMA_SQL = `
-- Enums
DO $$ BEGIN CREATE TYPE "UserRole" AS ENUM ('USER', 'STARTUP', 'ADMIN'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'DIVIDEND', 'FEE', 'REFUND'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "InvestmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Users
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone_number" TEXT,
  "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
  "two_factor_secret" TEXT,
  "last_login" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- User Profiles
CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "bio" TEXT,
  "avatar_url" TEXT,
  "location" TEXT,
  "date_of_birth" TIMESTAMP(3),
  "investor_type" TEXT,
  "risk_profile" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- Login Attempts
CREATE TABLE IF NOT EXISTS "login_attempts" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id" TEXT,
  "email" TEXT NOT NULL,
  "ip_address" TEXT NOT NULL,
  "user_agent" TEXT,
  "successful" BOOLEAN NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "login_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "login_attempts_user_id_idx" ON "login_attempts"("user_id");
CREATE INDEX IF NOT EXISTS "login_attempts_email_idx" ON "login_attempts"("email");
CREATE INDEX IF NOT EXISTS "login_attempts_created_at_idx" ON "login_attempts"("created_at");

-- Refresh Tokens
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_key" ON "refresh_tokens"("token");
CREATE INDEX IF NOT EXISTS "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
CREATE INDEX IF NOT EXISTS "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- Wallets
CREATE TABLE IF NOT EXISTS "wallets" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "balance" DECIMAL(20,2) NOT NULL DEFAULT 0,
  "locked_balance" DECIMAL(20,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'XAF',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wallets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "wallets_user_id_key" ON "wallets"("user_id");

-- Transactions
CREATE TABLE IF NOT EXISTS "transactions" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "wallet_id" TEXT NOT NULL,
  "type" "TransactionType" NOT NULL,
  "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
  "amount" DECIMAL(20,2) NOT NULL,
  "fee" DECIMAL(20,2) NOT NULL DEFAULT 0,
  "description" TEXT,
  "reference" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "transactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "transactions_reference_key" ON "transactions"("reference");
CREATE INDEX IF NOT EXISTS "transactions_user_id_idx" ON "transactions"("user_id");
CREATE INDEX IF NOT EXISTS "transactions_wallet_id_idx" ON "transactions"("wallet_id");
CREATE INDEX IF NOT EXISTS "transactions_type_idx" ON "transactions"("type");
CREATE INDEX IF NOT EXISTS "transactions_status_idx" ON "transactions"("status");

-- Startups
CREATE TABLE IF NOT EXISTS "startups" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "logo" TEXT,
  "website" TEXT,
  "pitch" TEXT,
  "valuation_target" DECIMAL(20,2) NOT NULL,
  "raised_amount" DECIMAL(20,2) NOT NULL DEFAULT 0,
  "min_investment" DECIMAL(20,2) NOT NULL,
  "max_investment" DECIMAL(20,2) NOT NULL,
  "start_date" TIMESTAMP(3) NOT NULL,
  "end_date" TIMESTAMP(3) NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "startups_pkey" PRIMARY KEY ("id")
);

-- Investments
CREATE TABLE IF NOT EXISTS "investments" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "startup_id" TEXT NOT NULL,
  "amount" DECIMAL(20,2) NOT NULL,
  "shares" INTEGER NOT NULL DEFAULT 0,
  "status" "InvestmentStatus" NOT NULL DEFAULT 'ACTIVE',
  "invested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "maturity_date" TIMESTAMP(3),
  "return_amount" DECIMAL(20,2),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "investments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "investments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "investments_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startups"("id")
);
CREATE INDEX IF NOT EXISTS "investments_user_id_idx" ON "investments"("user_id");
CREATE INDEX IF NOT EXISTS "investments_startup_id_idx" ON "investments"("startup_id");
CREATE INDEX IF NOT EXISTS "investments_status_idx" ON "investments"("status");

-- Notifications
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "read_at" TIMESTAMP(3),
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications"("is_read");

-- Prisma migrations table (so Prisma thinks migrations are applied)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" TEXT NOT NULL,
  "checksum" TEXT NOT NULL,
  "finished_at" TIMESTAMP(3),
  "migration_name" TEXT NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMP(3),
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
`;

async function setup() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to PostgreSQL');

  await client.query(SCHEMA_SQL);
  console.log('Schema created successfully');

  // Seed data
  const bcrypt = require('bcrypt');
  const adminPasswordHash = await bcrypt.hash('Admin123!', 12);

  // Check if admin already exists
  const existing = await client.query("SELECT id FROM users WHERE email = 'admin@afristocks.com'");
  if (existing.rows.length === 0) {
    const adminId = require('crypto').randomUUID();
    const walletId = require('crypto').randomUUID();

    await client.query(`
      INSERT INTO users (id, email, "passwordHash", name, role, "kycStatus", "isActive", created_at, updated_at)
      VALUES ($1, 'admin@afristocks.com', $2, 'Admin AfriStocks', 'ADMIN', 'VERIFIED', true, NOW(), NOW())
    `, [adminId, adminPasswordHash]);

    await client.query(`
      INSERT INTO wallets (id, user_id, balance, currency, created_at, updated_at)
      VALUES ($1, $2, 0, 'XAF', NOW(), NOW())
    `, [walletId, adminId]);

    console.log('Admin user created (admin@afristocks.com / Admin123!)');

    // Seed startups
    const startups = [
      { name: 'AgriTech Solutions', desc: 'Innovation agricole en Afrique de l\'Ouest', target: 50000000, min: 10000, max: 1000000 },
      { name: 'MobilePay Africa', desc: 'Solution de paiement mobile panafricaine', target: 100000000, min: 25000, max: 2000000 },
      { name: 'EduConnect', desc: 'Plateforme e-learning pour le continent africain', target: 30000000, min: 5000, max: 500000 },
    ];

    for (const s of startups) {
      await client.query(`
        INSERT INTO startups (id, name, description, valuation_target, raised_amount, min_investment, max_investment, start_date, end_date, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, 0, $5, $6, NOW(), NOW() + interval '6 months', true, NOW(), NOW())
      `, [require('crypto').randomUUID(), s.name, s.desc, s.target, s.min, s.max]);
    }
    console.log('3 startups seeded');
  } else {
    console.log('Data already seeded');
  }

  await client.end();
  console.log('Database setup complete!');
}

setup().catch(err => { console.error('DB setup error:', err); process.exit(1); });
