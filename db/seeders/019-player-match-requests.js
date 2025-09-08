'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('player_match_requests', [
      // Pending requests
      {
        requester_id: 1, // María González
        receiver_id: 2, // Carlos Rodríguez
        preferred_date: '2024-02-18',
        preferred_time: '18:30:00',
        message: 'Hi Carlos, would you like to play on Sunday? I have availability in the afternoon.',
        status: 'pending',
        response_message: null,
        court_id: 1, // Canchas Club Azteca
        created_at: new Date('2024-02-14 14:20:00'),
        updated_at: new Date('2024-02-14 14:20:00')
      },
      {
        requester_id: 3, // Ana Martínez
        receiver_id: 1, // María González
        preferred_date: '2024-02-19',
        preferred_time: '19:00:00',
        message: 'Maria, could we play on Monday? I need to practice for the Mexico City tournament.',
        status: 'pending',
        response_message: null,
        court_id: null, // No court specified
        created_at: new Date('2024-02-14 16:45:00'),
        updated_at: new Date('2024-02-14 16:45:00')
      },
      
      // Accepted requests
      {
        requester_id: 2, // Carlos Rodríguez
        receiver_id: 3, // Ana Martínez
        preferred_date: '2024-02-17',
        preferred_time: '10:00:00',
        message: 'Ana, do you want to practice doubles this Saturday in Monterrey?',
        status: 'accepted',
        response_message: 'Perfect Carlos, see you there. Thanks for the invitation!',
        court_id: 3, // Instalaciones Monterrey Pickleball
        created_at: new Date('2024-02-12 11:30:00'),
        updated_at: new Date('2024-02-13 09:15:00')
      },
      {
        requester_id: 1, // María González
        receiver_id: 3, // Ana Martínez
        preferred_date: '2024-02-20',
        preferred_time: '18:00:00',
        message: 'Ana, are you interested in forming a doubles team to practice?',
        status: 'accepted',
        response_message: 'Yes! I love the idea, we can train together.',
        court_id: 2, // Centro Deportivo Guadalajara
        created_at: new Date('2024-02-11 15:00:00'),
        updated_at: new Date('2024-02-12 08:30:00')
      },
      
      // Rejected requests
      {
        requester_id: 3, // Ana Martínez
        receiver_id: 2, // Carlos Rodríguez
        preferred_date: '2024-02-15',
        preferred_time: '20:00:00',
        message: 'Carlos, can you play tomorrow night?',
        status: 'rejected',
        response_message: 'Sorry Ana, I have family commitments tomorrow. How about the weekend?',
        court_id: null,
        created_at: new Date('2024-02-14 13:45:00'),
        updated_at: new Date('2024-02-14 17:20:00')
      },
      
      // Canceled requests
      {
        requester_id: 2, // Carlos Rodríguez
        receiver_id: 1, // María González
        preferred_date: '2024-02-16',
        preferred_time: '17:00:00',
        message: 'Maria, shall we play today?',
        status: 'canceled',
        response_message: null,
        court_id: 1,
        created_at: new Date('2024-02-16 08:00:00'),
        updated_at: new Date('2024-02-16 14:30:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('player_match_requests', null, {});
  }
};