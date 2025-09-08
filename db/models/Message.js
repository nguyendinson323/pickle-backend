'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      // Define associations here
      Message.belongsTo(models.User, {
        foreignKey: 'sender_id',
        as: 'sender',
        onDelete: 'CASCADE'
      });
      Message.hasMany(models.MessageRecipient, {
        foreignKey: 'message_id',
        as: 'recipients'
      });
      Message.hasMany(models.MessageAttachment, {
        foreignKey: 'message_id',
        as: 'attachments'
      });
    }
  }

  Message.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    message_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    has_attachments: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    underscored: true,
    timestamps: false
  });

  return Message;
};