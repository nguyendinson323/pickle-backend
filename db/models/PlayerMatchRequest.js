'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PlayerMatchRequest extends Model {
    static associate(models) {
      // Define associations here
      PlayerMatchRequest.belongsTo(models.Player, {
        foreignKey: 'requester_id',
        as: 'requester',
        onDelete: 'CASCADE'
      });
      PlayerMatchRequest.belongsTo(models.Player, {
        foreignKey: 'receiver_id',
        as: 'receiver',
        onDelete: 'CASCADE'
      });
      PlayerMatchRequest.belongsTo(models.Court, {
        foreignKey: 'court_id',
        as: 'court'
      });
    }
  }

  PlayerMatchRequest.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    requester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    preferred_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    preferred_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'accepted', 'rejected', 'canceled']]
      }
    },
    response_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    court_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'courts',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'PlayerMatchRequest',
    tableName: 'player_match_requests',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    validate: {
      differentPlayers() {
        if (this.requester_id === this.receiver_id) {
          throw new Error('Requester and receiver must be different players');
        }
      }
    }
  });

  return PlayerMatchRequest;
};