'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CoachingSession extends Model {
    static associate(models) {
      // Define associations here
      CoachingSession.belongsTo(models.Coach, {
        foreignKey: 'coach_id',
        as: 'coach',
        onDelete: 'CASCADE'
      });
      CoachingSession.belongsTo(models.Player, {
        foreignKey: 'player_id',
        as: 'player',
        onDelete: 'CASCADE'
      });
      CoachingSession.belongsTo(models.Court, {
        foreignKey: 'court_id',
        as: 'court'
      });
    }
  }

  CoachingSession.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    coach_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'coaches',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    session_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    court_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'courts',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'scheduled',
      validate: {
        isIn: [['scheduled', 'completed', 'canceled']]
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    payment_status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'paid', 'refunded']]
      }
    },
    stripe_payment_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    }
  }, {
    sequelize,
    modelName: 'CoachingSession',
    tableName: 'coaching_sessions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return CoachingSession;
};