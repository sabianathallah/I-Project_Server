'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Orders');
    
    if (!tableDescription.ticketCode) {
      await queryInterface.addColumn('Orders', 'ticketCode', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'ticketCode');
  }
};
