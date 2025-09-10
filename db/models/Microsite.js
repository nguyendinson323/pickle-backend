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
        as: 'ownerClub',
        scope: {
          owner_type: 'club'
        }
      });
      
      Microsite.belongsTo(models.Partner, {
        foreignKey: 'owner_id',
        constraints: false,
        as: 'ownerPartner',
        scope: {
          owner_type: 'partner'
        }
      });
      
      Microsite.belongsTo(models.StateCommittee, {
        foreignKey: 'owner_id',
        constraints: false,
        as: 'ownerState',
        scope: {
          owner_type: 'state'
        }
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
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'inactive', 'suspended', 'pending', 'approved', 'rejected']]
      }
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    domain_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: true
    },
    page_views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    monthly_visitors: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    content_score: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false,
      defaultValue: 0
    },
    has_inappropriate_content: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    content_warnings: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    approval_status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'approved', 'rejected']]
      }
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    visibility_status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'public',
      validate: {
        isIn: [['public', 'private', 'restricted']]
      }
    },
    seo_score: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false,
      defaultValue: 0
    },
    performance_score: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false,
      defaultValue: 0
    },
    last_audit_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
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