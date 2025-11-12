'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Order belongs to User
      Order.belongsTo(models.User, {
        foreignKey: 'UserId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Order.init({
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'User ID is required'
        }
      }
    },
    price_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Price amount is required'
        },
        min: {
          args: [0],
          msg: 'Price amount must be positive'
        }
      }
    },
    midtrans_orderId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    qrString: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ticketCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'paid', 'cancelled', 'expired', 'used']],
          msg: 'Status must be pending, paid, cancelled, expired, or used'
        }
      }
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expiredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    museumName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    visitDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ticketQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      validate: {
        min: {
          args: [1],
          msg: 'Ticket quantity must be at least 1'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Order',
  });

  return Order;
};
