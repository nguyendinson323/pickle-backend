'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MicrositeAnalytics extends Model {
    static associate(models) {
      // Define associations here
      MicrositeAnalytics.belongsTo(models.Microsite, {
        foreignKey: 'microsite_id',
        as: 'microsite'
      });
    }
  }

  MicrositeAnalytics.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    microsite_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'microsites',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    visitors: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    page_views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    bounce_rate: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false,
      defaultValue: 0
    },
    avg_session_duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    unique_visitors: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    referrer_data: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    device_data: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'MicrositeAnalytics',
    tableName: 'microsite_analytics',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['microsite_id', 'date']
      }
    ]
  });

  return MicrositeAnalytics;
};