'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('coach_availability', [
      // Miguel Ángel Fernández Castro (Coach ID 1) - Regular schedule
      {
        coach_id: 1,
        day_of_week: 1, // Monday
        start_time: '08:00:00',
        end_time: '12:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 1,
        day_of_week: 1, // Monday
        start_time: '16:00:00',
        end_time: '20:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 1,
        day_of_week: 2, // Tuesday
        start_time: '09:00:00',
        end_time: '13:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 1,
        day_of_week: 3, // Wednesday
        start_time: '08:00:00',
        end_time: '12:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 1,
        day_of_week: 3, // Wednesday
        start_time: '15:00:00',
        end_time: '19:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 1,
        day_of_week: 4, // Thursday
        start_time: '10:00:00',
        end_time: '14:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 1,
        day_of_week: 5, // Friday
        start_time: '08:00:00',
        end_time: '12:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 1,
        day_of_week: 6, // Saturday
        start_time: '07:00:00',
        end_time: '15:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 1,
        day_of_week: 0, // Sunday
        start_time: '09:00:00',
        end_time: '13:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      
      // Sofía Isabel Ramírez Mendoza (Coach ID 2) - Regular schedule
      {
        coach_id: 2,
        day_of_week: 1, // Monday
        start_time: '14:00:00',
        end_time: '18:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 2,
        day_of_week: 2, // Tuesday
        start_time: '07:00:00',
        end_time: '11:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 2,
        day_of_week: 2, // Tuesday
        start_time: '16:00:00',
        end_time: '20:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 2,
        day_of_week: 3, // Wednesday
        start_time: '09:00:00',
        end_time: '13:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 2,
        day_of_week: 4, // Thursday
        start_time: '15:00:00',
        end_time: '19:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 2,
        day_of_week: 5, // Friday
        start_time: '08:00:00',
        end_time: '12:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 2,
        day_of_week: 5, // Friday
        start_time: '14:00:00',
        end_time: '18:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 2,
        day_of_week: 6, // Saturday
        start_time: '06:00:00',
        end_time: '14:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      {
        coach_id: 2,
        day_of_week: 0, // Sunday
        start_time: '10:00:00',
        end_time: '16:00:00',
        is_recurring: true,
        specific_date: null,
        created_at: new Date()
      },
      
      // Special non-recurring schedules
      {
        coach_id: 1,
        day_of_week: 6, // Special Saturday
        start_time: '18:00:00',
        end_time: '21:00:00',
        is_recurring: false,
        specific_date: '2024-03-02',
        created_at: new Date()
      },
      {
        coach_id: 2,
        day_of_week: 0, // Special Sunday
        start_time: '17:00:00',
        end_time: '20:00:00',
        is_recurring: false,
        specific_date: '2024-02-25',
        created_at: new Date()
      },
      {
        coach_id: 1,
        day_of_week: 5, // Special Friday - extended schedule
        start_time: '18:00:00',
        end_time: '22:00:00',
        is_recurring: false,
        specific_date: '2024-03-08',
        created_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('coach_availability', null, {});
  }
};