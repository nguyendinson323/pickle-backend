'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MessageRecipient extends Model {
    static associate(models) {
      // Define associations here
      MessageRecipient.belongsTo(models.Message, {
        foreignKey: 'message_id',
        as: 'message',
        onDelete: 'CASCADE'
      });
      MessageRecipient.belongsTo(models.User, {
        foreignKey: 'recipient_id',
        as: 'recipient',
        onDelete: 'CASCADE'
      });
    }
  }

  MessageRecipient.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'messages',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'MessageRecipient',
    tableName: 'message_recipients',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['message_id', 'recipient_id'],
        name: 'unique_message_recipient'
      }
    ]
  });

  return MessageRecipient;
};