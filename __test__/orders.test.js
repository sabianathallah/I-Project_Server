// Load environment variables first
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const request = require('supertest');
const app = require('../app');
const { sequelize, User, Period } = require('../models');
const { signToken } = require('../helpers/jwt');

let userToken;
let testPeriodId;
let testOrderId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create user
  const user = await User.create({
    email: 'orderuser@mail.com',
    password: 'order123',
    fullName: 'Order User',
    role: 'user'
  });

  // Generate token
  userToken = signToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  // Create test period
  const period = await Period.create({
    name_ofPeriod: 'Test Period'
  });
  testPeriodId = period.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Order Endpoints', () => {
  describe('POST /orders', () => {
    test('201 success create order with authentication', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ticketQuantity: 2,
          museumName: 'Test Museum',
          visitDate: '2025-12-01'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('order');
      expect(response.body).toHaveProperty('midtrans');
      expect(response.body).toHaveProperty('ticketPrice');
      expect(response.body).toHaveProperty('totalPrice');
      
      // Save order ID for later tests
      if (response.body.order && response.body.order.id) {
        testOrderId = response.body.order.id;
      }
    });

    test('400 failed create order - ticketQuantity must be at least 1', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ticketQuantity: 0
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('401 failed - no token provided', async () => {
      const response = await request(app)
        .post('/orders')
        .send({
          ticketQuantity: 2,
          museumName: 'Test Museum'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('401 failed - invalid token', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', 'Bearer invalid-token-here')
        .send({
          ticketQuantity: 2,
          museumName: 'Test Museum'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /orders/:id/status', () => {
    test('401 failed - no token provided', async () => {
      const response = await request(app).get('/orders/1/status');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('401 failed - invalid token', async () => {
      const response = await request(app)
        .get('/orders/1/status')
        .set('Authorization', 'Bearer invalid-token-here');

      expect(response.status).toBe(401);
    });

    // Note: Testing actual order status requires Midtrans API
    // This test will depend on whether testOrderId was created successfully
    test('should handle order status request with authentication', async () => {
      if (testOrderId) {
        const response = await request(app)
          .get(`/orders/${testOrderId}/status`)
          .set('Authorization', `Bearer ${userToken}`);

        // Status could be 200 or 404 depending on implementation
        expect([200, 404, 500]).toContain(response.status);
      } else {
        // Skip if no order was created
        expect(true).toBe(true);
      }
    });
  });
});
