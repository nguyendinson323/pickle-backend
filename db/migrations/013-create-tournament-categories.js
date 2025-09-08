'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tournament_categories', {
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
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      min_age: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      max_age: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      gender: {
        type: Sequelize.STRING(10),
        allowNull: true,
        validate: {
          isIn: [['Male', 'Female', 'Mixed']]
        }
      },
      min_skill_level: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: true
      },
      max_skill_level: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: true
      },
      format: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      max_participants: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('tournament_categories', ['tournament_id']);
    await queryInterface.addIndex('tournament_categories', ['gender']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tournament_categories');
  }
};