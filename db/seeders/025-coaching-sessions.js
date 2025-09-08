'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('coaching_sessions', [
      // Completed sessions - Miguel Ángel Fernández Castro (Coach ID 1)
      {
        coach_id: 1,
        player_id: 1, // María González
        session_date: '2024-01-15',
        start_time: '08:00:00',
        end_time: '10:00:00',
        court_id: 1, // Canchas Club Azteca - Polanco
        status: 'completed',
        price: 1700.00, // 2 horas x 850
        payment_status: 'paid',
        stripe_payment_id: 'pi_3OmGTQ2eZvKYlo2C1k2d8RjL',
        rating: 5,
        created_at: new Date('2024-01-10 14:30:00'),
        updated_at: new Date('2024-01-15 12:00:00')
      },
      {
        coach_id: 1,
        player_id: 2, // Carlos Rodríguez
        session_date: '2024-01-22',
        start_time: '16:00:00',
        end_time: '18:00:00',
        court_id: 3, // Instalaciones Monterrey Pickleball
        status: 'completed',
        price: 1700.00,
        payment_status: 'paid',
        stripe_payment_id: 'pi_3OnBVR2eZvKYlo2C1m3e9SmN',
        rating: 4,
        created_at: new Date('2024-01-18 09:20:00'),
        updated_at: new Date('2024-01-22 20:15:00')
      },
      {
        coach_id: 1,
        player_id: 3, // Ana Martínez
        session_date: '2024-02-05',
        start_time: '09:00:00',
        end_time: '10:30:00',
        court_id: 1, // Canchas Club Azteca - Polanco
        status: 'completed',
        price: 1275.00, // 1.5 horas x 850
        payment_status: 'paid',
        stripe_payment_id: 'pi_3OpCWS2eZvKYlo2C1n4f0ToP',
        rating: 5,
        created_at: new Date('2024-02-01 11:45:00'),
        updated_at: new Date('2024-02-05 12:30:00')
      },
      
      // Completed sessions - Sofía Isabel Ramírez Mendoza (Coach ID 2)
      {
        coach_id: 2,
        player_id: 1, // María González
        session_date: '2024-01-30',
        start_time: '14:00:00',
        end_time: '16:00:00',
        court_id: 2, // Centro Deportivo Guadalajara
        status: 'completed',
        price: 1500.00, // 2 horas x 750
        payment_status: 'paid',
        stripe_payment_id: 'pi_3OoEXT2eZvKYlo2C1o5g1UqQ',
        rating: 4,
        created_at: new Date('2024-01-25 16:20:00'),
        updated_at: new Date('2024-01-30 18:10:00')
      },
      {
        coach_id: 2,
        player_id: 3, // Ana Martínez
        session_date: '2024-02-08',
        start_time: '16:00:00',
        end_time: '17:00:00',
        court_id: 6, // Academia La Loma Sports Center
        status: 'completed',
        price: 750.00, // 1 hora x 750
        payment_status: 'paid',
        stripe_payment_id: 'pi_3OpJYU2eZvKYlo2C1p6h2VrR',
        rating: 5,
        created_at: new Date('2024-02-03 13:15:00'),
        updated_at: new Date('2024-02-08 19:00:00')
      },
      
      // Scheduled sessions (upcoming)
      {
        coach_id: 1,
        player_id: 1, // María González
        session_date: '2024-02-26',
        start_time: '08:00:00',
        end_time: '10:00:00',
        court_id: 1, // Canchas Club Azteca - Polanco
        status: 'scheduled',
        price: 1700.00,
        payment_status: 'paid',
        stripe_payment_id: 'pi_3OrKZV2eZvKYlo2C1q7i3WsS',
        rating: null,
        created_at: new Date('2024-02-20 10:30:00'),
        updated_at: new Date('2024-02-20 10:30:00')
      },
      {
        coach_id: 2,
        player_id: 2, // Carlos Rodríguez
        session_date: '2024-02-27',
        start_time: '15:00:00',
        end_time: '17:00:00',
        court_id: 2, // Centro Deportivo Guadalajara
        status: 'scheduled',
        price: 1500.00,
        payment_status: 'paid',
        stripe_payment_id: 'pi_3OrLaW2eZvKYlo2C1r8j4XtT',
        rating: null,
        created_at: new Date('2024-02-22 14:45:00'),
        updated_at: new Date('2024-02-22 14:45:00')
      },
      {
        coach_id: 1,
        player_id: 3, // Ana Martínez
        session_date: '2024-03-05',
        start_time: '15:00:00',
        end_time: '16:30:00',
        court_id: 8, // Academia Monterrey Training Center
        status: 'scheduled',
        price: 1275.00, // 1.5 horas x 850
        payment_status: 'pending',
        stripe_payment_id: null,
        rating: null,
        created_at: new Date('2024-02-28 12:00:00'),
        updated_at: new Date('2024-02-28 12:00:00')
      },
      {
        coach_id: 2,
        player_id: 1, // María González
        session_date: '2024-03-08',
        start_time: '09:00:00',
        end_time: '11:00:00',
        court_id: 6, // Academia La Loma Sports Center
        status: 'scheduled',
        price: 1500.00,
        payment_status: 'pending',
        stripe_payment_id: null,
        rating: null,
        created_at: new Date('2024-03-01 16:30:00'),
        updated_at: new Date('2024-03-01 16:30:00')
      },
      
      // Canceled sessions
      {
        coach_id: 1,
        player_id: 2, // Carlos Rodríguez
        session_date: '2024-02-12',
        start_time: '16:00:00',
        end_time: '18:00:00',
        court_id: 1, // Canchas Club Azteca - Polanco
        status: 'canceled',
        price: 1700.00,
        payment_status: 'refunded',
        stripe_payment_id: 'pi_3OqNbX2eZvKYlo2C1s9k5YuU',
        rating: null,
        created_at: new Date('2024-02-08 11:20:00'),
        updated_at: new Date('2024-02-11 09:15:00')
      },
      {
        coach_id: 2,
        player_id: 3, // Ana Martínez
        session_date: '2024-02-19',
        start_time: '14:00:00',
        end_time: '15:00:00',
        court_id: 2, // Centro Deportivo Guadalajara
        status: 'canceled',
        price: 750.00,
        payment_status: 'refunded',
        stripe_payment_id: 'pi_3OqOcY2eZvKYlo2C1t0l6ZvV',
        rating: null,
        created_at: new Date('2024-02-14 15:50:00'),
        updated_at: new Date('2024-02-18 13:30:00')
      },
      
      // Additional sessions for more data
      {
        coach_id: 1,
        player_id: 1, // María González - extended group session
        session_date: '2024-01-28',
        start_time: '07:00:00',
        end_time: '10:00:00',
        court_id: 3, // Instalaciones Monterrey Pickleball
        status: 'completed',
        price: 2550.00, // 3 horas x 850
        payment_status: 'paid',
        stripe_payment_id: 'pi_3OnTqZ2eZvKYlo2C1u1m7AwW',
        rating: 5,
        created_at: new Date('2024-01-23 08:40:00'),
        updated_at: new Date('2024-01-28 12:15:00')
      },
      {
        coach_id: 2,
        player_id: 2, // Carlos Rodríguez - specialized technical session
        session_date: '2024-02-14',
        start_time: '07:00:00',
        end_time: '10:00:00',
        court_id: 6, // Academia La Loma Sports Center
        status: 'completed',
        price: 2250.00, // 3 horas x 750
        payment_status: 'paid',
        stripe_payment_id: 'pi_3OqScZ2eZvKYlo2C1v2n8BxX',
        rating: 4,
        created_at: new Date('2024-02-10 12:25:00'),
        updated_at: new Date('2024-02-14 13:45:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('coaching_sessions', null, {});
  }
};