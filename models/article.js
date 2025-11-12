'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    static associate(models) {
      // Article belongs to User
      Article.belongsTo(models.User, {
        foreignKey: 'UserId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      // Article belongs to Period
      Article.belongsTo(models.Period, {
        foreignKey: 'PeriodId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Article.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Title is required'
        }
      }
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Content is required'
        }
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'User ID is required'
        }
      }
    },
    PeriodId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Period ID is required'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Article',
  });

  return Article;
};
