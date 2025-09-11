'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StateMicrositeNews extends Model {
    static associate(models) {
      StateMicrositeNews.belongsTo(models.StateCommittee, {
        foreignKey: 'state_committee_id',
        as: 'state_committee'
      });
    }
  }

  StateMicrositeNews.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    state_committee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'state_committees',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    author_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    published_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'StateMicrositeNews',
    tableName: 'state_microsite_news',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return StateMicrositeNews;
};