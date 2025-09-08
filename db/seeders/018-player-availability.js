'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('player_availability', [
      // María González availability (player_id: 1)
      { player_id: 1, day_of_week: 1, start_time: '18:00:00', end_time: '21:00:00', is_recurring: true, specific_date: null, created_at: new Date() }, // Monday
      { player_id: 1, day_of_week: 3, start_time: '18:00:00', end_time: '21:00:00', is_recurring: true, specific_date: null, created_at: new Date() }, // Wednesday
      { player_id: 1, day_of_week: 6, start_time: '08:00:00', end_time: '12:00:00', is_recurring: true, specific_date: null, created_at: new Date() }, // Saturday
      { player_id: 1, day_of_week: 0, start_time: '09:00:00', end_time: '13:00:00', is_recurring: true, specific_date: null, created_at: new Date() }, // Sunday
      
      // Carlos Rodríguez availability (player_id: 2)
      { player_id: 2, day_of_week: 2, start_time: '17:30:00', end_time: '20:30:00', is_recurring: true, specific_date: null, created_at: new Date() }, // Tuesday
      { player_id: 2, day_of_week: 4, start_time: '17:30:00', end_time: '20:30:00', is_recurring: true, specific_date: null, created_at: new Date() }, // Thursday
      { player_id: 2, day_of_week: 6, start_time: '10:00:00', end_time: '14:00:00', is_recurring: true, specific_date: null, created_at: new Date() }, // Saturday
      
      // Ana Martínez availability (player_id: 3)
      { player_id: 3, day_of_week: 1, start_time: '19:00:00', end_time: '22:00:00', is_recurring: true, specific_date: null, created_at: new Date() }, // Monday
      { player_id: 3, day_of_week: 5, start_time: '17:00:00', end_time: '20:00:00', is_recurring: true, specific_date: null, created_at: new Date() }, // Friday
      { player_id: 3, day_of_week: 0, start_time: '16:00:00', end_time: '19:00:00', is_recurring: true, specific_date: null, created_at: new Date() }, // Sunday
      
      // Specific date availability examples
      { player_id: 1, day_of_week: 2, start_time: '15:00:00', end_time: '18:00:00', is_recurring: false, specific_date: '2024-02-20', created_at: new Date() }, // Special Tuesday
      { player_id: 2, day_of_week: 0, start_time: '07:00:00', end_time: '10:00:00', is_recurring: false, specific_date: '2024-02-25', created_at: new Date() } // Early Sunday
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('player_availability', null, {});
  }
};