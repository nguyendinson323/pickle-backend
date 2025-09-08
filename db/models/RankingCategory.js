'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RankingCategory extends Model {
    static associate(models) {
      // Define associations here
      RankingCategory.hasMany(models.PlayerRanking, {
        foreignKey: 'category_id',
        as: 'playerRankings'
      });
    }
  }

  RankingCategory.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        isIn: [['Male', 'Female', 'Mixed']]
      }
    },
    min_age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    max_age: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'RankingCategory',
    tableName: 'ranking_categories',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return RankingCategory;
};