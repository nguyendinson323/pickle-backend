'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Player extends Model {
    static associate(models) {
      // Define associations here
      Player.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Player.belongsTo(models.State, {
        foreignKey: 'state_id',
        as: 'state'
      });
      Player.hasMany(models.CourtReservation, {
        foreignKey: 'player_id',
        as: 'courtReservations'
      });
      Player.hasMany(models.TournamentRegistration, {
        foreignKey: 'player_id',
        as: 'tournamentRegistrations'
      });
      Player.hasMany(models.PlayerAvailability, {
        foreignKey: 'player_id',
        as: 'availabilities'
      });
      Player.hasMany(models.PlayerMatchRequest, {
        foreignKey: 'requester_id',
        as: 'sentMatchRequests'
      });
      Player.hasMany(models.PlayerMatchRequest, {
        foreignKey: 'receiver_id',
        as: 'receivedMatchRequests'
      });
      Player.hasMany(models.PlayerRanking, {
        foreignKey: 'player_id',
        as: 'rankings'
      });
      Player.belongsTo(models.Club, {
        foreignKey: 'club_id',
        as: 'club'
      });
      Player.hasMany(models.DigitalCredential, {
        foreignKey: 'player_id',
        as: 'digitalCredentials'
      });
    }
  }

  Player.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        isIn: [['Male', 'Female', 'Other']]
      }
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'states',
        key: 'id'
      }
    },
    curp: {
      type: DataTypes.STRING(18),
      allowNull: true,
      unique: true
    },
    nrtp_level: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
      validate: {
        min: 1.0,
        max: 5.0
      }
    },
    profile_photo_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    id_document_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nationality: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'Mexico'
    },
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ranking_position: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    affiliation_expires_at: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Player',
    tableName: 'players',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Player;
};