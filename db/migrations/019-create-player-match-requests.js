'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('player_match_requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      requester_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'players',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      receiver_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'players',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      preferred_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      preferred_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: [['pending', 'accepted', 'rejected', 'canceled']]
        }
      },
      response_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      court_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'courts',
          key: 'id'
        }
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
    await queryInterface.addIndex('player_match_requests', ['requester_id']);
    await queryInterface.addIndex('player_match_requests', ['receiver_id']);
    await queryInterface.addIndex('player_match_requests', ['status']);
    await queryInterface.addIndex('player_match_requests', ['preferred_date']);
    await queryInterface.addIndex('player_match_requests', ['court_id']);

    // Add check constraint to ensure different players
    await queryInterface.addConstraint('player_match_requests', {
      fields: ['requester_id', 'receiver_id'],
      type: 'check',
      name: 'different_players',
      where: Sequelize.literal('requester_id <> receiver_id')
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('player_match_requests');
  }
};