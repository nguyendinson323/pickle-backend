'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('players', {
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
      full_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      gender: {
        type: Sequelize.STRING(10),
        allowNull: true,
        validate: {
          isIn: [['Male', 'Female', 'Other']]
        }
      },
      state_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'states',
          key: 'id'
        }
      },
      curp: {
        type: Sequelize.STRING(18),
        allowNull: true,
        unique: true
      },
      nrtp_level: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: true,
        validate: {
          min: 1.0,
          max: 5.0
        }
      },
      profile_photo_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      id_document_url: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      nationality: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'Mexico'
      },
      club_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      ranking_position: {
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex('players', ['user_id']);
    await queryInterface.addIndex('players', ['state_id']);
    await queryInterface.addIndex('players', ['club_id']);
    await queryInterface.addIndex('players', ['curp'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('players');
  }
};