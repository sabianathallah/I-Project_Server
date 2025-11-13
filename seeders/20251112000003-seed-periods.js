'use strict';

const fs = require('fs');
const path = require('path');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dataPath = path.join(__dirname, '../data/periods.json');
    const periodsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const periods = periodsData.map(el => {
      // Keep the ID from JSON to maintain foreign key relationships
      el.createdAt = el.updatedAt = new Date();
      return el;
    });

    await queryInterface.bulkInsert('Periods', periods, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Periods', null, {});
  }
};
