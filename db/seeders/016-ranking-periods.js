'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ranking_periods', [
      // 2023 periods (completed)
      {
        name: '2023 Season - First Semester',
        start_date: '2023-01-01',
        end_date: '2023-06-30',
        is_active: false,
        created_at: new Date('2023-01-01 00:00:00')
      },
      {
        name: '2023 Season - Second Semester',
        start_date: '2023-07-01',
        end_date: '2023-12-31',
        is_active: false,
        created_at: new Date('2023-07-01 00:00:00')
      },
      // 2024 periods (current)
      {
        name: '2024 Season - First Quarter',
        start_date: '2024-01-01',
        end_date: '2024-03-31',
        is_active: true,
        created_at: new Date('2024-01-01 00:00:00')
      },
      {
        name: '2024 Season - Second Quarter',
        start_date: '2024-04-01',
        end_date: '2024-06-30',
        is_active: false,
        created_at: new Date('2024-01-15 00:00:00')
      },
      {
        name: '2024 Season - Third Quarter',
        start_date: '2024-07-01',
        end_date: '2024-09-30',
        is_active: false,
        created_at: new Date('2024-01-15 00:00:00')
      },
      {
        name: '2024 Season - Fourth Quarter',
        start_date: '2024-10-01',
        end_date: '2024-12-31',
        is_active: false,
        created_at: new Date('2024-01-15 00:00:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ranking_periods', null, {});
  }
};