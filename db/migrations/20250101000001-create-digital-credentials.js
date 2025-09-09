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

    // Insert default templates
    await queryInterface.bulkInsert('digital_credential_templates', [
      {
        name: 'Player Official Card',
        type: 'player_card',
        description: 'Official federation player identification card',
        template_config: {
          layout: 'standard_card',
          dimensions: { width: 800, height: 500 },
          elements: [
            { type: 'federation_logo', position: { x: 50, y: 50 } },
            { type: 'player_photo', position: { x: 600, y: 100 } },
            { type: 'player_name', position: { x: 50, y: 150 } },
            { type: 'nrtp_level', position: { x: 50, y: 200 } },
            { type: 'state', position: { x: 50, y: 250 } },
            { type: 'ranking', position: { x: 50, y: 300 } },
            { type: 'club_status', position: { x: 50, y: 350 } },
            { type: 'qr_code', position: { x: 600, y: 300 } },
            { type: 'player_id', position: { x: 50, y: 400 } },
            { type: 'expiry_date', position: { x: 400, y: 450 } }
          ]
        },
        required_fields: ['player_name', 'nrtp_level', 'state', 'player_id'],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Tournament Badge',
        type: 'tournament_badge',
        description: 'Digital badge for tournament participation',
        template_config: {
          layout: 'badge',
          dimensions: { width: 400, height: 400 },
          elements: [
            { type: 'tournament_logo', position: { x: 50, y: 50 } },
            { type: 'player_name', position: { x: 50, y: 200 } },
            { type: 'tournament_name', position: { x: 50, y: 250 } },
            { type: 'achievement', position: { x: 50, y: 300 } },
            { type: 'qr_code', position: { x: 250, y: 250 } }
          ]
        },
        required_fields: ['player_name', 'tournament_name', 'achievement'],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Coach Certification',
        type: 'certification',
        description: 'Digital certificate for coaching credentials',
        template_config: {
          layout: 'certificate',
          dimensions: { width: 800, height: 600 },
          elements: [
            { type: 'certification_logo', position: { x: 50, y: 50 } },
            { type: 'coach_name', position: { x: 200, y: 200 } },
            { type: 'certification_name', position: { x: 200, y: 250 } },
            { type: 'issue_date', position: { x: 200, y: 300 } },
            { type: 'expiry_date', position: { x: 200, y: 350 } },
            { type: 'qr_code', position: { x: 600, y: 400 } }
          ]
        },
        required_fields: ['coach_name', 'certification_name', 'issue_date'],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Membership Card',
        type: 'membership_card',
        description: 'Annual membership card',
        template_config: {
          layout: 'membership_card',
          dimensions: { width: 600, height: 400 },
          elements: [
            { type: 'federation_logo', position: { x: 50, y: 50 } },
            { type: 'member_name', position: { x: 50, y: 150 } },
            { type: 'membership_type', position: { x: 50, y: 200 } },
            { type: 'valid_until', position: { x: 50, y: 250 } },
            { type: 'member_id', position: { x: 50, y: 300 } },
            { type: 'qr_code', position: { x: 400, y: 200 } }
          ]
        },
        required_fields: ['member_name', 'membership_type', 'valid_until'],
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('digital_credentials');
    await queryInterface.dropTable('digital_credential_templates');
  }
};