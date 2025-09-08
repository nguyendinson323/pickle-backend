'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PlayerRanking extends Model {
    static associate(models) {
      // Define associations here
      PlayerRanking.belongsTo(models.Player, {
        foreignKey: 'player_id',
        as: 'player',
        onDelete: 'CASCADE'
      });
      PlayerRanking.belongsTo(models.RankingPeriod, {
        foreignKey: 'period_id',
        as: 'period',
        onDelete: 'CASCADE'
      });
      PlayerRanking.belongsTo(models.RankingCategory, {
        foreignKey: 'category_id',
        as: 'category',
        onDelete: 'CASCADE'
      });
    }
  }

  PlayerRanking.init({
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
    period_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ranking_periods',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ranking_categories',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    tournaments_played: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    current_rank: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    previous_rank: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PlayerRanking',
    tableName: 'player_rankings',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['player_id', 'period_id', 'category_id'],
        name: 'unique_player_ranking'
      }
    ]
  });

  return PlayerRanking;
};