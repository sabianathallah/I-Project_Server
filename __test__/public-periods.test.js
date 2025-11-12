// Load environment variables first
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const request = require('supertest');
const app = require('../app');
const { sequelize, Period } = require('../models');

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create test periods
  await Period.bulkCreate([
    {
      name_ofPeriod: 'Period 1'
    },
    {
      name_ofPeriod: 'Period 2'
    }
  ]);
});

afterAll(async () => {
  await sequelize.close();
});

describe('Public Period Endpoints', () => {
  describe('GET /pub/periods', () => {
    test('200 success get all periods', async () => {
      const response = await request(app).get('/pub/periods');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name_ofPeriod');
    });
  });
});
