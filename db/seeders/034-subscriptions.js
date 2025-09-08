'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('subscriptions', [
      // Active player subscriptions
      {
        user_id: 2, // maria_gonzalez
        plan_id: 2, // Jugador Pro
        start_date: '2023-12-15',
        end_date: '2024-12-15',
        status: 'active',
        auto_renew: true,
        stripe_subscription_id: 'sub_1OmGTQ2eZvKYlo2C1k2d8RjL',
        payment_id: null,
        created_at: new Date('2023-12-15 10:30:00'),
        updated_at: new Date('2024-01-15 14:20:00')
      },
      {
        user_id: 3, // carlos_rodriguez
        plan_id: 3, // Jugador Elite
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        status: 'active',
        auto_renew: true,
        stripe_subscription_id: 'sub_1OnBVR2eZvKYlo2C1m3e9SmN',
        payment_id: null,
        created_at: new Date('2024-01-01 09:15:00'),
        updated_at: new Date('2024-02-10 16:45:00')
      },
      {
        user_id: 4, // ana_martinez
        plan_id: 1, // Jugador Básico
        start_date: '2024-02-01',
        end_date: '2025-02-01',
        status: 'active',
        auto_renew: false,
        stripe_subscription_id: 'sub_1OpCWS2eZvKYlo2C1n4f0ToP',
        payment_id: null,
        created_at: new Date('2024-02-01 14:20:00'),
        updated_at: new Date('2024-02-01 14:20:00')
      },
      
      // Suscripciones de entrenadores
      {
        user_id: 5, // coach_miguel
        plan_id: 5, // Coach Profesional
        start_date: '2023-11-01',
        end_date: '2024-11-01',
        status: 'active',
        auto_renew: true,
        stripe_subscription_id: 'sub_1OoEXT2eZvKYlo2C1o5g1UqQ',
        payment_id: null,
        created_at: new Date('2023-11-01 12:45:00'),
        updated_at: new Date('2024-01-15 09:30:00')
      },
      {
        user_id: 6, // coach_sofia
        plan_id: 4, // Coach Independiente
        start_date: '2024-01-15',
        end_date: '2025-01-15',
        status: 'active',
        auto_renew: true,
        stripe_subscription_id: 'sub_1OpJYU2eZvKYlo2C1p6h2VrR',
        payment_id: null,
        created_at: new Date('2024-01-15 16:20:00'),
        updated_at: new Date('2024-02-08 11:10:00')
      },
      
      // Suscripciones de clubes
      {
        user_id: 7, // club_azteca
        plan_id: 8, // Club Premium
        start_date: '2023-10-01',
        end_date: '2024-10-01',
        status: 'active',
        auto_renew: true,
        stripe_subscription_id: 'sub_1OrKZV2eZvKYlo2C1q7i3WsS',
        payment_id: null,
        created_at: new Date('2023-10-01 11:30:00'),
        updated_at: new Date('2024-01-20 14:15:00')
      },
      {
        user_id: 8, // club_guadalajara
        plan_id: 7, // Club Local
        start_date: '2024-02-01',
        end_date: '2025-02-01',
        status: 'active',
        auto_renew: false,
        stripe_subscription_id: 'sub_1OrLaW2eZvKYlo2C1r8j4XtT',
        payment_id: null,
        created_at: new Date('2024-02-01 13:45:00'),
        updated_at: new Date('2024-02-01 13:45:00')
      },
      
      // Suscripciones de partners
      {
        user_id: 9, // hotel_riviera
        plan_id: 12, // Partner Resort
        start_date: '2023-12-01',
        end_date: '2024-12-01',
        status: 'active',
        auto_renew: true,
        stripe_subscription_id: 'sub_1OqNbX2eZvKYlo2C1s9k5YuU',
        payment_id: null,
        created_at: new Date('2023-12-01 15:20:00'),
        updated_at: new Date('2024-02-05 10:30:00')
      },
      {
        user_id: 10, // deportes_mx
        plan_id: 11, // Partner Pro
        start_date: '2024-01-20',
        end_date: '2025-01-20',
        status: 'active',
        auto_renew: true,
        stripe_subscription_id: 'sub_1OqOcY2eZvKYlo2C1t0l6ZvV',
        payment_id: null,
        created_at: new Date('2024-01-20 08:45:00'),
        updated_at: new Date('2024-02-12 16:20:00')
      },
      
      // Suscripciones canceladas
      {
        user_id: 2, // maria_gonzalez (suscripción anterior)
        plan_id: 1, // Jugador Básico
        start_date: '2023-01-01',
        end_date: '2023-12-15',
        status: 'canceled',
        auto_renew: false,
        stripe_subscription_id: 'sub_1OmOld2eZvKYlo2C1k1c7QiK',
        payment_id: null,
        created_at: new Date('2023-01-01 12:00:00'),
        updated_at: new Date('2023-12-10 16:30:00')
      },
      {
        user_id: 6, // coach_sofia (plan anterior descontinuado)
        plan_id: 14, // Coach Startup (Descontinuado)
        start_date: '2023-08-01',
        end_date: '2024-01-15',
        status: 'canceled',
        auto_renew: false,
        stripe_subscription_id: 'sub_1OnTqZ2eZvKYlo2C1u1m7AwW',
        payment_id: null,
        created_at: new Date('2023-08-01 14:30:00'),
        updated_at: new Date('2024-01-10 12:15:00')
      },
      
      // Suscripciones expiradas
      {
        user_id: 4, // ana_martinez (plan gratuito anterior)
        plan_id: 13, // Jugador Free
        start_date: '2023-11-15',
        end_date: '2024-02-01',
        status: 'expired',
        auto_renew: false,
        stripe_subscription_id: null, // Plan gratuito sin Stripe
        payment_id: null,
        created_at: new Date('2023-11-15 10:20:00'),
        updated_at: new Date('2024-02-01 00:00:00')
      },
      
      // Suscripciones adicionales activas para más datos
      {
        user_id: 11, // estado_cdmx
        plan_id: 9, // Club Enterprise (para comités estatales)
        start_date: '2023-09-01',
        end_date: '2024-09-01',
        status: 'active',
        auto_renew: true,
        stripe_subscription_id: 'sub_1OqScZ2eZvKYlo2C1v2n8BxX',
        payment_id: null,
        created_at: new Date('2023-09-01 09:30:00'),
        updated_at: new Date('2024-01-25 11:45:00')
      },
      {
        user_id: 12, // estado_jalisco
        plan_id: 8, // Club Premium
        start_date: '2024-01-10',
        end_date: '2025-01-10',
        status: 'active',
        auto_renew: true,
        stripe_subscription_id: 'sub_1OrMcX2eZvKYlo2C1s0m8CyY',
        payment_id: null,
        created_at: new Date('2024-01-10 14:20:00'),
        updated_at: new Date('2024-02-15 13:30:00')
      },
      
      // Suscripción mensual (para testing de diferentes ciclos)
      {
        user_id: 3, // carlos_rodriguez (suscripción anterior mensual)
        plan_id: 2, // Jugador Pro
        start_date: '2023-10-01',
        end_date: '2023-12-31',
        status: 'expired',
        auto_renew: false,
        stripe_subscription_id: 'sub_1OnXrY2eZvKYlo2C1n2d7QjM',
        payment_id: null,
        created_at: new Date('2023-10-01 15:40:00'),
        updated_at: new Date('2023-12-31 23:59:59')
      },
      
      // Suscripción recién creada
      {
        user_id: 1, // admin_federation (acceso premium para administrar)
        plan_id: 9, // Club Enterprise
        start_date: '2024-02-15',
        end_date: '2025-02-15',
        status: 'active',
        auto_renew: true,
        stripe_subscription_id: 'sub_1OsNdY2eZvKYlo2C1w3o9DzZ',
        payment_id: null,
        created_at: new Date('2024-02-15 12:00:00'),
        updated_at: new Date('2024-02-15 12:00:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('subscriptions', null, {});
  }
};