'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Club extends Model {
    static associate(models) {
      // Define associations here
      Club.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Club.belongsTo(models.State, {
        foreignKey: 'state_id',
        as: 'state'
      });
      Club.hasMany(models.Court, {
        foreignKey: 'owner_id',
        constraints: false,
        scope: {
          owner_type: 'club'
        },
        as: 'courts'
      });
      Club.hasMany(models.Tournament, {
        foreignKey: 'organizer_id',
        constraints: false,
        scope: {
          organizer_type: 'club'
        },
        as: 'tournaments'
      });
      Club.hasOne(models.Microsite, {
        foreignKey: 'owner_id',
        constraints: false,
        scope: {
          owner_type: 'club'
        },
        as: 'microsite'
      });
    }
  }

  Club.init({
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rfc: {
      type: DataTypes.STRING(13),
      allowNull: true
    },
    manager_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    manager_title: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'states',
        key: 'id'
      }
    },
    club_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    social_media: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    logo_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    has_courts: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    premium_expires_at: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    affiliation_expires_at: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Club',
    tableName: 'clubs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Club;
};