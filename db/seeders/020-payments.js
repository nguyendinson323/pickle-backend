'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('payments', [
      // Tournament payments
      {
        user_id: 2, // María González
        amount: 1500.00,
        currency: 'MXN',
        payment_type: 'Tournament Registration',
        payment_method: 'Credit Card',
        reference_type: 'tournament',
        reference_id: 1, // National Championship
        stripe_payment_id: 'pi_NACIONAL2024AAA',
        status: 'completed',
        transaction_date: new Date('2024-02-05 10:02:00'),
        created_at: new Date('2024-02-05 10:00:00'),
        updated_at: new Date('2024-02-05 10:02:00')
      },
      {
        user_id: 3, // Carlos Rodríguez
        amount: 950.00,
        currency: 'MXN',
        payment_type: 'Tournament Registration',
        payment_method: 'Credit Card',
        reference_type: 'tournament',
        reference_id: 3, // Mexico City Open
        stripe_payment_id: 'pi_CDMX2024DEF',
        status: 'completed',
        transaction_date: new Date('2024-02-12 16:02:00'),
        created_at: new Date('2024-02-12 16:00:00'),
        updated_at: new Date('2024-02-12 16:02:00')
      },
      
      // Court reservation payments
      {
        user_id: 2, // María González
        amount: 450.00,
        currency: 'MXN',
        payment_type: 'Court Reservation',
        payment_method: 'Credit Card',
        reference_type: 'court_reservation',
        reference_id: 1, // Court reservation
        stripe_payment_id: 'pi_1ABC123DEF456GHI',
        status: 'completed',
        transaction_date: new Date('2024-02-10 14:32:00'),
        created_at: new Date('2024-02-10 14:30:00'),
        updated_at: new Date('2024-02-10 14:32:00')
      },
      {
        user_id: 3, // Carlos Rodríguez
        amount: 380.00,
        currency: 'MXN',
        payment_type: 'Court Reservation',
        payment_method: 'Debit Card',
        reference_type: 'court_reservation',
        reference_id: 2,
        stripe_payment_id: 'pi_2ABC123DEF456GHI',
        status: 'completed',
        transaction_date: new Date('2024-02-12 09:16:00'),
        created_at: new Date('2024-02-12 09:15:00'),
        updated_at: new Date('2024-02-12 09:16:00')
      },
      
      // Affiliation payments
      {
        user_id: 7, // Club Azteca
        amount: 5000.00,
        currency: 'MXN',
        payment_type: 'Annual Affiliation',
        payment_method: 'Bank Transfer',
        reference_type: 'club_affiliation',
        reference_id: 1,
        stripe_payment_id: null,
        status: 'completed',
        transaction_date: new Date('2024-01-15 10:00:00'),
        created_at: new Date('2024-01-15 09:30:00'),
        updated_at: new Date('2024-01-15 10:00:00')
      },
      {
        user_id: 5, // Miguel coach
        amount: 2500.00,
        currency: 'MXN',
        payment_type: 'Coach Affiliation',
        payment_method: 'Credit Card',
        reference_type: 'coach_affiliation',
        reference_id: 1,
        stripe_payment_id: 'pi_COACH2024ABC',
        status: 'completed',
        transaction_date: new Date('2024-01-20 14:15:00'),
        created_at: new Date('2024-01-20 14:10:00'),
        updated_at: new Date('2024-01-20 14:15:00')
      },
      
      // Pending payments
      {
        user_id: 4, // Ana Martínez
        amount: 950.00,
        currency: 'MXN',
        payment_type: 'Tournament Registration',
        payment_method: 'Credit Card',
        reference_type: 'tournament',
        reference_id: 3, // Mexico City Open
        stripe_payment_id: null,
        status: 'pending',
        transaction_date: new Date(),
        created_at: new Date('2024-02-13 09:20:00'),
        updated_at: new Date('2024-02-13 09:20:00')
      },
      
      // Refunded payment
      {
        user_id: 4, // Ana Martínez
        amount: 950.00,
        currency: 'MXN',
        payment_type: 'Tournament Registration',
        payment_method: 'Credit Card',
        reference_type: 'tournament',
        reference_id: 3, // Mexico City Open (withdrawn)
        stripe_payment_id: 'pi_CDMX2024WITHDRAWN',
        status: 'refunded',
        transaction_date: new Date('2024-02-09 15:32:00'),
        created_at: new Date('2024-02-09 15:30:00'),
        updated_at: new Date('2024-02-14 10:15:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('payments', null, {});
  }
};