'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TournamentRegistration extends Model {
    static associate(models) {
      // Define associations here
      TournamentRegistration.belongsTo(models.Tournament, {
        foreignKey: 'tournament_id',
        as: 'tournament',
        onDelete: 'CASCADE'
      });
      TournamentRegistration.belongsTo(models.TournamentCategory, {
        foreignKey: 'category_id',
        as: 'category',
        onDelete: 'CASCADE'
      });
      TournamentRegistration.belongsTo(models.Player, {
        foreignKey: 'player_id',
        as: 'player',
        onDelete: 'CASCADE'
      });
      TournamentRegistration.belongsTo(models.Player, {
        foreignKey: 'partner_player_id',
        as: 'partnerPlayer'
      });
    }
  }

  TournamentRegistration.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    tournament_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tournaments',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tournament_categories',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    partner_player_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'players',
        key: 'id'
      }
    },
    registration_date: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    payment_status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'paid', 'refunded']]
      }
    },
    amount_paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    stripe_payment_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'registered',
      validate: {
        isIn: [['registered', 'confirmed', 'waitlisted', 'withdrawn']]
      }
    }
  }, {
    sequelize,
    modelName: 'TournamentRegistration',
    tableName: 'tournament_registrations',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['tournament_id', 'category_id', 'player_id'],
        name: 'unique_registration'
      }
    ]
  });

  return TournamentRegistration;
};