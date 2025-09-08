'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tournament_registrations', [
      // Registrations for Opening Cup Guadalajara Club (tournament_id: 7) - COMPLETED TOURNAMENT
      // Singles registrations
      {
        tournament_id: 7,
        category_id: 21, // Opening Mixed Doubles A
        player_id: 1, // María González
        partner_player_id: 2, // Carlos Rodríguez
        registration_date: new Date('2024-01-08 09:30:00'),
        payment_status: 'paid',
        amount_paid: 300.00,
        stripe_payment_id: 'pi_COMPLETED123ABC',
        status: 'confirmed',
        created_at: new Date('2024-01-08 09:30:00'),
        updated_at: new Date('2024-01-10 14:20:00')
      },
      {
        tournament_id: 7,
        category_id: 22, // Opening Mixed Doubles B
        player_id: 3, // Ana Martínez
        partner_player_id: null, // Looking for partner
        registration_date: new Date('2024-01-12 16:45:00'),
        payment_status: 'paid',
        amount_paid: 300.00,
        stripe_payment_id: 'pi_COMPLETED456DEF',
        status: 'confirmed',
        created_at: new Date('2024-01-12 16:45:00'),
        updated_at: new Date('2024-01-15 11:30:00')
      },

      // Registrations for Winter Cup Mexico City 2024 (tournament_id: 10) - COMPLETED TOURNAMENT
      {
        tournament_id: 10,
        category_id: 26, // Winter Open Mixed
        player_id: 2, // Carlos Rodríguez
        partner_player_id: 3, // Ana Martínez
        registration_date: new Date('2024-01-02 14:20:00'),
        payment_status: 'paid',
        amount_paid: 750.00,
        stripe_payment_id: 'pi_WINTER123GHI',
        status: 'confirmed',
        created_at: new Date('2024-01-02 14:20:00'),
        updated_at: new Date('2024-01-05 10:15:00')
      },
      {
        tournament_id: 10,
        category_id: 26, // Winter Open Mixed
        player_id: 1, // María González
        partner_player_id: null, // Solo player
        registration_date: new Date('2024-01-03 11:00:00'),
        payment_status: 'paid',
        amount_paid: 750.00,
        stripe_payment_id: 'pi_WINTER456JKL',
        status: 'confirmed',
        created_at: new Date('2024-01-03 11:00:00'),
        updated_at: new Date('2024-01-05 10:15:00')
      },

      // Registrations for Club Azteca Internal Tournament (tournament_id: 6) - ONGOING TOURNAMENT
      {
        tournament_id: 6,
        category_id: 17, // Members Mixed Doubles
        player_id: 1, // María González
        partner_player_id: 2, // Carlos Rodríguez
        registration_date: new Date('2024-02-05 13:15:00'),
        payment_status: 'paid',
        amount_paid: 350.00,
        stripe_payment_id: 'pi_AZTECA123MNO',
        status: 'confirmed',
        created_at: new Date('2024-02-05 13:15:00'),
        updated_at: new Date('2024-02-07 16:30:00')
      },
      {
        tournament_id: 6,
        category_id: 17, // Members Mixed Doubles
        player_id: 3, // Ana Martínez
        partner_player_id: null, // Looking for partner
        registration_date: new Date('2024-02-08 10:45:00'),
        payment_status: 'paid',
        amount_paid: 350.00,
        stripe_payment_id: 'pi_AZTECA456PQR',
        status: 'confirmed',
        created_at: new Date('2024-02-08 10:45:00'),
        updated_at: new Date('2024-02-10 12:20:00')
      },

      // Registrations for Abierto de Pickleball Ciudad de México 2024 (tournament_id: 3) - UPCOMING
      {
        tournament_id: 3,
        category_id: 10, // Open Men's Doubles
        player_id: 2, // Carlos Rodríguez
        partner_player_id: null, // Looking for partner
        registration_date: new Date('2024-02-10 14:30:00'),
        payment_status: 'paid',
        amount_paid: 950.00,
        stripe_payment_id: 'pi_CDMX2024ABC',
        status: 'confirmed',
        created_at: new Date('2024-02-10 14:30:00'),
        updated_at: new Date('2024-02-12 09:15:00')
      },
      {
        tournament_id: 3,
        category_id: 11, // Open Women's Doubles
        player_id: 1, // María González
        partner_player_id: 3, // Ana Martínez
        registration_date: new Date('2024-02-12 16:00:00'),
        payment_status: 'paid',
        amount_paid: 950.00,
        stripe_payment_id: 'pi_CDMX2024DEF',
        status: 'confirmed',
        created_at: new Date('2024-02-12 16:00:00'),
        updated_at: new Date('2024-02-13 11:45:00')
      },
      {
        tournament_id: 3,
        category_id: 12, // Veterans 50+ Mixed
        player_id: 3, // Ana Martínez (assuming over 50 for testing)
        partner_player_id: null,
        registration_date: new Date('2024-02-13 09:20:00'),
        payment_status: 'pending',
        amount_paid: null,
        stripe_payment_id: null,
        status: 'registered',
        created_at: new Date('2024-02-13 09:20:00'),
        updated_at: new Date('2024-02-13 09:20:00')
      },

      // Registrations for Jalisco Pickleball Cup (tournament_id: 4) - UPCOMING
      {
        tournament_id: 4,
        category_id: 13, // Advanced Men's Doubles
        player_id: 2, // Carlos Rodríguez
        partner_player_id: null,
        registration_date: new Date('2024-02-14 11:30:00'),
        payment_status: 'pending',
        amount_paid: null,
        stripe_payment_id: null,
        status: 'registered',
        created_at: new Date('2024-02-14 11:30:00'),
        updated_at: new Date('2024-02-14 11:30:00')
      },
      {
        tournament_id: 4,
        category_id: 14, // Advanced Women's Doubles
        player_id: 1, // María González
        partner_player_id: null,
        registration_date: new Date('2024-02-14 15:45:00'),
        payment_status: 'pending',
        amount_paid: null,
        stripe_payment_id: null,
        status: 'registered',
        created_at: new Date('2024-02-14 15:45:00'),
        updated_at: new Date('2024-02-14 15:45:00')
      },
      {
        tournament_id: 4,
        category_id: 15, // Intermediate Mixed Doubles
        player_id: 3, // Ana Martínez
        partner_player_id: 2, // Carlos Rodríguez as partner
        registration_date: new Date('2024-02-14 17:20:00'),
        payment_status: 'paid',
        amount_paid: 850.00,
        stripe_payment_id: 'pi_JALISCO2024GHI',
        status: 'confirmed',
        created_at: new Date('2024-02-14 17:20:00'),
        updated_at: new Date('2024-02-14 17:22:00')
      },

      // Registrations for Campeonato Nacional de Pickleball México 2024 (tournament_id: 1) - UPCOMING MAJOR
      {
        tournament_id: 1,
        category_id: 2, // Women's Singles Open
        player_id: 1, // María González
        partner_player_id: null, // Singles
        registration_date: new Date('2024-02-05 10:00:00'),
        payment_status: 'paid',
        amount_paid: 1500.00,
        stripe_payment_id: 'pi_NACIONAL2024AAA',
        status: 'confirmed',
        created_at: new Date('2024-02-05 10:00:00'),
        updated_at: new Date('2024-02-07 14:30:00')
      },
      {
        tournament_id: 1,
        category_id: 1, // Men's Singles Open
        player_id: 2, // Carlos Rodríguez
        partner_player_id: null, // Singles
        registration_date: new Date('2024-02-06 14:15:00'),
        payment_status: 'paid',
        amount_paid: 1500.00,
        stripe_payment_id: 'pi_NACIONAL2024BBB',
        status: 'confirmed',
        created_at: new Date('2024-02-06 14:15:00'),
        updated_at: new Date('2024-02-08 09:45:00')
      },
      {
        tournament_id: 1,
        category_id: 5, // Mixed Doubles Open
        player_id: 1, // María González
        partner_player_id: 2, // Carlos Rodríguez
        registration_date: new Date('2024-02-08 16:30:00'),
        payment_status: 'paid',
        amount_paid: 1500.00,
        stripe_payment_id: 'pi_NACIONAL2024CCC',
        status: 'confirmed',
        created_at: new Date('2024-02-08 16:30:00'),
        updated_at: new Date('2024-02-09 11:20:00')
      },
      {
        tournament_id: 1,
        category_id: 4, // Women's Doubles Open
        player_id: 3, // Ana Martínez
        partner_player_id: null, // Looking for partner
        registration_date: new Date('2024-02-11 13:45:00'),
        payment_status: 'pending',
        amount_paid: null,
        stripe_payment_id: null,
        status: 'waitlisted',
        created_at: new Date('2024-02-11 13:45:00'),
        updated_at: new Date('2024-02-11 13:45:00')
      },

      // Registration for Torneo Nacional Juvenil (tournament_id: 2) - UPCOMING
      // Note: Using existing players for testing even if age might not match exactly
      {
        tournament_id: 2,
        category_id: 8, // Juvenil Mixed Doubles 14-18
        player_id: 3, // Ana Martínez (for testing purposes)
        partner_player_id: null,
        registration_date: new Date('2024-02-13 12:00:00'),
        payment_status: 'paid',
        amount_paid: 800.00,
        stripe_payment_id: 'pi_JUVENIL2024DDD',
        status: 'confirmed',
        created_at: new Date('2024-02-13 12:00:00'),
        updated_at: new Date('2024-02-13 12:02:00')
      },

      // Withdrawn registration example
      {
        tournament_id: 3,
        category_id: 10, // Open Men's Doubles
        player_id: 3, // Ana Martínez (withdrew due to injury)
        partner_player_id: null,
        registration_date: new Date('2024-02-09 15:30:00'),
        payment_status: 'refunded',
        amount_paid: 950.00,
        stripe_payment_id: 'pi_CDMX2024WITHDRAWN',
        status: 'withdrawn',
        created_at: new Date('2024-02-09 15:30:00'),
        updated_at: new Date('2024-02-14 10:15:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tournament_registrations', null, {});
  }
};