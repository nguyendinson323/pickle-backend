'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StateCommittee extends Model {
    static associate(models) {
      // Define associations here
      StateCommittee.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      StateCommittee.belongsTo(models.State, {
        foreignKey: 'state_id',
        as: 'state'
      });
      StateCommittee.hasMany(models.Tournament, {
        foreignKey: 'organizer_id',
        constraints: false,
        scope: {
          organizer_type: 'state'
        },
        as: 'tournaments'
      });
      StateCommittee.hasOne(models.Microsite, {
        foreignKey: 'owner_id',
        constraints: false,
        scope: {
          owner_type: 'state'
        },
        as: 'microsite'
      });
    }
  }

  StateCommittee.init({
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
    president_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    president_title: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    rfc: {
      type: DataTypes.STRING(13),
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
    logo_url: {
      type: DataTypes.STRING(255),
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
    institutional_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    affiliation_expires_at: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'StateCommittee',
    tableName: 'state_committees',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return StateCommittee;
};