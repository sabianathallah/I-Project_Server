// Load environment variables first
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const request = require('supertest');
const app = require('../app');
const { sequelize, User, Article, Period } = require('../models');

let testPeriodId;
let testArticleId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create test user
  const user = await User.create({
    email: 'article@mail.com',
    password: 'article123',
    fullName: 'Article User',
    role: 'admin'
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
    UserId: user.id
  });
  testArticleId = article.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Public Article Endpoints', () => {
  describe('GET /pub/articles', () => {
    test('200 success get all articles', async () => {
      const response = await request(app).get('/pub/articles');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('content');
      expect(response.body[0]).toHaveProperty('User');
      expect(response.body[0]).toHaveProperty('Period');
    });
  });

  describe('GET /pub/articles/:id', () => {
    test('200 success get article by id', async () => {
      const response = await request(app).get(`/pub/articles/${testArticleId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testArticleId);
      expect(response.body).toHaveProperty('title', 'Test Article');
      expect(response.body).toHaveProperty('content', 'This is test content');
      expect(response.body).toHaveProperty('User');
      expect(response.body).toHaveProperty('Period');
    });

    test('404 failed get article - article not found', async () => {
      const response = await request(app).get('/pub/articles/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
});
