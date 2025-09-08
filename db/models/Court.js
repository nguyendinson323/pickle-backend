'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Court extends Model {
    static associate(models) {
      // Define associations here
      Court.belongsTo(models.State, {
        foreignKey: 'state_id',
        as: 'state'
      });
      Court.hasMany(models.CourtSchedule, {
        foreignKey: 'court_id',
        as: 'schedules'
      });
      Court.hasMany(models.CourtReservation, {
        foreignKey: 'court_id',
        as: 'reservations'
      });
      Court.hasMany(models.CourtMaintenance, {
        foreignKey: 'court_id',
        as: 'maintenances'
      });
      Court.hasMany(models.TournamentMatch, {
        foreignKey: 'court_id',
        as: 'tournamentMatches'
      });
      Court.hasMany(models.CoachingSession, {
        foreignKey: 'court_id',
        as: 'coachingSessions'
      });
      Court.hasMany(models.PlayerMatchRequest, {
        foreignKey: 'court_id',
        as: 'matchRequests'
      });
    }
  }

  Court.init({
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
    owner_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['club', 'partner']]
      }
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'states',
        key: 'id'
      }
    },
    court_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    surface_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    indoor: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    lights: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    amenities: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'maintenance', 'inactive']]
      }
    }
  }, {
    sequelize,
    modelName: 'Court',
    tableName: 'courts',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Court;
};