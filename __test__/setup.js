// Load environment variables before anything else
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { sequelize } = require('../models');

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Sync database before all tests
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection after all tests
  await sequelize.close();
});

