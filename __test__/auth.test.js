// Load environment variables first
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const request = require('supertest');
const app = require('../app');
const { sequelize, User } = require('../models');
const { hash } = require('../helpers/bcrypt');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Authentication Endpoints', () => {
  describe('POST /register', () => {
    test('201 success register - should return message and email', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          email: 'user@mail.com',
          password: 'user123',
          fullName: 'User Test',
          role: 'user'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Success create new user');
      expect(response.body).toHaveProperty('email', 'user@mail.com');
    });

    test('400 failed register - email is required', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          password: 'user123',
          fullName: 'User Test'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('400 failed register - password is required', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          email: 'user2@mail.com',
          fullName: 'User Test'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('400 failed register - email already exists', async () => {
      await request(app)
        .post('/register')
        .send({
          email: 'duplicate@mail.com',
          password: 'user123',
          fullName: 'User Test'
        });

      const response = await request(app)
        .post('/register')
        .send({
          email: 'duplicate@mail.com',
          password: 'user123',
          fullName: 'User Test 2'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('400 failed register - invalid email format', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          email: 'invalidemail',
          password: 'user123',
          fullName: 'User Test'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /login', () => {
    beforeAll(async () => {
      await User.create({
        email: 'login@mail.com',
        password: 'login123',
        fullName: 'Login User',
        role: 'user'
      });
    });

    test('200 success login - should return access_token', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'login@mail.com',
          password: 'login123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
    });

    test('400 failed login - email is required', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          password: 'login123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('400 failed login - password is required', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'login@mail.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('401 failed login - invalid email', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'wrong@mail.com',
          password: 'login123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('401 failed login - invalid password', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'login@mail.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /google-login', () => {
    test('should fail with invalid or missing google token', async () => {
      const response = await request(app)
        .post('/google-login')
        .send({
          googleToken: 'fake-invalid-google-token'
        });

      // Should fail since token is invalid (400, 401, or 500)
      expect([400, 401, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });

    test('should fail with no google token provided', async () => {
      const response = await request(app)
        .post('/google-login')
        .send({});

      // Should fail (400, 401, or 500)
      expect([400, 401, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });
  });
});
