'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SubscriptionPlan extends Model {
    static associate(models) {
      // Define associations here
      SubscriptionPlan.hasMany(models.Subscription, {
        foreignKey: 'plan_id',
        as: 'subscriptions'
      });
    }
  }

  SubscriptionPlan.init({
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
    for_role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['player', 'coach', 'club', 'partner']]
      }
    },
    monthly_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    yearly_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    features: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'SubscriptionPlan',
    tableName: 'subscription_plans',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return SubscriptionPlan;
};