'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Museum extends Model {
    static associate(models) {
      // Museum has many OrderItems
      Museum.hasMany(models.OrderItem, {
        foreignKey: 'MuseumId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Museum.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Museum name is required'
        }
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Address is required'
        }
      }
    },
    openHour: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Opening hours is required'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Phone number is required'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Museum',
  });

  return Museum;
};
