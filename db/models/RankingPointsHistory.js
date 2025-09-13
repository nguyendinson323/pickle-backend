'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RankingPointsHistory extends Model {
    static associate(models) {
      // Define associations here
      RankingPointsHistory.belongsTo(models.Player, {
        foreignKey: 'player_id',
        as: 'player',
        onDelete: 'CASCADE'
      });
      RankingPointsHistory.belongsTo(models.Tournament, {
        foreignKey: 'tournament_id',
        as: 'tournament',
        onDelete: 'CASCADE',
        allowNull: true
      });
      RankingPointsHistory.belongsTo(models.TournamentCategory, {
        foreignKey: 'category_id',
        as: 'category',
        onDelete: 'CASCADE'
      });
    }
  }

  RankingPointsHistory.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    tournament_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tournaments',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tournament_categories',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'RankingPointsHistory',
    tableName: 'ranking_points_history',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return RankingPointsHistory;
};