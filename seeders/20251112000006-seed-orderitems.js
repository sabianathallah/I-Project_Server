'use strict';

const fs = require('fs');
const path = require('path');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dataPath = path.join(__dirname, '../data/orderitems.json');
    const orderItemsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const orderItems = orderItemsData.map(el => {
      delete el.id;
      el.createdAt = el.updatedAt = new Date();
      return el;
    });

    await queryInterface.bulkInsert('OrderItems', orderItems, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('OrderItems', null, {});
  }
};
