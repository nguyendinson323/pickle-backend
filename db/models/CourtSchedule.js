'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CourtSchedule extends Model {
    static associate(models) {
      // Define associations here
      CourtSchedule.belongsTo(models.Court, {
        foreignKey: 'court_id',
        as: 'court',
        onDelete: 'CASCADE'
      });
    }
  }

  CourtSchedule.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    court_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courts',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 6
      }
    },
    open_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    close_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    is_closed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'CourtSchedule',
    tableName: 'court_schedules',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return CourtSchedule;
};