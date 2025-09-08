'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TournamentCategory extends Model {
    static associate(models) {
      // Define associations here
      TournamentCategory.belongsTo(models.Tournament, {
        foreignKey: 'tournament_id',
        as: 'tournament',
        onDelete: 'CASCADE'
      });
      TournamentCategory.hasMany(models.TournamentRegistration, {
        foreignKey: 'category_id',
        as: 'registrations'
      });
      TournamentCategory.hasMany(models.TournamentMatch, {
        foreignKey: 'category_id',
        as: 'matches'
      });
      TournamentCategory.hasMany(models.RankingPointsHistory, {
        foreignKey: 'category_id',
        as: 'rankingPointsHistory'
      });
    }
  }

  TournamentCategory.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    tournament_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tournaments',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    min_age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    max_age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        isIn: [['Male', 'Female', 'Mixed']]
      }
    },
    min_skill_level: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true
    },
    max_skill_level: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true
    },
    format: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    max_participants: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'TournamentCategory',
    tableName: 'tournament_categories',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return TournamentCategory;
};