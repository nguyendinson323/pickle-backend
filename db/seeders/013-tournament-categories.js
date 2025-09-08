'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tournament_categories', [
      // Categories for Mexico National Pickleball Championship 2024 (tournament_id: 1)
      {
        tournament_id: 1,
        name: 'Men\'s Singles Open',
        min_age: 18,
        max_age: null,
        gender: 'Male',
        min_skill_level: 3.5,
        max_skill_level: 5.0,
        format: 'Single Elimination',
        max_participants: 32,
        created_at: new Date()
      },
      {
        tournament_id: 1,
        name: 'Women\'s Singles Open',
        min_age: 18,
        max_age: null,
        gender: 'Female',
        min_skill_level: 3.5,
        max_skill_level: 5.0,
        format: 'Single Elimination',
        max_participants: 32,
        created_at: new Date()
      },
      {
        tournament_id: 1,
        name: 'Men\'s Doubles Open',
        min_age: 18,
        max_age: null,
        gender: 'Male',
        min_skill_level: 3.5,
        max_skill_level: 5.0,
        format: 'Round Robin + Elimination',
        max_participants: 64,
        created_at: new Date()
      },
      {
        tournament_id: 1,
        name: 'Women\'s Doubles Open',
        min_age: 18,
        max_age: null,
        gender: 'Female',
        min_skill_level: 3.5,
        max_skill_level: 5.0,
        format: 'Round Robin + Elimination',
        max_participants: 64,
        created_at: new Date()
      },
      {
        tournament_id: 1,
        name: 'Mixed Doubles Open',
        min_age: 18,
        max_age: null,
        gender: 'Mixed',
        min_skill_level: 3.5,
        max_skill_level: 5.0,
        format: 'Round Robin + Elimination',
        max_participants: 64,
        created_at: new Date()
      },

      // Categories for National Youth Pickleball Tournament (tournament_id: 2)
      {
        tournament_id: 2,
        name: 'Youth Men\'s 16-18 Singles',
        min_age: 16,
        max_age: 18,
        gender: 'Male',
        min_skill_level: 2.5,
        max_skill_level: 4.5,
        format: 'Round Robin',
        max_participants: 16,
        created_at: new Date()
      },
      {
        tournament_id: 2,
        name: 'Youth Women\'s 16-18 Singles',
        min_age: 16,
        max_age: 18,
        gender: 'Female',
        min_skill_level: 2.5,
        max_skill_level: 4.5,
        format: 'Round Robin',
        max_participants: 16,
        created_at: new Date()
      },
      {
        tournament_id: 2,
        name: 'Youth Mixed Doubles 14-18',
        min_age: 14,
        max_age: 18,
        gender: 'Mixed',
        min_skill_level: 2.0,
        max_skill_level: 4.0,
        format: 'Single Elimination',
        max_participants: 32,
        created_at: new Date()
      },
      {
        tournament_id: 2,
        name: 'Youth Under 12-15 Mixed',
        min_age: 12,
        max_age: 15,
        gender: 'Mixed',
        min_skill_level: 1.5,
        max_skill_level: 3.5,
        format: 'Round Robin',
        max_participants: 32,
        created_at: new Date()
      },

      // Categories for Mexico City Pickleball Open 2024 (tournament_id: 3)
      {
        tournament_id: 3,
        name: 'Men\'s Open Doubles',
        min_age: 18,
        max_age: null,
        gender: 'Male',
        min_skill_level: 3.0,
        max_skill_level: 5.0,
        format: 'Round Robin + Elimination',
        max_participants: 48,
        created_at: new Date()
      },
      {
        tournament_id: 3,
        name: 'Women\'s Open Doubles',
        min_age: 18,
        max_age: null,
        gender: 'Female',
        min_skill_level: 3.0,
        max_skill_level: 5.0,
        format: 'Round Robin + Elimination',
        max_participants: 48,
        created_at: new Date()
      },
      {
        tournament_id: 3,
        name: 'Veterans 50+ Mixed',
        min_age: 50,
        max_age: null,
        gender: 'Mixed',
        min_skill_level: 2.5,
        max_skill_level: 4.5,
        format: 'Round Robin',
        max_participants: 32,
        created_at: new Date()
      },

      // Categories for Jalisco Pickleball Cup (tournament_id: 4)
      {
        tournament_id: 4,
        name: 'Advanced Men\'s Doubles',
        min_age: 21,
        max_age: null,
        gender: 'Male',
        min_skill_level: 4.0,
        max_skill_level: 5.0,
        format: 'Single Elimination',
        max_participants: 32,
        created_at: new Date()
      },
      {
        tournament_id: 4,
        name: 'Advanced Women\'s Doubles',
        min_age: 21,
        max_age: null,
        gender: 'Female',
        min_skill_level: 4.0,
        max_skill_level: 5.0,
        format: 'Single Elimination',
        max_participants: 32,
        created_at: new Date()
      },
      {
        tournament_id: 4,
        name: 'Intermediate Mixed Doubles',
        min_age: 18,
        max_age: null,
        gender: 'Mixed',
        min_skill_level: 3.0,
        max_skill_level: 3.9,
        format: 'Round Robin',
        max_participants: 48,
        created_at: new Date()
      },

      // Categories for Nuevo Leon State Championship Tournament (tournament_id: 5)
      {
        tournament_id: 5,
        name: 'Elite Men\'s Singles',
        min_age: 18,
        max_age: null,
        gender: 'Male',
        min_skill_level: 4.5,
        max_skill_level: 5.0,
        format: 'Round Robin + Elimination',
        max_participants: 16,
        created_at: new Date()
      },
      {
        tournament_id: 5,
        name: 'Elite Women\'s Singles',
        min_age: 18,
        max_age: null,
        gender: 'Female',
        min_skill_level: 4.5,
        max_skill_level: 5.0,
        format: 'Round Robin + Elimination',
        max_participants: 16,
        created_at: new Date()
      },
      {
        tournament_id: 5,
        name: 'Pro Mixed Doubles',
        min_age: 21,
        max_age: null,
        gender: 'Mixed',
        min_skill_level: 4.0,
        max_skill_level: 5.0,
        format: 'Single Elimination',
        max_participants: 40,
        created_at: new Date()
      },

      // Categories for Club Azteca Internal Tournament (tournament_id: 6)
      {
        tournament_id: 6,
        name: 'Members Mixed Doubles',
        min_age: 16,
        max_age: null,
        gender: 'Mixed',
        min_skill_level: 2.0,
        max_skill_level: 4.5,
        format: 'Round Robin',
        max_participants: 32,
        created_at: new Date()
      },

      // Categories for Guadalajara Club Opening Cup (tournament_id: 7) - COMPLETED
      {
        tournament_id: 7,
        name: 'Opening Mixed Doubles A',
        min_age: 18,
        max_age: null,
        gender: 'Mixed',
        min_skill_level: 3.0,
        max_skill_level: 4.5,
        format: 'Single Elimination',
        max_participants: 24,
        created_at: new Date()
      },
      {
        tournament_id: 7,
        name: 'Opening Mixed Doubles B',
        min_age: 18,
        max_age: null,
        gender: 'Mixed',
        min_skill_level: 2.0,
        max_skill_level: 2.9,
        format: 'Round Robin',
        max_participants: 24,
        created_at: new Date()
      },

      // Categories for Riviera Maya Open (tournament_id: 8)
      {
        tournament_id: 8,
        name: 'Beach Masters Men\'s',
        min_age: 25,
        max_age: null,
        gender: 'Male',
        min_skill_level: 3.5,
        max_skill_level: 5.0,
        format: 'Single Elimination',
        max_participants: 32,
        created_at: new Date()
      },
      {
        tournament_id: 8,
        name: 'Beach Masters Women\'s',
        min_age: 25,
        max_age: null,
        gender: 'Female',
        min_skill_level: 3.5,
        max_skill_level: 5.0,
        format: 'Single Elimination',
        max_participants: 32,
        created_at: new Date()
      },

      // Categories for Cancun International (tournament_id: 9)
      {
        tournament_id: 9,
        name: 'International Pro Singles Male',
        min_age: 18,
        max_age: null,
        gender: 'Male',
        min_skill_level: 4.5,
        max_skill_level: 5.0,
        format: 'Round Robin + Elimination',
        max_participants: 24,
        created_at: new Date()
      },
      {
        tournament_id: 9,
        name: 'International Pro Singles Female',
        min_age: 18,
        max_age: null,
        gender: 'Female',
        min_skill_level: 4.5,
        max_skill_level: 5.0,
        format: 'Round Robin + Elimination',
        max_participants: 24,
        created_at: new Date()
      },
      {
        tournament_id: 9,
        name: 'International Mixed Pro',
        min_age: 21,
        max_age: null,
        gender: 'Mixed',
        min_skill_level: 4.5,
        max_skill_level: 5.0,
        format: 'Single Elimination',
        max_participants: 80,
        created_at: new Date()
      },

      // Categories for CDMX Winter Cup 2024 (tournament_id: 10) - COMPLETED
      {
        tournament_id: 10,
        name: 'Winter Open Mixed',
        min_age: 16,
        max_age: null,
        gender: 'Mixed',
        min_skill_level: 2.5,
        max_skill_level: 4.5,
        format: 'Round Robin + Elimination',
        max_participants: 60,
        created_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tournament_categories', null, {});
  }
};