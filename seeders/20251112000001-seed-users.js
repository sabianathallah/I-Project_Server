'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dataPath = path.join(__dirname, '../data/users.json');
    const usersData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const users = usersData.map(el => {
      delete el.id;
      // Hash password before inserting
      const salt = bcrypt.genSaltSync(10);
      el.password = bcrypt.hashSync(el.password, salt);
      el.createdAt = el.updatedAt = new Date();
      return el;
    });

    await queryInterface.bulkInsert('Users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
