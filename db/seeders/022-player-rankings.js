'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('player_rankings', [
      // María González (Player ID 1) rankings
      {
        player_id: 1,
        period_id: 1, // 2023 First Semester
        category_id: 2, // Open Women's Singles
        points: 850,
        tournaments_played: 4,
        current_rank: 12,
        previous_rank: 18,
        created_at: new Date('2023-06-30'),
        updated_at: new Date('2023-06-30')
      },
      {
        player_id: 1,
        period_id: 2, // 2023 Second Semester
        category_id: 2, // Open Women's Singles
        points: 1240,
        tournaments_played: 6,
        current_rank: 8,
        previous_rank: 12,
        created_at: new Date('2023-12-31'),
        updated_at: new Date('2023-12-31')
      },
      {
        player_id: 1,
        period_id: 3, // 2024 First Quarter (current)
        category_id: 2, // Open Women's Singles
        points: 420,
        tournaments_played: 2,
        current_rank: 15,
        previous_rank: 8,
        created_at: new Date('2024-03-31'),
        updated_at: new Date('2024-03-31')
      },
      {
        player_id: 1,
        period_id: 1, // 2023 First Semester
        category_id: 5, // Open Mixed Doubles
        points: 680,
        tournaments_played: 3,
        current_rank: 22,
        previous_rank: null,
        created_at: new Date('2023-06-30'),
        updated_at: new Date('2023-06-30')
      },
      
      // Carlos Rodríguez (Player ID 2) rankings
      {
        player_id: 2,
        period_id: 1, // 2023 First Semester
        category_id: 1, // Open Men's Singles
        points: 1450,
        tournaments_played: 5,
        current_rank: 3,
        previous_rank: 7,
        created_at: new Date('2023-06-30'),
        updated_at: new Date('2023-06-30')
      },
      {
        player_id: 2,
        period_id: 2, // 2023 Second Semester
        category_id: 1, // Open Men's Singles
        points: 1820,
        tournaments_played: 7,
        current_rank: 2,
        previous_rank: 3,
        created_at: new Date('2023-12-31'),
        updated_at: new Date('2023-12-31')
      },
      {
        player_id: 2,
        period_id: 3, // 2024 First Quarter (current)
        category_id: 1, // Open Men's Singles
        points: 950,
        tournaments_played: 4,
        current_rank: 5,
        previous_rank: 2,
        created_at: new Date('2024-03-31'),
        updated_at: new Date('2024-03-31')
      },
      {
        player_id: 2,
        period_id: 2, // 2023 Second Semester
        category_id: 3, // Open Men's Doubles
        points: 1200,
        tournaments_played: 4,
        current_rank: 8,
        previous_rank: null,
        created_at: new Date('2023-12-31'),
        updated_at: new Date('2023-12-31')
      },
      
      // Ana Martínez (Player ID 3) rankings
      {
        player_id: 3,
        period_id: 2, // 2023 Second Semester (her first period)
        category_id: 2, // Open Women's Singles
        points: 320,
        tournaments_played: 2,
        current_rank: 45,
        previous_rank: null,
        created_at: new Date('2023-12-31'),
        updated_at: new Date('2023-12-31')
      },
      {
        player_id: 3,
        period_id: 3, // 2024 First Quarter (current)
        category_id: 2, // Open Women's Singles
        points: 580,
        tournaments_played: 3,
        current_rank: 28,
        previous_rank: 45,
        created_at: new Date('2024-03-31'),
        updated_at: new Date('2024-03-31')
      },
      {
        player_id: 3,
        period_id: 3, // 2024 First Quarter
        category_id: 5, // Open Mixed Doubles
        points: 240,
        tournaments_played: 1,
        current_rank: 38,
        previous_rank: null,
        created_at: new Date('2024-03-31'),
        updated_at: new Date('2024-03-31')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('player_rankings', null, {});
  }
};