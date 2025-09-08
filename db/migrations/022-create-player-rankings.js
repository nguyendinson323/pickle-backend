'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('player_rankings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      period_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ranking_periods',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ranking_categories',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      tournaments_played: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      current_rank: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      previous_rank: {
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex('player_rankings', ['player_id']);
    await queryInterface.addIndex('player_rankings', ['period_id']);
    
    // Add unique constraint for player_id, period_id, category_id
    await queryInterface.addIndex('player_rankings', ['player_id', 'period_id', 'category_id'], { 
      unique: true, 
      name: 'unique_player_ranking' 
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('player_rankings');
  }
};