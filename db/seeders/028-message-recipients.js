'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('message_recipients', [
      // Message 1: National Championship Announcement (sent to ALL users)
      {
        message_id: 1,
        recipient_id: 2, // maria_gonzalez
        is_read: true,
        read_at: new Date('2024-01-20 14:30:00'),
        created_at: new Date('2024-01-20 09:00:00')
      },
      {
        message_id: 1,
        recipient_id: 3, // carlos_rodriguez  
        is_read: true,
        read_at: new Date('2024-01-20 11:15:00'),
        created_at: new Date('2024-01-20 09:00:00')
      },
      {
        message_id: 1,
        recipient_id: 4, // ana_martinez
        is_read: true,
        read_at: new Date('2024-01-21 08:45:00'),
        created_at: new Date('2024-01-20 09:00:00')
      },
      {
        message_id: 1,
        recipient_id: 5, // coach_miguel
        is_read: true,
        read_at: new Date('2024-01-20 09:30:00'),
        created_at: new Date('2024-01-20 09:00:00')
      },
      {
        message_id: 1,
        recipient_id: 6, // coach_sofia
        is_read: true,
        read_at: new Date('2024-01-20 16:20:00'),
        created_at: new Date('2024-01-20 09:00:00')
      },
      {
        message_id: 1,
        recipient_id: 7, // club_azteca
        is_read: true,
        read_at: new Date('2024-01-20 10:45:00'),
        created_at: new Date('2024-01-20 09:00:00')
      },
      {
        message_id: 1,
        recipient_id: 8, // club_guadalajara
        is_read: true,
        read_at: new Date('2024-01-20 13:20:00'),
        created_at: new Date('2024-01-20 09:00:00')
      },
      {
        message_id: 1,
        recipient_id: 9, // hotel_riviera
        is_read: false,
        read_at: null,
        created_at: new Date('2024-01-20 09:00:00')
      },
      {
        message_id: 1,
        recipient_id: 10, // deportes_mx
        is_read: true,
        read_at: new Date('2024-01-22 12:10:00'),
        created_at: new Date('2024-01-20 09:00:00')
      },
      {
        message_id: 1,
        recipient_id: 11, // estado_cdmx
        is_read: true,
        read_at: new Date('2024-01-20 09:15:00'),
        created_at: new Date('2024-01-20 09:00:00')
      },
      {
        message_id: 1,
        recipient_id: 12, // estado_jalisco
        is_read: true,
        read_at: new Date('2024-01-20 15:30:00'),
        created_at: new Date('2024-01-20 09:00:00')
      },
      
      // Message 2: Nuevas Regulaciones (enviado a jugadores, coaches y comités)
      {
        message_id: 2,
        recipient_id: 2, // maria_gonzalez
        is_read: true,
        read_at: new Date('2024-02-08 18:45:00'),
        created_at: new Date('2024-02-08 14:30:00')
      },
      {
        message_id: 2,
        recipient_id: 3, // carlos_rodriguez
        is_read: true,
        read_at: new Date('2024-02-08 19:20:00'),
        created_at: new Date('2024-02-08 14:30:00')
      },
      {
        message_id: 2,
        recipient_id: 4, // ana_martinez
        is_read: false,
        read_at: null,
        created_at: new Date('2024-02-08 14:30:00')
      },
      {
        message_id: 2,
        recipient_id: 5, // coach_miguel
        is_read: true,
        read_at: new Date('2024-02-08 14:45:00'),
        created_at: new Date('2024-02-08 14:30:00')
      },
      {
        message_id: 2,
        recipient_id: 6, // coach_sofia
        is_read: true,
        read_at: new Date('2024-02-08 20:10:00'),
        created_at: new Date('2024-02-08 14:30:00')
      },
      {
        message_id: 2,
        recipient_id: 11, // estado_cdmx
        is_read: true,
        read_at: new Date('2024-02-08 14:35:00'),
        created_at: new Date('2024-02-08 14:30:00')
      },
      {
        message_id: 2,
        recipient_id: 12, // estado_jalisco
        is_read: true,
        read_at: new Date('2024-02-08 16:50:00'),
        created_at: new Date('2024-02-08 14:30:00')
      },
      
      // Message 3: Solicitud de María (enviado al admin y coaches)
      {
        message_id: 3,
        recipient_id: 1, // admin_federation
        is_read: true,
        read_at: new Date('2024-01-26 08:20:00'),
        created_at: new Date('2024-01-25 16:45:00')
      },
      {
        message_id: 3,
        recipient_id: 5, // coach_miguel
        is_read: true,
        read_at: new Date('2024-01-26 09:15:00'),
        created_at: new Date('2024-01-25 16:45:00')
      },
      {
        message_id: 3,
        recipient_id: 6, // coach_sofia
        is_read: false,
        read_at: null,
        created_at: new Date('2024-01-25 16:45:00')
      },
      
      // Message 4: Confirmación de María (enviado al comité CDMX)
      {
        message_id: 4,
        recipient_id: 11, // estado_cdmx
        is_read: true,
        read_at: new Date('2024-02-05 12:45:00'),
        created_at: new Date('2024-02-05 11:20:00')
      },
      {
        message_id: 4,
        recipient_id: 1, // admin_federation (copia)
        is_read: true,
        read_at: new Date('2024-02-05 15:30:00'),
        created_at: new Date('2024-02-05 11:20:00')
      },
      
      // Message 5: Propuesta de Carlos (enviado a otros jugadores)
      {
        message_id: 5,
        recipient_id: 2, // maria_gonzalez
        is_read: true,
        read_at: new Date('2024-01-31 07:30:00'),
        created_at: new Date('2024-01-30 19:15:00')
      },
      {
        message_id: 5,
        recipient_id: 4, // ana_martinez
        is_read: true,
        read_at: new Date('2024-01-31 12:45:00'),
        created_at: new Date('2024-01-30 19:15:00')
      },
      {
        message_id: 5,
        recipient_id: 7, // club_azteca
        is_read: true,
        read_at: new Date('2024-02-01 09:20:00'),
        created_at: new Date('2024-01-30 19:15:00')
      },
      
      // Message 6: Programa de Miguel (enviado a jugadores)
      {
        message_id: 6,
        recipient_id: 2, // maria_gonzalez
        is_read: true,
        read_at: new Date('2024-02-01 10:15:00'),
        created_at: new Date('2024-02-01 08:30:00')
      },
      {
        message_id: 6,
        recipient_id: 3, // carlos_rodriguez
        is_read: true,
        read_at: new Date('2024-02-01 20:30:00'),
        created_at: new Date('2024-02-01 08:30:00')
      },
      {
        message_id: 6,
        recipient_id: 4, // ana_martinez
        is_read: false,
        read_at: null,
        created_at: new Date('2024-02-01 08:30:00')
      },
      
      // Message 7: Tips de Miguel (enviado a todos los jugadores)
      {
        message_id: 7,
        recipient_id: 2, // maria_gonzalez
        is_read: true,
        read_at: new Date('2024-02-10 18:20:00'),
        created_at: new Date('2024-02-10 15:45:00')
      },
      {
        message_id: 7,
        recipient_id: 3, // carlos_rodriguez
        is_read: true,
        read_at: new Date('2024-02-10 21:10:00'),
        created_at: new Date('2024-02-10 15:45:00')
      },
      {
        message_id: 7,
        recipient_id: 4, // ana_martinez
        is_read: true,
        read_at: new Date('2024-02-11 08:45:00'),
        created_at: new Date('2024-02-10 15:45:00')
      },
      
      // Message 8: Clínica de Sofía (enviado a jugadores de Jalisco y principiantes)
      {
        message_id: 8,
        recipient_id: 2, // maria_gonzalez
        is_read: true,
        read_at: new Date('2024-02-15 14:30:00'),
        created_at: new Date('2024-02-15 10:20:00')
      },
      {
        message_id: 8,
        recipient_id: 4, // ana_martinez (principiante)
        is_read: true,
        read_at: new Date('2024-02-15 16:45:00'),
        created_at: new Date('2024-02-15 10:20:00')
      },
      {
        message_id: 8,
        recipient_id: 8, // club_guadalajara
        is_read: true,
        read_at: new Date('2024-02-15 11:20:00'),
        created_at: new Date('2024-02-15 10:20:00')
      },
      {
        message_id: 8,
        recipient_id: 12, // estado_jalisco
        is_read: true,
        read_at: new Date('2024-02-15 10:35:00'),
        created_at: new Date('2024-02-15 10:20:00')
      },
      
      // Message 9: Resultados del Comité CDMX (enviado a participantes y comunidad CDMX)
      {
        message_id: 9,
        recipient_id: 2, // maria_gonzalez (participante)
        is_read: true,
        read_at: new Date('2024-01-22 19:30:00'),
        created_at: new Date('2024-01-22 18:00:00')
      },
      {
        message_id: 9,
        recipient_id: 3, // carlos_rodriguez (ganador)
        is_read: true,
        read_at: new Date('2024-01-22 18:15:00'),
        created_at: new Date('2024-01-22 18:00:00')
      },
      {
        message_id: 9,
        recipient_id: 4, // ana_martinez (participante)
        is_read: true,
        read_at: new Date('2024-01-22 20:45:00'),
        created_at: new Date('2024-01-22 18:00:00')
      },
      {
        message_id: 9,
        recipient_id: 5, // coach_miguel
        is_read: true,
        read_at: new Date('2024-01-22 18:30:00'),
        created_at: new Date('2024-01-22 18:00:00')
      },
      {
        message_id: 9,
        recipient_id: 7, // club_azteca (sede)
        is_read: true,
        read_at: new Date('2024-01-22 18:10:00'),
        created_at: new Date('2024-01-22 18:00:00')
      },
      {
        message_id: 9,
        recipient_id: 1, // admin_federation
        is_read: true,
        read_at: new Date('2024-01-22 18:05:00'),
        created_at: new Date('2024-01-22 18:00:00')
      },
      
      // Message 10: Invitación Hotel Riviera (enviado a jugadores de nivel avanzado)
      {
        message_id: 10,
        recipient_id: 2, // maria_gonzalez
        is_read: true,
        read_at: new Date('2024-02-12 15:20:00'),
        created_at: new Date('2024-02-12 12:30:00')
      },
      {
        message_id: 10,
        recipient_id: 3, // carlos_rodriguez
        is_read: true,
        read_at: new Date('2024-02-12 18:45:00'),
        created_at: new Date('2024-02-12 12:30:00')
      },
      {
        message_id: 10,
        recipient_id: 5, // coach_miguel
        is_read: true,
        read_at: new Date('2024-02-12 13:10:00'),
        created_at: new Date('2024-02-12 12:30:00')
      },
      {
        message_id: 10,
        recipient_id: 6, // coach_sofia
        is_read: false,
        read_at: null,
        created_at: new Date('2024-02-12 12:30:00')
      },
      {
        message_id: 10,
        recipient_id: 11, // estado_cdmx
        is_read: true,
        read_at: new Date('2024-02-12 14:50:00'),
        created_at: new Date('2024-02-12 12:30:00')
      },
      {
        message_id: 10,
        recipient_id: 12, // estado_jalisco
        is_read: true,
        read_at: new Date('2024-02-12 16:30:00'),
        created_at: new Date('2024-02-12 12:30:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('message_recipients', null, {});
  }
};