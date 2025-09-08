'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tournaments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tournament_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      organizer_type: {
        type: Sequelize.STRING(20),
        allowNull: true,
        validate: {
          isIn: [['federation', 'state', 'club', 'partner']]
        }
      },
      organizer_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      state_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'states',
          key: 'id'
        }
      },
      venue_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      venue_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      registration_start: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      registration_end: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      entry_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      max_participants: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'upcoming',
        validate: {
          isIn: [['upcoming', 'ongoing', 'completed', 'canceled']]
        }
      },
      banner_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      is_ranking: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      ranking_multiplier: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: false,
        defaultValue: 1.0
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
    await queryInterface.addIndex('tournaments', ['state_id']);
    await queryInterface.addIndex('tournaments', ['organizer_type', 'organizer_id']);
    await queryInterface.addIndex('tournaments', ['status']);
    await queryInterface.addIndex('tournaments', ['start_date']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tournaments');
  }
};