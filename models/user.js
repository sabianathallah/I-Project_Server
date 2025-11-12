'use strict';
const { Model } = require('sequelize');
const { hash } = require('../helpers/bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many Articles
      User.hasMany(models.Article, {
        foreignKey: 'UserId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      // User has many Orders
      User.hasMany(models.Order, {
        foreignKey: 'UserId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  User.init({
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Full name is required'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email already exists'
      },
      validate: {
        notEmpty: {
          msg: 'Email is required'
        },
        isEmail: {
          msg: 'Invalid email format'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password is required'
        }
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: {
          args: [['admin', 'staff', 'user']],
          msg: 'Role must be admin, staff, or user'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: (user) => {
        user.password = hash(user.password);
      }
    }
  });

  return User;
};
