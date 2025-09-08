'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clubs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      rfc: {
        type: Sequelize.STRING(13),
        allowNull: true
      },
      manager_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      manager_title: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      state_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'states',
          key: 'id'
        }
      },
      club_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      website: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      social_media: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      logo_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      has_courts: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      premium_expires_at: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      affiliation_expires_at: {
        type: Sequelize.DATEONLY,
        allowNull: true
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
    await queryInterface.addIndex('clubs', ['user_id']);
    await queryInterface.addIndex('clubs', ['state_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('clubs');
  }
};