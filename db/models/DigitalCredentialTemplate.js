'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DigitalCredentialTemplate extends Model {
    static associate(models) {
      // Define associations here
    }
  }

  DigitalCredentialTemplate.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('player_card', 'tournament_badge', 'certification', 'membership_card'),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    template_config: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    background_url: {
      type: DataTypes.STRING
    },
    logo_url: {
      type: DataTypes.STRING
    },
    design_elements: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    required_fields: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'DigitalCredentialTemplate',
    tableName: 'digital_credential_templates',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['type'],
        unique: true
      },
      {
        fields: ['is_active']
      }
    ]
  });

  return DigitalCredentialTemplate;
};