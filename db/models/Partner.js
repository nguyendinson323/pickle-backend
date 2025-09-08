'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Partner extends Model {
    static associate(models) {
      // Define associations here
      Partner.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Partner.belongsTo(models.State, {
        foreignKey: 'state_id',
        as: 'state'
      });
      Partner.hasMany(models.Court, {
        foreignKey: 'owner_id',
        constraints: false,
        scope: {
          owner_type: 'partner'
        },
        as: 'courts'
      });
      Partner.hasMany(models.Tournament, {
        foreignKey: 'organizer_id',
        constraints: false,
        scope: {
          organizer_type: 'partner'
        },
        as: 'tournaments'
      });
      Partner.hasOne(models.Microsite, {
        foreignKey: 'owner_id',
        constraints: false,
        scope: {
          owner_type: 'partner'
        },
        as: 'microsite'
      });
    }
  }

  Partner.init({
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
    business_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rfc: {
      type: DataTypes.STRING(13),
      allowNull: true
    },
    contact_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    contact_title: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    partner_type: {
      type: DataTypes.STRING(50),
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
    }
  }, {
    sequelize,
    modelName: 'Partner',
    tableName: 'partners',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Partner;
};