'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tournament extends Model {
    static associate(models) {
      // Define associations here
      Tournament.belongsTo(models.State, {
        foreignKey: 'state_id',
        as: 'state'
      });
      Tournament.hasMany(models.TournamentCategory, {
        foreignKey: 'tournament_id',
        as: 'categories'
      });
      Tournament.hasMany(models.TournamentRegistration, {
        foreignKey: 'tournament_id',
        as: 'registrations'
      });
      Tournament.hasMany(models.TournamentMatch, {
        foreignKey: 'tournament_id',
        as: 'matches'
      });
      Tournament.hasMany(models.RankingPointsHistory, {
        foreignKey: 'tournament_id',
        as: 'rankingPointsHistory'
      });
    }
  }

  Tournament.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tournament_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    organizer_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isIn: [['federation', 'state', 'club', 'partner']]
      }
    },
    organizer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'states',
        key: 'id'
      }
    },
    venue_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    venue_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    registration_start: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    registration_end: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    entry_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    max_participants: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'upcoming',
      validate: {
        isIn: [['upcoming', 'ongoing', 'completed', 'canceled']]
      }
    },
    banner_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_ranking: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    ranking_multiplier: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false,
      defaultValue: 1.0
    }
  }, {
    sequelize,
    modelName: 'Tournament',
    tableName: 'tournaments',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Tournament;
};