'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StateMicrosite extends Model {
    static associate(models) {
      StateMicrosite.belongsTo(models.StateCommittee, {
        foreignKey: 'state_committee_id',
        as: 'state_committee'
      });
      StateMicrosite.hasMany(models.StateMicrositeNews, {
        foreignKey: 'state_committee_id',
        as: 'news'
      });
    }
  }

  StateMicrosite.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    state_committee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'state_committees',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mission_statement: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    website_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    facebook_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    twitter_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    instagram_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    logo_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    banner_image_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    established_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    custom_content: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'StateMicrosite',
    tableName: 'state_microsites',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return StateMicrosite;
};