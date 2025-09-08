'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tournament_registrations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tournament_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tournaments',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tournament_categories',
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
      partner_player_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'players',
          key: 'id'
        }
      },
      registration_date: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      payment_status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: [['pending', 'paid', 'refunded']]
        }
      },
      amount_paid: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      stripe_payment_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'registered',
        validate: {
          isIn: [['registered', 'confirmed', 'waitlisted', 'withdrawn']]
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
    await queryInterface.addIndex('tournament_registrations', ['tournament_id']);
    await queryInterface.addIndex('tournament_registrations', ['category_id']);
    await queryInterface.addIndex('tournament_registrations', ['player_id']);
    await queryInterface.addIndex('tournament_registrations', ['partner_player_id']);
    await queryInterface.addIndex('tournament_registrations', ['payment_status']);
    await queryInterface.addIndex('tournament_registrations', ['status']);

    // Add unique constraint
    await queryInterface.addIndex('tournament_registrations', ['tournament_id', 'category_id', 'player_id'], {
      unique: true,
      name: 'unique_registration'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tournament_registrations');
  }
};