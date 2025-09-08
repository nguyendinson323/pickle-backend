'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscription_plans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      for_role: {
        type: Sequelize.STRING(20),
        allowNull: false,
        validate: {
          isIn: [['player', 'coach', 'club', 'partner']]
        }
      },
      monthly_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      yearly_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      features: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('subscription_plans');
  }
};