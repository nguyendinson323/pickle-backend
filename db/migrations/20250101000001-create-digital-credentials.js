'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create digital_credential_templates table
    await queryInterface.createTable('digital_credential_templates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('player_card', 'tournament_badge', 'certification', 'membership_card'),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT
      },
      template_config: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      background_url: {
        type: Sequelize.STRING
      },
      logo_url: {
        type: Sequelize.STRING
      },
      design_elements: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      required_fields: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create digital_credentials table
    await queryInterface.createTable('digital_credentials', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'players',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      credential_type: {
        type: Sequelize.ENUM('player_card', 'tournament_badge', 'certification', 'membership_card'),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      issue_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expiry_date: {
        type: Sequelize.DATE
      },
      qr_code_data: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      qr_code_url: {
        type: Sequelize.STRING
      },
      tournament_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'tournaments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      certification_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'coach_certifications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      verification_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      last_verified_at: {
        type: Sequelize.DATE
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('digital_credential_templates', ['type'], {
      unique: true
    });
    await queryInterface.addIndex('digital_credential_templates', ['is_active']);
    
    await queryInterface.addIndex('digital_credentials', ['player_id']);
    await queryInterface.addIndex('digital_credentials', ['credential_type']);
    await queryInterface.addIndex('digital_credentials', ['qr_code_data'], {
      unique: true
    });
    await queryInterface.addIndex('digital_credentials', ['is_active']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('digital_credentials');
    await queryInterface.dropTable('digital_credential_templates');
  }
};