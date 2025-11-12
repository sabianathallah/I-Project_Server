'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      // OrderItem belongs to Order
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'orderId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      // OrderItem belongs to Museum
      OrderItem.belongsTo(models.Museum, {
        foreignKey: 'MuseumId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  OrderItem.init({
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Order ID is required'
        }
      }
    },
    MuseumId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Museum ID is required'
        }
      }
    },
    visitDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Visit date is required'
        },
        isDate: {
          msg: 'Invalid date format'
        }
      }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Price is required'
        },
        min: {
          args: [0],
          msg: 'Price must be positive'
        }
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'confirmed', 'cancelled', 'used']],
          msg: 'Status must be pending, confirmed, cancelled, or used'
        }
      }
    },
    ticketCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    qr_token: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'OrderItem',
  });

  return OrderItem;
};
