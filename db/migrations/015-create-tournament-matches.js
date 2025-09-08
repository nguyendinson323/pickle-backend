'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tournament_matches', {
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
      round: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      match_number: {
        type: Sequelize.INTEGER,
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
      match_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      match_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      player1_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'players',
          key: 'id'
        }
      },
      player2_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'players',
          key: 'id'
        }
      },
      player3_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'players',
          key: 'id'
        }
      },
      player4_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'players',
          key: 'id'
        }
      },
      score: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      winner_side: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          isIn: [[1, 2]]
        }
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'scheduled',
        validate: {
          isIn: [['scheduled', 'in_progress', 'completed', 'walkover', 'canceled']]
        }
      },
      referee_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'coaches',
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
    await queryInterface.addIndex('tournament_matches', ['tournament_id']);
    await queryInterface.addIndex('tournament_matches', ['category_id']);
    await queryInterface.addIndex('tournament_matches', ['court_id']);
    await queryInterface.addIndex('tournament_matches', ['match_date']);
    await queryInterface.addIndex('tournament_matches', ['status']);

    // Add unique constraint
    await queryInterface.addIndex('tournament_matches', ['tournament_id', 'category_id', 'round', 'match_number'], {
      unique: true,
      name: 'unique_match'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tournament_matches');
  }
};