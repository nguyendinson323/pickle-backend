'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RankingPeriod extends Model {
    static associate(models) {
      // Define associations here
      RankingPeriod.hasMany(models.PlayerRanking, {
        foreignKey: 'period_id',
        as: 'playerRankings'
      });
    }
  }

  RankingPeriod.init({
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
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'RankingPeriod',
    tableName: 'ranking_periods',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return RankingPeriod;
};