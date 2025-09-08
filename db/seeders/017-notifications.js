'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('notifications', [
      // Tournament notifications
      {
        user_id: 2, // María González
        title: 'Registration Confirmed - National Championship',
        content: 'Your registration for the Mexico National Pickleball Championship 2024 has been confirmed. The competition starts on March 15th.',
        notification_type: 'Tournament',
        is_read: false,
        read_at: null,
        action_url: '/tournaments/1',
        created_at: new Date('2024-02-10 15:30:00')
      },
      {
        user_id: 3, // Carlos Rodríguez
        title: 'Upcoming Match - Club Azteca',
        content: 'Reminder: You have a match scheduled tomorrow at 10:00 AM on the Club Azteca courts.',
        notification_type: 'Match',
        is_read: true,
        read_at: new Date('2024-02-14 08:30:00'),
        action_url: '/matches/1',
        created_at: new Date('2024-02-16 20:00:00')
      },
      {
        user_id: 4, // Ana Martínez
        title: 'Pending Payment - Mexico City Tournament',
        content: 'Your registration for the Mexico City Pickleball Open is pending payment. You have until February 18th to complete it.',
        notification_type: 'Payment',
        is_read: false,
        read_at: null,
        action_url: '/payments/tournament/3',
        created_at: new Date('2024-02-14 12:00:00')
      },
      // System notifications
      {
        user_id: 2,
        title: 'Ranking Update',
        content: 'Your position in the national ranking has been updated. You moved up 3 positions!',
        notification_type: 'Ranking',
        is_read: false,
        read_at: null,
        action_url: '/rankings/player/2',
        created_at: new Date('2024-02-13 16:45:00')
      },
      {
        user_id: 7, // Club Azteca
        title: 'Scheduled Court Maintenance',
        content: 'Court maintenance has been scheduled for March 1st to 2nd. Reservations will be automatically relocated.',
        notification_type: 'System',
        is_read: true,
        read_at: new Date('2024-02-14 10:15:00'),
        action_url: '/maintenance/courts',
        created_at: new Date('2024-02-14 09:00:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('notifications', null, {});
  }
};