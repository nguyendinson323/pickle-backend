'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Microsite extends Model {
    static associate(models) {
      // Define associations here
      Microsite.belongsTo(models.MicrositeTemplate, {
        foreignKey: 'template_id',
        as: 'template'
      });
      Microsite.hasMany(models.MicrositePage, {
        foreignKey: 'microsite_id',
        as: 'pages'
      });
      
      // Conditional associations based on owner_type
      Microsite.belongsTo(models.Club, {
        foreignKey: 'owner_id',
        constraints: false,
        as: 'ownerClub'
      });

      Microsite.belongsTo(models.Partner, {
        foreignKey: 'owner_id',
        constraints: false,
        as: 'ownerPartner'
      });

      Microsite.belongsTo(models.StateCommittee, {
        foreignKey: 'owner_id',
        constraints: false,
        as: 'ownerState'
      });
    }
  }

  Microsite.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    owner_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['state', 'club', 'partner']]
      }
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    template_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'microsite_templates',
        key: 'id'
      }
    },
    subdomain: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    logo_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    banner_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    primary_color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#000000'
    },
    secondary_color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#FFFFFF'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Microsite',
    tableName: 'microsites',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Microsite;
};