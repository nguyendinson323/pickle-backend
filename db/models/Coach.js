'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Coach extends Model {
    static associate(models) {
      // Define associations here
      Coach.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Coach.belongsTo(models.State, {
        foreignKey: 'state_id',
        as: 'state'
      });
      Coach.hasMany(models.TournamentMatch, {
        foreignKey: 'referee_id',
        as: 'refereematches'
      });
      Coach.hasMany(models.CoachAvailability, {
        foreignKey: 'coach_id',
        as: 'availabilities'
      });
      Coach.hasMany(models.CoachingSession, {
        foreignKey: 'coach_id',
        as: 'coachingSessions'
      });
      Coach.hasMany(models.CoachCertification, {
        foreignKey: 'coach_id',
        as: 'certifications'
      });
    }
  }

  Coach.init({
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
    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    affiliation_expires_at: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Coach',
    tableName: 'coaches',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Coach;
};