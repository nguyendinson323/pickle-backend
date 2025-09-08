'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class State extends Model {
    static associate(models) {
      // Define associations here
      State.hasMany(models.Player, {
        foreignKey: 'state_id',
        as: 'players'
      });
      State.hasMany(models.Coach, {
        foreignKey: 'state_id',
        as: 'coaches'
      });
      State.hasMany(models.Club, {
        foreignKey: 'state_id',
        as: 'clubs'
      });
      State.hasMany(models.Partner, {
        foreignKey: 'state_id',
        as: 'partners'
      });
      State.hasMany(models.StateCommittee, {
        foreignKey: 'state_id',
        as: 'stateCommittees'
      });
      State.hasMany(models.Court, {
        foreignKey: 'state_id',
        as: 'courts'
      });
      State.hasMany(models.Tournament, {
        foreignKey: 'state_id',
        as: 'tournaments'
      });
    }
  }

  State.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    short_code: {
      type: DataTypes.STRING(5),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'State',
    tableName: 'states',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false // No updated_at in schema
  });

  return State;
};