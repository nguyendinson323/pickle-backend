'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('partners', {
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
      business_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      rfc: {
        type: Sequelize.STRING(13),
        allowNull: true
      },
      contact_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      contact_title: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      partner_type: {
        type: Sequelize.STRING(50),
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
    await queryInterface.addIndex('partners', ['user_id']);
    await queryInterface.addIndex('partners', ['state_id']);
    await queryInterface.addIndex('partners', ['partner_type']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('partners');
  }
};