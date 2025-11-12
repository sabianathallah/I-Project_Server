'use strict';

const fs = require('fs');
const path = require('path');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dataPath = path.join(__dirname, '../data/museums.json');
    const museumsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const museums = museumsData.map(el => {
      delete el.id;
      el.createdAt = el.updatedAt = new Date();
      return el;
    });

    await queryInterface.bulkInsert('Museums', museums, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Museums', null, {});
  }
};
