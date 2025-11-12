// Load environment variables first
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const request = require('supertest');
const app = require('../app');
const { sequelize, User, Period } = require('../models');
const { signToken } = require('../helpers/jwt');

let adminToken;
let userToken;
let testPeriodId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create admin user
  const admin = await User.create({
    email: 'admin@mail.com',
    password: 'admin123',
    fullName: 'Admin User',
    role: 'admin'
  });

  // Create regular user
  const user = await User.create({
    email: 'regularuser@mail.com',
    password: 'user123',
    fullName: 'Regular User',
    role: 'user'
  });

  // Generate tokens
  adminToken = signToken({
    id: admin.id,
    email: admin.email,
    role: admin.role
  });

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

describe('Admin Period Endpoints', () => {
  describe('GET /periods', () => {
    test('200 success get all periods with admin token', async () => {
      const response = await request(app)
        .get('/periods')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name_ofPeriod');
    });

    test('401 failed - no token provided', async () => {
      const response = await request(app).get('/periods');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('403 failed - user role not authorized', async () => {
      const response = await request(app)
        .get('/periods')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /periods', () => {
    test('201 success create period with admin token', async () => {
      const response = await request(app)
        .post('/periods')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name_ofPeriod: 'New Period'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name_ofPeriod', 'New Period');
    });

    test('400 failed create period - name is required', async () => {
      const response = await request(app)
        .post('/periods')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('401 failed - no token provided', async () => {
      const response = await request(app)
        .post('/periods')
        .send({
          name_ofPeriod: 'New Period'
        });

      expect(response.status).toBe(401);
    });

    test('403 failed - user role not authorized', async () => {
      const response = await request(app)
        .post('/periods')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name_ofPeriod: 'New Period'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /periods/:id', () => {
    test('200 success update period with admin token', async () => {
      const response = await request(app)
        .put(`/periods/${testPeriodId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name_ofPeriod: 'Updated Period'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name_ofPeriod', 'Updated Period');
    });

    test('404 failed update - period not found', async () => {
      const response = await request(app)
        .put('/periods/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name_ofPeriod: 'Updated Period'
        });

      expect(response.status).toBe(404);
    });

    test('401 failed - no token provided', async () => {
      const response = await request(app)
        .put(`/periods/${testPeriodId}`)
        .send({
          name_ofPeriod: 'Updated Period'
        });

      expect(response.status).toBe(401);
    });

    test('403 failed - user role not authorized', async () => {
      const response = await request(app)
        .put(`/periods/${testPeriodId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name_ofPeriod: 'Updated Period'
        });

      expect(response.status).toBe(403);
    });
  });
});
