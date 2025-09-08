'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here
      User.hasOne(models.Player, {
        foreignKey: 'user_id',
        as: 'player'
      });
      User.hasOne(models.Coach, {
        foreignKey: 'user_id',
        as: 'coach'
      });
      User.hasOne(models.Club, {
        foreignKey: 'user_id',
        as: 'club'
      });
      User.hasOne(models.Partner, {
        foreignKey: 'user_id',
        as: 'partner'
      });
      User.hasOne(models.StateCommittee, {
        foreignKey: 'user_id',
        as: 'stateCommittee'
      });
      User.hasMany(models.Notification, {
        foreignKey: 'user_id',
        as: 'notifications'
      });
      User.hasMany(models.Payment, {
        foreignKey: 'user_id',
        as: 'payments'
      });
      User.hasMany(models.Subscription, {
        foreignKey: 'user_id',
        as: 'subscriptions'
      });
      User.hasMany(models.Document, {
        foreignKey: 'owner_id',
        as: 'documents'
      });
      User.hasMany(models.Message, {
        foreignKey: 'sender_id',
        as: 'sentMessages'
      });
      User.hasMany(models.MessageRecipient, {
        foreignKey: 'recipient_id',
        as: 'receivedMessages'
      });
      User.hasMany(models.ChatParticipant, {
        foreignKey: 'user_id',
        as: 'chatParticipations'
      });
      User.hasMany(models.ChatMessage, {
        foreignKey: 'sender_id',
        as: 'chatMessages'
      });
      User.hasMany(models.CourtMaintenance, {
        foreignKey: 'created_by',
        as: 'createdMaintenances'
      });
    }
  }

  User.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['admin', 'player', 'coach', 'club', 'partner', 'state']]
      }
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_premium: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_searchable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return User;
};