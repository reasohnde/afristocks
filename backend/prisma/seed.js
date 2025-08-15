// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Nettoyer la base de données
  await prisma.notification.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.user.deleteMany();

  // Créer des utilisateurs de test
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@afristocks.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isVerified: true,
      balance: 100000,
    },
  });

  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      isVerified: true,
      balance: 10000,
    },
  });

  console.log('✅ Users created');

  // Créer des actions de test
  const stocks = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      description: 'Technology company',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      currentPrice: 180.50,
      previousClose: 179.20,
      dayHigh: 182.00,
      dayLow: 178.50,
      volume: 50000000,
      marketCap: 2800000000000,
      peRatio: 29.5,
      dividend: 0.96,
      logo: 'https://logo.clearbit.com/apple.com',
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      description: 'Technology conglomerate',
      sector: 'Technology',
      industry: 'Internet Services',
      currentPrice: 140.25,
      previousClose: 139.80,
      dayHigh: 141.50,
      dayLow: 139.00,
      volume: 25000000,
      marketCap: 1750000000000,
      peRatio: 25.3,
      dividend: 0,
      logo: 'https://logo.clearbit.com/google.com',
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      description: 'Software and cloud services',
      sector: 'Technology',
      industry: 'Software',
      currentPrice: 380.75,
      previousClose: 378.50,
      dayHigh: 382.00,
      dayLow: 377.00,
      volume: 20000000,
      marketCap: 2850000000000,
      peRatio: 32.8,
      dividend: 3.00,
      logo: 'https://logo.clearbit.com/microsoft.com',
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      description: 'E-commerce and cloud computing',
      sector: 'Consumer Cyclical',
      industry: 'E-Commerce',
      currentPrice: 155.50,
      previousClose: 154.00,
      dayHigh: 157.00,
      dayLow: 153.50,
      volume: 40000000,
      marketCap: 1600000000000,
      peRatio: 45.2,
      dividend: 0,
      logo: 'https://logo.clearbit.com/amazon.com',
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      description: 'Electric vehicles and energy',
      sector: 'Consumer Cyclical',
      industry: 'Auto Manufacturers',
      currentPrice: 245.30,
      previousClose: 242.50,
      dayHigh: 248.00,
      dayLow: 241.00,
      volume: 100000000,
      marketCap: 780000000000,
      peRatio: 58.7,
      dividend: 0,
      logo: 'https://logo.clearbit.com/tesla.com',
    },
  ];

  const createdStocks = await prisma.stock.createMany({
    data: stocks,
  });

  console.log(`✅ ${stocks.length} stocks created`);

  // Créer des ordres de test
  const appleStock = await prisma.stock.findUnique({
    where: { symbol: 'AAPL' },
  });

  const order = await prisma.order.create({
    data: {
      userId: testUser.id,
      stockId: appleStock.id,
      type: 'MARKET',
      side: 'BUY',
      quantity: 10,
      price: 180.50,
      totalAmount: 1805.00,
      status: 'EXECUTED',
      executedAt: new Date(),
    },
  });

  console.log('✅ Sample order created');

  // Créer un portfolio
  const portfolio = await prisma.portfolio.create({
    data: {
      userId: testUser.id,
      stockId: appleStock.id,
      quantity: 10,
      averagePrice: 180.50,
      totalValue: 1805.00,
      profitLoss: 0,
      profitLossPercentage: 0,
    },
  });

  console.log('✅ Sample portfolio entry created');

  // Créer une transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId: testUser.id,
      type: 'DEPOSIT',
      amount: 10000,
      status: 'COMPLETED',
      description: 'Initial deposit',
    },
  });

  console.log('✅ Sample transaction created');

  // Créer des notifications
  const notification = await prisma.notification.create({
    data: {
      userId: testUser.id,
      title: 'Welcome to Afristocks!',
      message: 'Your account has been successfully created. Start trading now!',
      type: 'SYSTEM',
    },
  });

  console.log('✅ Sample notification created');

  // Créer un historique de prix
  const priceHistory = [];
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    priceHistory.push({
      stockId: appleStock.id,
      open: 175 + Math.random() * 10,
      high: 180 + Math.random() * 5,
      low: 173 + Math.random() * 5,
      close: 175 + Math.random() * 10,
      volume: Math.floor(40000000 + Math.random() * 20000000),
      timestamp: date,
    });
  }

  await prisma.priceHistory.createMany({
    data: priceHistory,
  });

  console.log('✅ Price history created');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });