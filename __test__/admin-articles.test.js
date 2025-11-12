// Load environment variables first
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const request = require('supertest');
const app = require('../app');
const { sequelize, User, Article, Period } = require('../models');
const { signToken } = require('../helpers/jwt');

let adminToken;
let userToken;
let testPeriodId;
let testArticleId;

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

  // Create test article
  const article = await Article.create({
    title: 'Test Article',
    content: 'This is test content',
    imgUrl: 'https://example.com/image.jpg',
    PeriodId: testPeriodId,
    UserId: admin.id
  });
  testArticleId = article.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Admin Article Endpoints', () => {
  describe('GET /articles', () => {
    test('200 success get all articles with admin token', async () => {
      const response = await request(app)
        .get('/articles')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('401 failed - no token provided', async () => {
      const response = await request(app).get('/articles');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('403 failed - user role not authorized', async () => {
      const response = await request(app)
        .get('/articles')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /articles', () => {
    test('201 success create article with admin token', async () => {
      const response = await request(app)
        .post('/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'New Article',
          content: 'New article content',
          PeriodId: testPeriodId
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'New Article');
      expect(response.body).toHaveProperty('content', 'New article content');
    });

    test('400 failed create article - title is required', async () => {
      const response = await request(app)
        .post('/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Content without title',
          PeriodId: testPeriodId
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('401 failed - no token provided', async () => {
      const response = await request(app)
        .post('/articles')
        .send({
          title: 'New Article',
          content: 'New article content',
          PeriodId: testPeriodId
        });

      expect(response.status).toBe(401);
    });

    test('403 failed - user role not authorized', async () => {
      const response = await request(app)
        .post('/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'New Article',
          content: 'New article content',
          PeriodId: testPeriodId
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /articles/:id', () => {
    test('200 success get article by id with admin token', async () => {
      const response = await request(app)
        .get(`/articles/${testArticleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testArticleId);
      expect(response.body).toHaveProperty('title');
    });

    test('404 failed - article not found', async () => {
      const response = await request(app)
        .get('/articles/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /articles/:id', () => {
    test('200 success update article with admin token', async () => {
      const response = await request(app)
        .put(`/articles/${testArticleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Article',
          content: 'Updated content',
          PeriodId: testPeriodId
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Updated Article');
    });

    test('404 failed update - article not found', async () => {
      const response = await request(app)
        .put('/articles/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Article',
          content: 'Updated content'
        });

      expect(response.status).toBe(404);
    });

    test('401 failed - no token provided', async () => {
      const response = await request(app)
        .put(`/articles/${testArticleId}`)
        .send({
          title: 'Updated Article'
        });

      expect(response.status).toBe(401);
    });

    test('403 failed - user role not authorized', async () => {
      const response = await request(app)
        .put(`/articles/${testArticleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated Article'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /articles/:id', () => {
    test('401 failed - no token provided', async () => {
      const response = await request(app).delete(`/articles/${testArticleId}`);

      expect(response.status).toBe(401);
    });

    test('403 failed - user role not authorized', async () => {
      const response = await request(app)
        .delete(`/articles/${testArticleId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    test('404 failed delete - article not found', async () => {
      const response = await request(app)
        .delete('/articles/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    test('200 success delete article with admin token', async () => {
      const response = await request(app)
        .delete(`/articles/${testArticleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PATCH /articles/upload/:id', () => {
    test('401 failed - no token provided', async () => {
      const response = await request(app)
        .patch(`/articles/upload/${testArticleId}`);

      expect(response.status).toBe(401);
    });

    test('403 failed - user role not authorized', async () => {
      const response = await request(app)
        .patch(`/articles/upload/${testArticleId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    // Note: Testing file upload requires proper multipart/form-data setup
    // This is a basic test that checks authorization
  });
});
