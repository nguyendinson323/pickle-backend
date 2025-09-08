'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('chat_participants', [
      // Chat Room 1: Direct chat between María and Carlos (chat_room_id: 1)
      {
        chat_room_id: 1,
        user_id: 2, // maria_gonzalez
        joined_at: new Date('2024-01-20 10:30:00'),
        last_read: new Date('2024-01-20 18:45:00')
      },
      {
        chat_room_id: 1,
        user_id: 3, // carlos_rodriguez
        joined_at: new Date('2024-01-20 10:30:00'),
        last_read: new Date('2024-01-20 17:30:00')
      },
      
      // Chat Room 2: Chat directo entre Coach Miguel y Ana (chat_room_id: 2)
      {
        chat_room_id: 2,
        user_id: 5, // coach_miguel
        joined_at: new Date('2024-01-25 14:45:00'),
        last_read: new Date('2024-01-25 20:15:00')
      },
      {
        chat_room_id: 2,
        user_id: 4, // ana_martinez
        joined_at: new Date('2024-01-25 14:45:00'),
        last_read: new Date('2024-01-25 19:30:00')
      },
      
      // Chat Room 3: Chat directo entre Coach Sofia y María (chat_room_id: 3)
      {
        chat_room_id: 3,
        user_id: 6, // coach_sofia
        joined_at: new Date('2024-02-02 09:15:00'),
        last_read: new Date('2024-02-02 16:20:00')
      },
      {
        chat_room_id: 3,
        user_id: 2, // maria_gonzalez
        joined_at: new Date('2024-02-02 09:15:00'),
        last_read: new Date('2024-02-02 15:45:00')
      },
      
      // Chat Room 4: Chat directo entre Admin y Comité CDMX (chat_room_id: 4)
      {
        chat_room_id: 4,
        user_id: 1, // admin_federation
        joined_at: new Date('2024-02-08 16:20:00'),
        last_read: new Date('2024-02-08 19:30:00')
      },
      {
        chat_room_id: 4,
        user_id: 11, // estado_cdmx
        joined_at: new Date('2024-02-08 16:20:00'),
        last_read: new Date('2024-02-08 18:15:00')
      },
      
      // Chat Room 5: Chat directo entre Carlos y Ana (chat_room_id: 5)
      {
        chat_room_id: 5,
        user_id: 3, // carlos_rodriguez
        joined_at: new Date('2024-02-12 11:30:00'),
        last_read: new Date('2024-02-12 14:20:00')
      },
      {
        chat_room_id: 5,
        user_id: 4, // ana_martinez
        joined_at: new Date('2024-02-12 11:30:00'),
        last_read: new Date('2024-02-12 13:45:00')
      },
      
      // Chat Room 6: Pickleball México - General (chat_room_id: 6) - Grupo grande
      {
        chat_room_id: 6,
        user_id: 1, // admin_federation
        joined_at: new Date('2024-01-15 08:00:00'),
        last_read: new Date('2024-02-18 12:30:00')
      },
      {
        chat_room_id: 6,
        user_id: 2, // maria_gonzalez
        joined_at: new Date('2024-01-15 10:30:00'),
        last_read: new Date('2024-02-17 20:15:00')
      },
      {
        chat_room_id: 6,
        user_id: 3, // carlos_rodriguez
        joined_at: new Date('2024-01-15 11:45:00'),
        last_read: new Date('2024-02-18 09:45:00')
      },
      {
        chat_room_id: 6,
        user_id: 4, // ana_martinez
        joined_at: new Date('2024-01-16 14:20:00'),
        last_read: new Date('2024-02-16 18:30:00')
      },
      {
        chat_room_id: 6,
        user_id: 5, // coach_miguel
        joined_at: new Date('2024-01-15 08:30:00'),
        last_read: new Date('2024-02-18 11:20:00')
      },
      {
        chat_room_id: 6,
        user_id: 6, // coach_sofia
        joined_at: new Date('2024-01-15 16:15:00'),
        last_read: new Date('2024-02-17 15:45:00')
      },
      {
        chat_room_id: 6,
        user_id: 7, // club_azteca
        joined_at: new Date('2024-01-15 12:00:00'),
        last_read: new Date('2024-02-18 08:30:00')
      },
      {
        chat_room_id: 6,
        user_id: 11, // estado_cdmx
        joined_at: new Date('2024-01-15 08:15:00'),
        last_read: new Date('2024-02-18 10:45:00')
      },
      {
        chat_room_id: 6,
        user_id: 12, // estado_jalisco
        joined_at: new Date('2024-01-15 13:30:00'),
        last_read: new Date('2024-02-17 16:20:00')
      },
      
      // Chat Room 7: Entrenamientos y Técnica (chat_room_id: 7) - Grupo técnico
      {
        chat_room_id: 7,
        user_id: 5, // coach_miguel (administrador)
        joined_at: new Date('2024-01-18 12:30:00'),
        last_read: new Date('2024-02-18 14:15:00')
      },
      {
        chat_room_id: 7,
        user_id: 6, // coach_sofia
        joined_at: new Date('2024-01-18 12:35:00'),
        last_read: new Date('2024-02-18 13:30:00')
      },
      {
        chat_room_id: 7,
        user_id: 2, // maria_gonzalez
        joined_at: new Date('2024-01-18 15:20:00'),
        last_read: new Date('2024-02-17 21:45:00')
      },
      {
        chat_room_id: 7,
        user_id: 3, // carlos_rodriguez
        joined_at: new Date('2024-01-18 16:45:00'),
        last_read: new Date('2024-02-18 07:30:00')
      },
      {
        chat_room_id: 7,
        user_id: 4, // ana_martinez
        joined_at: new Date('2024-01-19 09:15:00'),
        last_read: new Date('2024-02-16 19:20:00')
      },
      
      // Chat Room 8: Compañeros de Juego CDMX (chat_room_id: 8) - Grupo regional
      {
        chat_room_id: 8,
        user_id: 2, // maria_gonzalez (creadora)
        joined_at: new Date('2024-01-22 15:45:00'),
        last_read: new Date('2024-02-18 11:30:00')
      },
      {
        chat_room_id: 8,
        user_id: 3, // carlos_rodriguez
        joined_at: new Date('2024-01-22 18:20:00'),
        last_read: new Date('2024-02-17 22:15:00')
      },
      {
        chat_room_id: 8,
        user_id: 7, // club_azteca
        joined_at: new Date('2024-01-22 19:30:00'),
        last_read: new Date('2024-02-18 09:45:00')
      },
      {
        chat_room_id: 8,
        user_id: 11, // estado_cdmx
        joined_at: new Date('2024-01-22 20:15:00'),
        last_read: new Date('2024-02-18 12:00:00')
      },
      
      // Chat Room 11: Campeonato Nacional 2024 - Participantes (chat_room_id: 11)
      {
        chat_room_id: 11,
        user_id: 1, // admin_federation (administrador)
        joined_at: new Date('2024-01-20 09:00:00'),
        last_read: new Date('2024-02-18 15:30:00')
      },
      {
        chat_room_id: 11,
        user_id: 2, // maria_gonzalez (participante)
        joined_at: new Date('2024-02-05 11:20:00'),
        last_read: new Date('2024-02-17 20:45:00')
      },
      {
        chat_room_id: 11,
        user_id: 3, // carlos_rodriguez (participante)
        joined_at: new Date('2024-02-04 16:30:00'),
        last_read: new Date('2024-02-18 08:15:00')
      },
      {
        chat_room_id: 11,
        user_id: 5, // coach_miguel (staff)
        joined_at: new Date('2024-01-20 09:30:00'),
        last_read: new Date('2024-02-18 14:00:00')
      },
      {
        chat_room_id: 11,
        user_id: 11, // estado_cdmx (organizador)
        joined_at: new Date('2024-01-20 09:15:00'),
        last_read: new Date('2024-02-18 16:20:00')
      },
      
      // Chat Room 18: Club Azteca - Socios (chat_room_id: 18)
      {
        chat_room_id: 18,
        user_id: 7, // club_azteca (administrador)
        joined_at: new Date('2024-01-15 11:00:00'),
        last_read: new Date('2024-02-18 17:30:00')
      },
      {
        chat_room_id: 18,
        user_id: 2, // maria_gonzalez (socia)
        joined_at: new Date('2024-01-15 14:30:00'),
        last_read: new Date('2024-02-17 19:15:00')
      },
      {
        chat_room_id: 18,
        user_id: 3, // carlos_rodriguez (socio)
        joined_at: new Date('2024-01-16 10:45:00'),
        last_read: new Date('2024-02-18 12:30:00')
      },
      {
        chat_room_id: 18,
        user_id: 5, // coach_miguel (instructor del club)
        joined_at: new Date('2024-01-15 11:30:00'),
        last_read: new Date('2024-02-18 16:45:00')
      },
      
      // Chat Room 22: Entrenadores Certificados México (chat_room_id: 22)
      {
        chat_room_id: 22,
        user_id: 1, // admin_federation (supervisor)
        joined_at: new Date('2024-01-16 09:30:00'),
        last_read: new Date('2024-02-18 13:20:00')
      },
      {
        chat_room_id: 22,
        user_id: 5, // coach_miguel
        joined_at: new Date('2024-01-16 09:30:00'),
        last_read: new Date('2024-02-18 15:45:00')
      },
      {
        chat_room_id: 22,
        user_id: 6, // coach_sofia
        joined_at: new Date('2024-01-16 10:15:00'),
        last_read: new Date('2024-02-18 14:30:00')
      },
      
      // Participantes adicionales en grupos selectos
      {
        chat_room_id: 9, // Jugadores Avanzados - Pro Tips
        user_id: 2, // maria_gonzalez
        joined_at: new Date('2024-01-29 08:15:00'),
        last_read: new Date('2024-02-17 22:30:00')
      },
      {
        chat_room_id: 9, // Jugadores Avanzados - Pro Tips
        user_id: 3, // carlos_rodriguez
        joined_at: new Date('2024-01-28 19:20:00'),
        last_read: new Date('2024-02-18 07:45:00')
      },
      {
        chat_room_id: 9, // Jugadores Avanzados - Pro Tips
        user_id: 5, // coach_miguel (moderador)
        joined_at: new Date('2024-01-28 19:25:00'),
        last_read: new Date('2024-02-18 16:00:00')
      },
      
      // Chat Room 25: Nuevos Jugadores - Bienvenidos (chat_room_id: 25)
      {
        chat_room_id: 25,
        user_id: 6, // coach_sofia (moderadora)
        joined_at: new Date('2024-02-07 10:20:00'),
        last_read: new Date('2024-02-18 18:15:00')
      },
      {
        chat_room_id: 25,
        user_id: 4, // ana_martinez (nueva jugadora)
        joined_at: new Date('2024-02-07 14:30:00'),
        last_read: new Date('2024-02-17 21:00:00')
      },
      {
        chat_room_id: 25,
        user_id: 1, // admin_federation (soporte)
        joined_at: new Date('2024-02-07 10:25:00'),
        last_read: new Date('2024-02-18 12:45:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('chat_participants', null, {});
  }
};