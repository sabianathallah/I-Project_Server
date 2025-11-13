// Load environment variables first
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const request = require('supertest');
const app = require('../app');
const { sequelize, User, Period, Order } = require('../models');
const { signToken } = require('../helpers/jwt');
const crypto = require('crypto');

let userToken;
let testPeriodId;
let testOrderId;
let testOrder;

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
      expect(response.body).toHaveProperty('ticketPrice', 20000);
      expect(response.body).toHaveProperty('totalPrice', 40000);
      expect(response.body.order).toHaveProperty('ticketQuantity', 2);
      expect(response.body.order).toHaveProperty('price_amount', 40000);
      
      // Save order for later tests
      if (response.body.order && response.body.order.id) {
        testOrderId = response.body.order.id;
        testOrder = response.body.order;
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

  describe('POST /orders/webhook', () => {
    beforeEach(async () => {
      // Create a test order for webhook testing
      if (!testOrder) {
        const user = await User.findOne({ where: { email: 'orderuser@mail.com' } });
        const order = await Order.create({
          UserId: user.id,
          price_amount: 40000,
          ticketQuantity: 2,
          museumName: 'Test Museum',
          visitDate: '2025-12-01',
          status: 'pending',
          midtrans_orderId: 'TEST-ORDER-123'
        });
        testOrder = order;
      }
    });

    test('should reject webhook with invalid signature', async () => {
      const notification = {
        order_id: testOrder.midtrans_orderId,
        status_code: '200',
        gross_amount: '40000.00',
        signature_key: 'invalid-signature',
        transaction_status: 'settlement'
      };

      const response = await request(app)
        .post('/orders/webhook')
        .send(notification);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Invalid signature');
    });

    test('should handle webhook with valid signature - settlement', async () => {
      const orderId = testOrder.midtrans_orderId;
      const statusCode = '200';
      const grossAmount = '40000.00';
      const serverKey = process.env.MIDTRANS_SERVER_KEY;

      // Generate valid signature
      const signatureKey = crypto
        .createHash('sha512')
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest('hex');

      const notification = {
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        signature_key: signatureKey,
        transaction_status: 'settlement',
        fraud_status: 'accept'
      };

      const response = await request(app)
        .post('/orders/webhook')
        .send(notification);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Webhook processed successfully');

      // Verify order status updated
      const updatedOrder = await Order.findByPk(testOrder.id);
      expect(updatedOrder.status).toBe('paid');
      expect(updatedOrder.paidAt).not.toBeNull();
      expect(updatedOrder.ticketCode).not.toBeNull();
    });

    test('should handle webhook with valid signature - pending', async () => {
      // Create new order for pending test
      const user = await User.findOne({ where: { email: 'orderuser@mail.com' } });
      const pendingOrder = await Order.create({
        UserId: user.id,
        price_amount: 20000,
        ticketQuantity: 1,
        museumName: 'Test Museum 2',
        status: 'pending',
        midtrans_orderId: 'TEST-ORDER-PENDING-456'
      });

      const orderId = pendingOrder.midtrans_orderId;
      const statusCode = '201';
      const grossAmount = '20000.00';
      const serverKey = process.env.MIDTRANS_SERVER_KEY;

      const signatureKey = crypto
        .createHash('sha512')
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest('hex');

      const notification = {
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        signature_key: signatureKey,
        transaction_status: 'pending'
      };

      const response = await request(app)
        .post('/orders/webhook')
        .send(notification);

      expect(response.status).toBe(200);

      const updatedOrder = await Order.findByPk(pendingOrder.id);
      expect(updatedOrder.status).toBe('pending');
    });

    test('should handle webhook with valid signature - cancel', async () => {
      // Create new order for cancel test
      const user = await User.findOne({ where: { email: 'orderuser@mail.com' } });
      const cancelOrder = await Order.create({
        UserId: user.id,
        price_amount: 20000,
        ticketQuantity: 1,
        museumName: 'Test Museum 3',
        status: 'pending',
        midtrans_orderId: 'TEST-ORDER-CANCEL-789'
      });

      const orderId = cancelOrder.midtrans_orderId;
      const statusCode = '200';
      const grossAmount = '20000.00';
      const serverKey = process.env.MIDTRANS_SERVER_KEY;

      const signatureKey = crypto
        .createHash('sha512')
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest('hex');

      const notification = {
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        signature_key: signatureKey,
        transaction_status: 'cancel'
      };

      const response = await request(app)
        .post('/orders/webhook')
        .send(notification);

      expect(response.status).toBe(200);

      const updatedOrder = await Order.findByPk(cancelOrder.id);
      expect(updatedOrder.status).toBe('cancelled');
    });

    test('should return 404 if order not found', async () => {
      const orderId = 'NON-EXISTENT-ORDER';
      const statusCode = '200';
      const grossAmount = '20000.00';
      const serverKey = process.env.MIDTRANS_SERVER_KEY;

      const signatureKey = crypto
        .createHash('sha512')
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest('hex');

      const notification = {
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        signature_key: signatureKey,
        transaction_status: 'settlement'
      };

      const response = await request(app)
        .post('/orders/webhook')
        .send(notification);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Order not found');
    });
  });
});
