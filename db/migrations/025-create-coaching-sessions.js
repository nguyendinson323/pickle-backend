'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('coaching_sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      coach_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'coaches',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'players',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      session_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      court_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'courts',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'scheduled',
        validate: {
          isIn: [['scheduled', 'completed', 'canceled']]
        }
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      payment_status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: [['pending', 'paid', 'refunded']]
        }
      },
      stripe_payment_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
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
    await queryInterface.addIndex('coaching_sessions', ['coach_id']);
    await queryInterface.addIndex('coaching_sessions', ['player_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('coaching_sessions');
  }
};