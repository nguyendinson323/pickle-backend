'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TournamentMatch extends Model {
    static associate(models) {
      // Define associations here
      TournamentMatch.belongsTo(models.Tournament, {
        foreignKey: 'tournament_id',
        as: 'tournament',
        onDelete: 'CASCADE'
      });
      TournamentMatch.belongsTo(models.TournamentCategory, {
        foreignKey: 'category_id',
        as: 'category',
        onDelete: 'CASCADE'
      });
      TournamentMatch.belongsTo(models.Court, {
        foreignKey: 'court_id',
        as: 'court'
      });
      TournamentMatch.belongsTo(models.Player, {
        foreignKey: 'player1_id',
        as: 'player1'
      });
      TournamentMatch.belongsTo(models.Player, {
        foreignKey: 'player2_id',
        as: 'player2'
      });
      TournamentMatch.belongsTo(models.Player, {
        foreignKey: 'player3_id',
        as: 'player3'
      });
      TournamentMatch.belongsTo(models.Player, {
        foreignKey: 'player4_id',
        as: 'player4'
      });
      TournamentMatch.belongsTo(models.Coach, {
        foreignKey: 'referee_id',
        as: 'referee'
      });
    }
  }

  TournamentMatch.init({
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
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tournament_categories',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    round: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    match_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    court_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'courts',
        key: 'id'
      }
    },
    match_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    match_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    player1_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id'
      }
    },
    player2_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'players',
        key: 'id'
      }
    },
    player3_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id'
      }
    },
    player4_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'players',
        key: 'id'
      }
    },
    score: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    winner_side: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isIn: [[1, 2]]
      }
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'scheduled',
      validate: {
        isIn: [['scheduled', 'in_progress', 'completed', 'walkover', 'canceled']]
      }
    },
    referee_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'coaches',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'TournamentMatch',
    tableName: 'tournament_matches',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['tournament_id', 'category_id', 'round', 'match_number'],
        name: 'unique_match'
      }
    ]
  });

  return TournamentMatch;
};