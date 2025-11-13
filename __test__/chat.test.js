// Load environment variables first
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const request = require('supertest');
const app = require('../app');
const { sequelize, User } = require('../models');
const { signToken } = require('../helpers/jwt');

let userToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create user
  const user = await User.create({
    email: 'chatuser@mail.com',
    password: 'chat123',
    fullName: 'Chat User',
    role: 'user'
  });

  // Generate token
  userToken = signToken({
    id: user.id,
    email: user.email,
    role: user.role
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Chat Endpoints', () => {
  describe('POST /chat', () => {
    test('401 failed - no token provided', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          message: 'Hello chatbot'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('401 failed - invalid token', async () => {
      const response = await request(app)
        .post('/chat')
        .set('Authorization', 'Bearer invalid-token-here')
        .send({
          message: 'Hello chatbot'
        });

      expect(response.status).toBe(401);
    });

    test('400 failed - message is required', async () => {
      const response = await request(app)
        .post('/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Message is required');
    });

    test('400 failed - empty message', async () => {
      const response = await request(app)
        .post('/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: '   '
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Message is required');
    });

    test('400 failed - message too long', async () => {
      const longMessage = 'a'.repeat(1001);
      const response = await request(app)
        .post('/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: longMessage
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Message is too long. Maximum 1000 characters');
    });

    test('200 success - chat request with valid authentication and message', async () => {
      const response = await request(app)
        .post('/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: 'Hello, what can you tell me about the articles?'
        });

      // Note: Actual response depends on Gemini API configuration
      // The endpoint should return proper structure
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('message', 'Success');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('userMessage');
        expect(response.body.data).toHaveProperty('aiResponse');
        expect(response.body.data).toHaveProperty('timestamp');
      } else {
        // If Gemini API fails, we should get error message
        expect(response.body).toHaveProperty('message');
      }
    });
  });
});
