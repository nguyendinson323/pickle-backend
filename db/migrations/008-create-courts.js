'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('courts', {
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
      owner_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        validate: {
          isIn: [['club', 'partner']]
        }
      },
      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      state_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'states',
          key: 'id'
        }
      },
      court_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      surface_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      indoor: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      lights: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      amenities: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'active',
        validate: {
          isIn: [['active', 'maintenance', 'inactive']]
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
    await queryInterface.addIndex('courts', ['state_id']);
    await queryInterface.addIndex('courts', ['owner_type', 'owner_id']);
    await queryInterface.addIndex('courts', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('courts');
  }
};