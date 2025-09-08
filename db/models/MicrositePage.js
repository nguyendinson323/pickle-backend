'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MicrositePage extends Model {
    static associate(models) {
      // Define associations here
      MicrositePage.belongsTo(models.Microsite, {
        foreignKey: 'microsite_id',
        as: 'microsite',
        onDelete: 'CASCADE'
      });
    }
  }

  MicrositePage.init({
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
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'MicrositePage',
    tableName: 'microsite_pages',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['microsite_id', 'slug'],
        name: 'unique_page_per_microsite'
      }
    ]
  });

  return MicrositePage;
};