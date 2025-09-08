'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ranking_points_history', [
      // María González (Player ID 1) - Points from completed tournaments
      {
        player_id: 1,
        tournament_id: 7, // Opening Cup Guadalajara Club (completed)
        category_id: 21, // Opening Mixed Doubles A
        points: 180,
        reason: 'Semifinalist - 3rd place',
        created_at: new Date('2024-01-28')
      },
      {
        player_id: 1,
        tournament_id: 10, // Winter Cup Mexico City 2024 (completed)
        category_id: 27, // Winter Open Mixed
        points: 280,
        reason: 'Finalist - 2nd place',
        created_at: new Date('2024-01-21')
      },
      {
        player_id: 1,
        tournament_id: 6, // Club Azteca Internal Tournament (ongoing)
        category_id: 20, // Members Mixed Doubles
        points: 120,
        reason: 'Quarterfinals',
        created_at: new Date('2024-02-17')
      },
      
      // Carlos Rodríguez (Player ID 2) - Strong performance history
      {
        player_id: 2,
        tournament_id: 7, // Opening Cup Guadalajara Club (completed)
        category_id: 21, // Opening Mixed Doubles A
        points: 350,
        reason: 'Champion - 1st place',
        created_at: new Date('2024-01-28')
      },
      {
        player_id: 2,
        tournament_id: 10, // Winter Cup Mexico City 2024 (completed)
        category_id: 27, // Winter Open Mixed
        points: 380,
        reason: 'Champion - 1st place',
        created_at: new Date('2024-01-21')
      },
      {
        player_id: 2,
        tournament_id: 3, // Mexico City Pickleball Open 2024
        category_id: 11, // Open Men's Doubles
        points: 420,
        reason: 'Preliminary classification',
        created_at: new Date('2024-02-25')
      },
      {
        player_id: 2,
        tournament_id: 4, // Jalisco Pickleball Cup
        category_id: 14, // Advanced Men's Doubles
        points: 290,
        reason: 'Quarterfinals',
        created_at: new Date('2024-03-03')
      },
      
      // Ana Martínez (Player ID 3) - Newer player with some success
      {
        player_id: 3,
        tournament_id: 10, // Winter Cup Mexico City 2024 (completed)
        category_id: 27, // Winter Open Mixed
        points: 80,
        reason: 'First round - participation',
        created_at: new Date('2024-01-21')
      },
      {
        player_id: 3,
        tournament_id: 6, // Club Azteca Internal Tournament (ongoing)
        category_id: 20, // Members Mixed Doubles
        points: 160,
        reason: 'Semifinalist - 3rd place',
        created_at: new Date('2024-02-17')
      },
      {
        player_id: 3,
        tournament_id: 3, // Mexico City Pickleball Open 2024
        category_id: 12, // Open Women's Doubles
        points: 140,
        reason: 'Second round',
        created_at: new Date('2024-02-25')
      },
      
      // Additional historical points for better data diversity
      {
        player_id: 1,
        tournament_id: 4, // Jalisco Pickleball Cup
        category_id: 15, // Advanced Women's Doubles
        points: 240,
        reason: 'Quarterfinals',
        created_at: new Date('2024-03-03')
      },
      {
        player_id: 2,
        tournament_id: 1, // Campeonato Nacional (upcoming but with previous year data)
        category_id: 1, // Men's Singles Open
        points: 850,
        reason: 'Previous 2023 edition - Finalist',
        created_at: new Date('2023-03-17')
      },
      {
        player_id: 1,
        tournament_id: 1, // Campeonato Nacional (previous year)
        category_id: 2, // Women's Singles Open
        points: 520,
        reason: 'Previous 2023 edition - Quarterfinals',
        created_at: new Date('2023-03-17')
      },
      {
        player_id: 3,
        tournament_id: 7, // Copa de Apertura Guadalajara Club
        category_id: 22, // Opening Mixed Doubles B
        points: 200,
        reason: 'Finalist - 2nd place',
        created_at: new Date('2024-01-28')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ranking_points_history', null, {});
  }
};