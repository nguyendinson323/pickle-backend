'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('state_microsites', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      state_committee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'state_committees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      mission_statement: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      contact_email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      contact_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      website_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      facebook_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      twitter_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      instagram_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      logo_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      banner_image_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      established_year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      custom_content: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex('state_microsites', ['state_committee_id'], { unique: true });
    await queryInterface.addIndex('state_microsites', ['is_public']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('state_microsites');
  }
};