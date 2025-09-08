'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tournament_matches', [
      // Completed matches from Opening Cup Guadalajara Club (tournament_id: 7) - COMPLETED
      {
        tournament_id: 7,
        category_id: 21, // Opening Mixed Doubles A
        round: 1,
        match_number: 1,
        court_id: 2, // Centro Deportivo Guadalajara
        match_date: '2024-01-27',
        match_time: '09:00:00',
        player1_id: 1, // María González
        player2_id: 2, // Carlos Rodríguez (partner)
        player3_id: 3, // Ana Martínez
        player4_id: null, // Solo player
        score: '11-6, 11-8',
        winner_side: 1,
        status: 'completed',
        referee_id: 1, // Miguel Fernández
        created_at: new Date('2024-01-25 10:00:00'),
        updated_at: new Date('2024-01-27 10:30:00')
      },
      {
        tournament_id: 7,
        category_id: 22, // Opening Mixed Doubles B
        round: 1,
        match_number: 1,
        court_id: 2, // Centro Deportivo Guadalajara
        match_date: '2024-01-28',
        match_time: '10:30:00',
        player1_id: 3, // Ana Martínez
        player2_id: null,
        player3_id: 1, // María González
        player4_id: null,
        score: '9-11, 11-7, 11-9',
        winner_side: 1,
        status: 'completed',
        referee_id: 2, // Sofía Ramírez
        created_at: new Date('2024-01-25 10:30:00'),
        updated_at: new Date('2024-01-28 11:45:00')
      },
      {
        tournament_id: 7,
        category_id: 21, // Opening Mixed Doubles A - Finals
        round: 2,
        match_number: 1,
        court_id: 2,
        match_date: '2024-01-28',
        match_time: '15:00:00',
        player1_id: 1, // María González
        player2_id: 2, // Carlos Rodríguez
        player3_id: 3, // Ana Martínez (reached finals)
        player4_id: null,
        score: '11-4, 11-6',
        winner_side: 1,
        status: 'completed',
        referee_id: 1, // Miguel Fernández
        created_at: new Date('2024-01-25 11:00:00'),
        updated_at: new Date('2024-01-28 16:15:00')
      },

      // Completed matches from Winter Cup Mexico City 2024 (tournament_id: 10) - COMPLETED
      {
        tournament_id: 10,
        category_id: 26, // Winter Open Mixed
        round: 1,
        match_number: 1,
        court_id: 1, // Canchas Club Azteca
        match_date: '2024-01-20',
        match_time: '09:00:00',
        player1_id: 2, // Carlos Rodríguez
        player2_id: 3, // Ana Martínez (partner)
        player3_id: 1, // María González
        player4_id: null, // Solo
        score: '11-9, 6-11, 11-8',
        winner_side: 1,
        status: 'completed',
        referee_id: 1, // Miguel Fernández
        created_at: new Date('2024-01-18 14:00:00'),
        updated_at: new Date('2024-01-20 10:45:00')
      },
      {
        tournament_id: 10,
        category_id: 26, // Winter Open Mixed - Semifinals
        round: 2,
        match_number: 1,
        court_id: 1,
        match_date: '2024-01-21',
        match_time: '11:00:00',
        player1_id: 1, // María González
        player2_id: null,
        player3_id: 2, // Carlos Rodríguez
        player4_id: 3, // Ana Martínez
        score: '8-11, 11-9, 11-7',
        winner_side: 2,
        status: 'completed',
        referee_id: 2, // Sofía Ramírez
        created_at: new Date('2024-01-18 14:30:00'),
        updated_at: new Date('2024-01-21 12:30:00')
      },

      // Ongoing matches from Club Azteca Internal Tournament (tournament_id: 6) - ONGOING
      {
        tournament_id: 6,
        category_id: 17, // Members Mixed Doubles
        round: 1,
        match_number: 1,
        court_id: 1, // Canchas Club Azteca
        match_date: '2024-02-17',
        match_time: '10:00:00',
        player1_id: 1, // María González
        player2_id: 2, // Carlos Rodríguez
        player3_id: 3, // Ana Martínez
        player4_id: null,
        score: null,
        winner_side: null,
        status: 'scheduled',
        referee_id: 1,
        created_at: new Date('2024-02-14 16:00:00'),
        updated_at: new Date('2024-02-14 16:00:00')
      },
      {
        tournament_id: 6,
        category_id: 17, // Members Mixed Doubles
        round: 1,
        match_number: 2,
        court_id: 1,
        match_date: '2024-02-17',
        match_time: '11:30:00',
        player1_id: 2, // Carlos Rodríguez (different pairing)
        player2_id: null,
        player3_id: 1, // María González
        player4_id: 3, // Ana Martínez
        score: null,
        winner_side: null,
        status: 'scheduled',
        referee_id: 1, // Miguel Fernández
        created_at: new Date('2024-02-14 16:30:00'),
        updated_at: new Date('2024-02-14 16:30:00')
      },

      // Scheduled matches for upcoming tournaments
      // Abierto de Pickleball Ciudad de México 2024 (tournament_id: 3)
      {
        tournament_id: 3,
        category_id: 10, // Open Men's Doubles
        round: 1,
        match_number: 1,
        court_id: 1, // Canchas Club Azteca
        match_date: '2024-02-24',
        match_time: '09:00:00',
        player1_id: 2, // Carlos Rodríguez
        player2_id: null,
        player3_id: 1, // María González (for testing mixed gender)
        player4_id: null,
        score: null,
        winner_side: null,
        status: 'scheduled',
        referee_id: 1, // Miguel Fernández
        created_at: new Date('2024-02-14 18:00:00'),
        updated_at: new Date('2024-02-14 18:00:00')
      },
      {
        tournament_id: 3,
        category_id: 11, // Open Women's Doubles
        round: 1,
        match_number: 1,
        court_id: 1,
        match_date: '2024-02-24',
        match_time: '10:30:00',
        player1_id: 1, // María González
        player2_id: 3, // Ana Martínez
        player3_id: 2, // Carlos Rodríguez (for testing)
        player4_id: null,
        score: null,
        winner_side: null,
        status: 'scheduled',
        referee_id: 2, // Sofía Ramírez
        created_at: new Date('2024-02-14 18:30:00'),
        updated_at: new Date('2024-02-14 18:30:00')
      },

      // Jalisco Pickleball Cup (tournament_id: 4) - Future scheduled
      {
        tournament_id: 4,
        category_id: 13, // Advanced Men's Doubles
        round: 1,
        match_number: 1,
        court_id: 2, // Centro Deportivo Guadalajara
        match_date: '2024-03-02',
        match_time: '09:00:00',
        player1_id: 2, // Carlos Rodríguez
        player2_id: null,
        player3_id: 1, // María González (testing)
        player4_id: null,
        score: null,
        winner_side: null,
        status: 'scheduled',
        referee_id: 2, // Sofía Ramírez
        created_at: new Date('2024-02-14 19:00:00'),
        updated_at: new Date('2024-02-14 19:00:00')
      },
      {
        tournament_id: 4,
        category_id: 15, // Intermediate Mixed Doubles
        round: 1,
        match_number: 1,
        court_id: 2,
        match_date: '2024-03-03',
        match_time: '14:00:00',
        player1_id: 3, // Ana Martínez
        player2_id: 2, // Carlos Rodríguez
        player3_id: 1, // María González
        player4_id: null,
        score: null,
        winner_side: null,
        status: 'scheduled',
        referee_id: 1, // Miguel Fernández
        created_at: new Date('2024-02-14 19:30:00'),
        updated_at: new Date('2024-02-14 19:30:00')
      },

      // National Championship scheduled matches (tournament_id: 1)
      {
        tournament_id: 1,
        category_id: 1, // Men's Singles Open
        round: 1,
        match_number: 1,
        court_id: 1,
        match_date: '2024-03-15',
        match_time: '09:00:00',
        player1_id: 2, // Carlos Rodríguez
        player2_id: null, // Singles
        player3_id: 1, // María González (testing cross-gender)
        player4_id: null, // Singles
        score: null,
        winner_side: null,
        status: 'scheduled',
        referee_id: 2,
        created_at: new Date('2024-02-14 20:00:00'),
        updated_at: new Date('2024-02-14 20:00:00')
      },
      {
        tournament_id: 1,
        category_id: 5, // Mixed Doubles Open
        round: 1,
        match_number: 1,
        court_id: 1,
        match_date: '2024-03-16',
        match_time: '11:00:00',
        player1_id: 1, // María González
        player2_id: 2, // Carlos Rodríguez
        player3_id: 3, // Ana Martínez
        player4_id: null, // Looking for partner
        score: null,
        winner_side: null,
        status: 'scheduled',
        referee_id: 1,
        created_at: new Date('2024-02-14 20:30:00'),
        updated_at: new Date('2024-02-14 20:30:00')
      },

      // Walkover example
      {
        tournament_id: 7,
        category_id: 22, // Opening Mixed Doubles B
        round: 1,
        match_number: 2,
        court_id: 2,
        match_date: '2024-01-28',
        match_time: '12:00:00',
        player1_id: 2, // Carlos Rodríguez
        player2_id: null,
        player3_id: 3, // Ana Martínez (no-show)
        player4_id: null,
        score: 'W.O.',
        winner_side: 1,
        status: 'walkover',
        referee_id: 1,
        created_at: new Date('2024-01-25 12:00:00'),
        updated_at: new Date('2024-01-28 12:05:00')
      },

      // Canceled match example
      {
        tournament_id: 6,
        category_id: 17, // Members Mixed Doubles
        round: 1,
        match_number: 3,
        court_id: 1,
        match_date: '2024-02-17',
        match_time: '13:00:00',
        player1_id: 1, // María González
        player2_id: null,
        player3_id: 2, // Carlos Rodríguez
        player4_id: null,
        score: null,
        winner_side: null,
        status: 'canceled',
        referee_id: 1,
        created_at: new Date('2024-02-14 17:00:00'),
        updated_at: new Date('2024-02-15 09:30:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tournament_matches', null, {});
  }
};