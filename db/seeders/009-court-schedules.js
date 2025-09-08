'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('court_schedules', [
      // Schedule for Club Azteca Courts - Polanco (court_id: 1)
      // Monday to Friday 6:00 - 22:00
      {
        court_id: 1,
        day_of_week: 1, // Monday
        open_time: '06:00:00',
        close_time: '22:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 1,
        day_of_week: 2, // Tuesday
        open_time: '06:00:00',
        close_time: '22:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 1,
        day_of_week: 3, // Wednesday
        open_time: '06:00:00',
        close_time: '22:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 1,
        day_of_week: 4, // Thursday
        open_time: '06:00:00',
        close_time: '22:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 1,
        day_of_week: 5, // Friday
        open_time: '06:00:00',
        close_time: '22:00:00',
        is_closed: false,
        created_at: new Date()
      },
      // Weekend schedule
      {
        court_id: 1,
        day_of_week: 6, // Saturday
        open_time: '07:00:00',
        close_time: '21:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 1,
        day_of_week: 0, // Sunday
        open_time: '08:00:00',
        close_time: '20:00:00',
        is_closed: false,
        created_at: new Date()
      },

      // Schedule for Guadalajara Sports Center (court_id: 2)
      // Daily 5:30 - 23:00
      {
        court_id: 2,
        day_of_week: 1, // Monday
        open_time: '05:30:00',
        close_time: '23:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 2,
        day_of_week: 2, // Tuesday
        open_time: '05:30:00',
        close_time: '23:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 2,
        day_of_week: 3, // Wednesday
        open_time: '05:30:00',
        close_time: '23:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 2,
        day_of_week: 4, // Thursday
        open_time: '05:30:00',
        close_time: '23:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 2,
        day_of_week: 5, // Friday
        open_time: '05:30:00',
        close_time: '23:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 2,
        day_of_week: 6, // Saturday
        open_time: '06:00:00',
        close_time: '22:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 2,
        day_of_week: 0, // Sunday
        open_time: '07:00:00',
        close_time: '21:00:00',
        is_closed: false,
        created_at: new Date()
      },

      // Schedule for Monterrey Pickleball Facilities (court_id: 3) - Indoor facility
      // Monday to Sunday 5:00 - 24:00 (extended hours)
      {
        court_id: 3,
        day_of_week: 1, // Monday
        open_time: '05:00:00',
        close_time: '23:59:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 3,
        day_of_week: 2, // Tuesday
        open_time: '05:00:00',
        close_time: '23:59:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 3,
        day_of_week: 3, // Wednesday
        open_time: '05:00:00',
        close_time: '23:59:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 3,
        day_of_week: 4, // Thursday
        open_time: '05:00:00',
        close_time: '23:59:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 3,
        day_of_week: 5, // Friday
        open_time: '05:00:00',
        close_time: '23:59:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 3,
        day_of_week: 6, // Saturday
        open_time: '06:00:00',
        close_time: '23:59:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 3,
        day_of_week: 0, // Sunday
        open_time: '07:00:00',
        close_time: '22:00:00',
        is_closed: false,
        created_at: new Date()
      },

      // Schedule for Resort Riviera Maya (court_id: 4) - Resort hours
      // Daily 7:00 - 20:00 (daylight only for resort guests)
      {
        court_id: 4,
        day_of_week: 1, // Monday
        open_time: '07:00:00',
        close_time: '20:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 4,
        day_of_week: 2, // Tuesday
        open_time: '07:00:00',
        close_time: '20:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 4,
        day_of_week: 3, // Wednesday
        open_time: '07:00:00',
        close_time: '20:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 4,
        day_of_week: 4, // Thursday
        open_time: '07:00:00',
        close_time: '20:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 4,
        day_of_week: 5, // Friday
        open_time: '07:00:00',
        close_time: '20:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 4,
        day_of_week: 6, // Saturday
        open_time: '07:00:00',
        close_time: '20:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 4,
        day_of_week: 0, // Sunday
        open_time: '07:00:00',
        close_time: '20:00:00',
        is_closed: false,
        created_at: new Date()
      },

      // Schedule for Grupo Cancún Sports Center (court_id: 5)
      // Typical hotel schedule with siesta break
      {
        court_id: 5,
        day_of_week: 1, // Monday
        open_time: '06:00:00',
        close_time: '21:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 5,
        day_of_week: 2, // Tuesday
        open_time: '06:00:00',
        close_time: '21:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 5,
        day_of_week: 3, // Wednesday
        open_time: '06:00:00',
        close_time: '21:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 5,
        day_of_week: 4, // Thursday
        open_time: '06:00:00',
        close_time: '21:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 5,
        day_of_week: 5, // Friday
        open_time: '06:00:00',
        close_time: '21:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 5,
        day_of_week: 6, // Saturday
        open_time: '06:00:00',
        close_time: '21:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 5,
        day_of_week: 0, // Sunday
        open_time: '07:00:00',
        close_time: '20:00:00',
        is_closed: false,
        created_at: new Date()
      },

      // Schedule for Academia La Loma Sports Center (court_id: 6)
      // Professional training hours
      {
        court_id: 6,
        day_of_week: 1, // Monday
        open_time: '05:00:00',
        close_time: '22:30:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 6,
        day_of_week: 2, // Tuesday
        open_time: '05:00:00',
        close_time: '22:30:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 6,
        day_of_week: 3, // Wednesday
        open_time: '05:00:00',
        close_time: '22:30:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 6,
        day_of_week: 4, // Thursday
        open_time: '05:00:00',
        close_time: '22:30:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 6,
        day_of_week: 5, // Friday
        open_time: '05:00:00',
        close_time: '22:30:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 6,
        day_of_week: 6, // Saturday
        open_time: '06:00:00',
        close_time: '21:00:00',
        is_closed: false,
        created_at: new Date()
      },
      {
        court_id: 6,
        day_of_week: 0, // Sunday - Closed
        open_time: '08:00:00',
        close_time: '18:00:00',
        is_closed: true,
        created_at: new Date()
      },

      // Schedule for León Academy Courts - Under Renovation (court_id: 9) - CLOSED for maintenance
      {
        court_id: 9,
        day_of_week: 1, // Monday - Closed for renovation
        open_time: '00:00:00',
        close_time: '00:00:00',
        is_closed: true,
        created_at: new Date()
      },
      {
        court_id: 9,
        day_of_week: 2, // Tuesday - Closed for renovation
        open_time: '00:00:00',
        close_time: '00:00:00',
        is_closed: true,
        created_at: new Date()
      },
      {
        court_id: 9,
        day_of_week: 3, // Wednesday - Closed for renovation
        open_time: '00:00:00',
        close_time: '00:00:00',
        is_closed: true,
        created_at: new Date()
      },
      {
        court_id: 9,
        day_of_week: 4, // Thursday - Closed for renovation
        open_time: '00:00:00',
        close_time: '00:00:00',
        is_closed: true,
        created_at: new Date()
      },
      {
        court_id: 9,
        day_of_week: 5, // Friday - Closed for renovation
        open_time: '00:00:00',
        close_time: '00:00:00',
        is_closed: true,
        created_at: new Date()
      },
      {
        court_id: 9,
        day_of_week: 6, // Saturday - Closed for renovation
        open_time: '00:00:00',
        close_time: '00:00:00',
        is_closed: true,
        created_at: new Date()
      },
      {
        court_id: 9,
        day_of_week: 0, // Sunday - Closed for renovation
        open_time: '00:00:00',
        close_time: '00:00:00',
        is_closed: true,
        created_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('court_schedules', null, {});
  }
};