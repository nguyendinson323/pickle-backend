'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChatRoom extends Model {
    static associate(models) {
      // Define associations here
      ChatRoom.hasMany(models.ChatParticipant, {
        foreignKey: 'chat_room_id',
        as: 'participants'
      });
      ChatRoom.hasMany(models.ChatMessage, {
        foreignKey: 'chat_room_id',
        as: 'messages'
      });
    }
  }

  ChatRoom.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isIn: [['direct', 'group', 'tournament', 'state', 'club']]
      }
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ChatRoom',
    tableName: 'chat_rooms',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return ChatRoom;
};