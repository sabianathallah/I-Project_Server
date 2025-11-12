'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Period extends Model {
    static associate(models) {
      // Period has many Articles
      Period.hasMany(models.Article, {
        foreignKey: 'PeriodId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Period.init({
    name_ofPeriod: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Period name is required'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Period',
  });

  return Period;
};
