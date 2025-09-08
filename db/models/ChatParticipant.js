'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChatParticipant extends Model {
    static associate(models) {
      // Define associations here
      ChatParticipant.belongsTo(models.ChatRoom, {
        foreignKey: 'chat_room_id',
        as: 'chatRoom',
        onDelete: 'CASCADE'
      });
      ChatParticipant.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE'
      });
    }
  }

  ChatParticipant.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    chat_room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'chat_rooms',
        key: 'id'
      },
      onDelete: 'CASCADE'
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
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    last_read: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ChatParticipant',
    tableName: 'chat_participants',
    underscored: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['chat_room_id', 'user_id'],
        name: 'unique_chat_participant'
      }
    ]
  });

  return ChatParticipant;
};