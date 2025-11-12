'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if columns exist before adding
    const tableDescription = await queryInterface.describeTable('Orders');
    
    if (!tableDescription.ticketQuantity) {
      await queryInterface.addColumn('Orders', 'ticketQuantity', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      });
    }
    
    if (!tableDescription.museumName) {
      await queryInterface.addColumn('Orders', 'museumName', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    
    if (!tableDescription.visitDate) {
      await queryInterface.addColumn('Orders', 'visitDate', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'ticketQuantity');
    await queryInterface.removeColumn('Orders', 'museumName');
    await queryInterface.removeColumn('Orders', 'visitDate');
  }
};
