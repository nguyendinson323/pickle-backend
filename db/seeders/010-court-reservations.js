'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('court_reservations', [
      // Recent reservations - Confirmed and Paid
      {
        court_id: 1, // Club Azteca Courts - Polanco
        player_id: 1, // María González
        date: '2024-02-15',
        start_time: '07:00:00',
        end_time: '08:30:00',
        status: 'confirmed',
        payment_status: 'paid',
        amount: 450.00,
        stripe_payment_id: 'pi_1ABC123DEF456GHI',
        created_at: new Date('2024-02-10 14:30:00'),
        updated_at: new Date('2024-02-10 14:32:00')
      },
      {
        court_id: 2, // Guadalajara Sports Center
        player_id: 2, // Carlos Rodríguez
        date: '2024-02-16',
        start_time: '18:00:00',
        end_time: '19:30:00',
        status: 'confirmed',
        payment_status: 'paid',
        amount: 380.00,
        stripe_payment_id: 'pi_2ABC123DEF456GHI',
        created_at: new Date('2024-02-12 09:15:00'),
        updated_at: new Date('2024-02-12 09:16:00')
      },
      {
        court_id: 3, // Monterrey Pickleball Facilities
        player_id: 3, // Ana Martínez
        date: '2024-02-17',
        start_time: '09:00:00',
        end_time: '10:30:00',
        status: 'confirmed',
        payment_status: 'paid',
        amount: 650.00,
        stripe_payment_id: 'pi_3ABC123DEF456GHI',
        created_at: new Date('2024-02-13 16:45:00'),
        updated_at: new Date('2024-02-13 16:46:00')
      },
      
      // Future reservations - Confirmed but pending payment
      {
        court_id: 4, // Riviera Maya Resort Courts
        player_id: 1, // María González
        date: '2024-02-20',
        start_time: '15:00:00',
        end_time: '16:30:00',
        status: 'confirmed',
        payment_status: 'pending',
        amount: 800.00,
        stripe_payment_id: null,
        created_at: new Date('2024-02-14 11:20:00'),
        updated_at: new Date('2024-02-14 11:20:00')
      },
      {
        court_id: 5, // Grupo Cancún Sports Center
        player_id: 2, // Carlos Rodríguez
        date: '2024-02-21',
        start_time: '08:00:00',
        end_time: '09:30:00',
        status: 'confirmed',
        payment_status: 'pending',
        amount: 720.00,
        stripe_payment_id: null,
        created_at: new Date('2024-02-14 13:10:00'),
        updated_at: new Date('2024-02-14 13:10:00')
      },
      
      // Multiple bookings on same day for testing
      {
        court_id: 1, // Club Azteca Courts - Polanco
        player_id: 3, // Ana Martínez
        date: '2024-02-18',
        start_time: '10:00:00',
        end_time: '11:30:00',
        status: 'confirmed',
        payment_status: 'paid',
        amount: 450.00,
        stripe_payment_id: 'pi_4ABC123DEF456GHI',
        created_at: new Date('2024-02-11 08:30:00'),
        updated_at: new Date('2024-02-11 08:31:00')
      },
      {
        court_id: 1, // Same court, different time
        player_id: 2, // Carlos Rodríguez
        date: '2024-02-18',
        start_time: '16:00:00',
        end_time: '17:30:00',
        status: 'confirmed',
        payment_status: 'paid',
        amount: 450.00,
        stripe_payment_id: 'pi_5ABC123DEF456GHI',
        created_at: new Date('2024-02-11 10:45:00'),
        updated_at: new Date('2024-02-11 10:46:00')
      },
      
      // Canceled reservations with refunds
      {
        court_id: 2, // Guadalajara Sports Center
        player_id: 1, // María González
        date: '2024-02-19',
        start_time: '14:00:00',
        end_time: '15:30:00',
        status: 'canceled',
        payment_status: 'refunded',
        amount: 380.00,
        stripe_payment_id: 'pi_6ABC123DEF456GHI',
        created_at: new Date('2024-02-08 12:00:00'),
        updated_at: new Date('2024-02-12 17:30:00')
      },
      
      // Weekend premium pricing
      {
        court_id: 6, // Academia La Loma Sports Center
        player_id: 3, // Ana Martínez
        date: '2024-02-17', // Saturday
        start_time: '11:00:00',
        end_time: '12:30:00',
        status: 'confirmed',
        payment_status: 'paid',
        amount: 550.00, // Weekend premium
        stripe_payment_id: 'pi_7ABC123DEF456GHI',
        created_at: new Date('2024-02-13 19:15:00'),
        updated_at: new Date('2024-02-13 19:16:00')
      },
      
      // Resort booking with higher rates
      {
        court_id: 4, // Riviera Maya Resort Courts
        player_id: 2, // Carlos Rodríguez
        date: '2024-02-22',
        start_time: '17:00:00',
        end_time: '18:30:00',
        status: 'confirmed',
        payment_status: 'paid',
        amount: 800.00,
        stripe_payment_id: 'pi_8ABC123DEF456GHI',
        created_at: new Date('2024-02-14 15:00:00'),
        updated_at: new Date('2024-02-14 15:01:00')
      },
      
      // Early morning booking
      {
        court_id: 3, // Monterrey Pickleball Facilities (24hr facility)
        player_id: 1, // María González
        date: '2024-02-19',
        start_time: '05:30:00',
        end_time: '07:00:00',
        status: 'confirmed',
        payment_status: 'paid',
        amount: 590.00, // Early morning rate
        stripe_payment_id: 'pi_9ABC123DEF456GHI',
        created_at: new Date('2024-02-14 20:00:00'),
        updated_at: new Date('2024-02-14 20:01:00')
      },
      
      // Late evening booking
      {
        court_id: 2, // Guadalajara Sports Center
        player_id: 3, // Ana Martínez
        date: '2024-02-20',
        start_time: '21:00:00',
        end_time: '22:30:00',
        status: 'confirmed',
        payment_status: 'pending',
        amount: 420.00, // Evening rate
        stripe_payment_id: null,
        created_at: new Date('2024-02-14 16:30:00'),
        updated_at: new Date('2024-02-14 16:30:00')
      },
      
      // Pending confirmation
      {
        court_id: 7, // Playa del Carmen Sports Complex
        player_id: 2, // Carlos Rodríguez
        date: '2024-02-23',
        start_time: '12:00:00',
        end_time: '13:30:00',
        status: 'pending',
        payment_status: 'pending',
        amount: 480.00,
        stripe_payment_id: null,
        created_at: new Date('2024-02-14 18:45:00'),
        updated_at: new Date('2024-02-14 18:45:00')
      },
      
      // Past reservation for testing historical data
      {
        court_id: 1, // Club Azteca Courts - Polanco
        player_id: 1, // María González
        date: '2024-01-25',
        start_time: '16:30:00',
        end_time: '18:00:00',
        status: 'confirmed',
        payment_status: 'paid',
        amount: 450.00,
        stripe_payment_id: 'pi_PAST123DEF456GHI',
        created_at: new Date('2024-01-20 14:00:00'),
        updated_at: new Date('2024-01-20 14:01:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('court_reservations', null, {});
  }
};