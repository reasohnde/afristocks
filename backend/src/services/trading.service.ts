// backend/src/services/trading.service.ts
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { EventEmitter } from 'events';

export class TradingService extends EventEmitter {
  private orderBook: Map<string, OrderBook>;
  
  constructor() {
    super();
    this.orderBook = new Map();
    this.initializeOrderBooks();
  }

  // Types d'ordres supportés
  async createOrder(orderData: CreateOrderDto) {
    const { userId, startupId, type, side, quantity, orderType, price, stopPrice } = orderData;

    // Validation
    await this.validateOrder(orderData);

    // Créer l'ordre
    const order = await prisma.order.create({
      data: {
        userId,
        startupId,
        type: orderType, // MARKET, LIMIT, STOP_LOSS, STOP_LIMIT
        side, // BUY, SELL
        quantity,
        price: price || 0,
        stopPrice: stopPrice || 0,
        status: 'PENDING',
        remainingQuantity: quantity
      }
    });

    // Traiter selon le type
    switch (orderType) {
      case 'MARKET':
        await this.executeMarketOrder(order);
        break;
      case 'LIMIT':
        await this.addToOrderBook(order);
        break;
      case 'STOP_LOSS':
      case 'STOP_LIMIT':
        await this.addToStopOrders(order);
        break;
    }

    // Notifier via WebSocket
    this.emit('order:created', order);
    
    return order;
  }

  // Exécution d'ordre au marché
  async executeMarketOrder(order: any) {
    const orderBook = this.orderBook.get(order.startupId);
    const oppositeOrders = order.side === 'BUY' ? orderBook.asks : orderBook.bids;
    
    let remainingQuantity = order.quantity;
    const executions = [];

    // Matcher avec les ordres opposés
    for (const level of oppositeOrders) {
      if (remainingQuantity <= 0) break;
      
      for (const oppositeOrder of level.orders) {
        if (remainingQuantity <= 0) break;
        
        const matchQuantity = Math.min(remainingQuantity, oppositeOrder.remainingQuantity);
        const executionPrice = oppositeOrder.price;
        
        // Créer l'exécution
        const execution = await prisma.execution.create({
          data: {
            buyOrderId: order.side === 'BUY' ? order.id : oppositeOrder.id,
            sellOrderId: order.side === 'SELL' ? order.id : oppositeOrder.id,
            quantity: matchQuantity,
            price: executionPrice,
            status: 'COMPLETED'
          }
        });
        
        executions.push(execution);
        
        // Mettre à jour les quantités
        remainingQuantity -= matchQuantity;
        oppositeOrder.remainingQuantity -= matchQuantity;
        
        // Mettre à jour les portefeuilles
        await this.updatePortfolios(execution);
      }
    }
    
    // Mettre à jour le statut de l'ordre
    await prisma.order.update({
      where: { id: order.id },
      data: {
        remainingQuantity,
        status: remainingQuantity === 0 ? 'COMPLETED' : 'PARTIALLY_FILLED'
      }
    });
    
    // Notifier
    this.emit('order:executed', { order, executions });
  }

  // Carnet d'ordres en temps réel
  async getOrderBook(startupId: string) {
    const cached = await redis.get(`orderbook:${startupId}`);
    if (cached) return JSON.parse(cached);
    
    const bids = await prisma.order.findMany({
      where: {
        startupId,
        side: 'BUY',
        type: 'LIMIT',
        status: { in: ['PENDING', 'PARTIALLY_FILLED'] }
      },
      orderBy: { price: 'desc' },
      take: 10
    });
    
    const asks = await prisma.order.findMany({
      where: {
        startupId,
        side: 'SELL',
        type: 'LIMIT',
        status: { in: ['PENDING', 'PARTIALLY_FILLED'] }
      },
      orderBy: { price: 'asc' },
      take: 10
    });
    
    const orderBook = { bids, asks, lastPrice: 0, volume24h: 0 };
    
    // Cache 5 secondes
    await redis.setex(`orderbook:${startupId}`, 5, JSON.stringify(orderBook));
    
    return orderBook;
  }

  // Graphiques avancés
  async getChartData(startupId: string, interval: string, limit: number = 100) {
    const intervals = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '1h': 3600,
      '1d': 86400
    };
    
    const candles = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('minute', created_at) as time,
        MIN(price) as low,
        MAX(price) as high,
        FIRST_VALUE(price) OVER (PARTITION BY DATE_TRUNC('minute', created_at) ORDER BY created_at) as open,
        LAST_VALUE(price) OVER (PARTITION BY DATE_TRUNC('minute', created_at) ORDER BY created_at) as close,
        SUM(quantity) as volume
      FROM executions
      WHERE startup_id = ${startupId}
      GROUP BY DATE_TRUNC('minute', created_at)
      ORDER BY time DESC
      LIMIT ${limit}
    `;
    
    return candles;
  }
}