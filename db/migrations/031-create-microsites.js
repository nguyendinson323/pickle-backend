'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('microsites', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      owner_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        validate: {
          isIn: [['state', 'club', 'partner']]
        }
      },
      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      template_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'microsite_templates',
          key: 'id'
        }
      },
      subdomain: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      logo_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      banner_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      primary_color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        defaultValue: '#000000'
      },
      secondary_color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        defaultValue: '#FFFFFF'
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

    // Add indexes
    await queryInterface.addIndex('microsites', ['owner_type', 'owner_id']);
    await queryInterface.addIndex('microsites', ['is_active']);
    await queryInterface.addIndex('microsites', ['subdomain'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('microsites');
  }
};