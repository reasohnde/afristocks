import request from 'supertest';
import express from 'express';

const app = express();
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

describe('Health Check', () => {
  it('should return healthy status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
  });
});
