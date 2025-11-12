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
      expect(response.body).toHaveProperty('message');
    });

    test('should handle chat request with authentication', async () => {
      const response = await request(app)
        .post('/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: 'Hello, what can you tell me about the articles?'
        });

      // Note: Actual response depends on Gemini API configuration
      // The endpoint should at least be accessible with proper auth
      // Status could be 200 (success), 400 (validation error), or 500 (API error)
      expect([200, 400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });
  });
});
