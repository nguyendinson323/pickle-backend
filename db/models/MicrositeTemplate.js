'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MicrositeTemplate extends Model {
    static associate(models) {
      // Define associations here
      MicrositeTemplate.hasMany(models.Microsite, {
        foreignKey: 'template_id',
        as: 'microsites'
      });
    }
  }

  MicrositeTemplate.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    thumbnail_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'MicrositeTemplate',
    tableName: 'microsite_templates',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return MicrositeTemplate;
};