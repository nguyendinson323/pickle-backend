'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DigitalCredential extends Model {
    static associate(models) {
      DigitalCredential.belongsTo(models.Player, {
        foreignKey: 'player_id',
        as: 'player'
      });
      DigitalCredential.belongsTo(models.Tournament, {
        foreignKey: 'tournament_id',
        as: 'tournament'
      });
      DigitalCredential.belongsTo(models.CoachCertification, {
        foreignKey: 'certification_id',
        as: 'certification'
      });
    }
  }

  DigitalCredential.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id'
      }
    },
    credential_type: {
      type: DataTypes.ENUM('player_card', 'tournament_badge', 'certification', 'membership_card'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    issue_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expiry_date: {
      type: DataTypes.DATE
    },
    qr_code_data: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    qr_code_url: {
      type: DataTypes.STRING
    },
    tournament_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tournaments',
        key: 'id'
      }
    },
    certification_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'coach_certifications',
        key: 'id'
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    verification_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_verified_at: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'DigitalCredential',
    tableName: 'digital_credentials',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['player_id']
      },
      {
        fields: ['credential_type']
      },
      {
        fields: ['qr_code_data'],
        unique: true
      },
      {
        fields: ['is_active']
      }
    ]
  });

  return DigitalCredential;
};