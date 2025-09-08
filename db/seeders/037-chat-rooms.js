'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('chat_rooms', [
      // Direct chats between individual users
      {
        name: null, // Direct chats don't have specific names
        type: 'direct',
        created_at: new Date('2024-01-20 10:30:00')
      },
      {
        name: null,
        type: 'direct',
        created_at: new Date('2024-01-25 14:45:00')
      },
      {
        name: null,
        type: 'direct',
        created_at: new Date('2024-02-02 09:15:00')
      },
      {
        name: null,
        type: 'direct',
        created_at: new Date('2024-02-08 16:20:00')
      },
      {
        name: null,
        type: 'direct',
        created_at: new Date('2024-02-12 11:30:00')
      },
      
      // Grupos generales de discusión
      {
        name: 'Pickleball México - General',
        type: 'group',
        created_at: new Date('2024-01-15 08:00:00')
      },
      {
        name: 'Entrenamientos y Técnica',
        type: 'group',
        created_at: new Date('2024-01-18 12:30:00')
      },
      {
        name: 'Compañeros de Juego CDMX',
        type: 'group',
        created_at: new Date('2024-01-22 15:45:00')
      },
      {
        name: 'Jugadores Avanzados - Pro Tips',
        type: 'group',
        created_at: new Date('2024-01-28 19:20:00')
      },
      {
        name: 'Pickleball Jalisco',
        type: 'group',
        created_at: new Date('2024-02-01 10:15:00')
      },
      
      // Chats específicos de torneos
      {
        name: 'Campeonato Nacional 2024 - Participantes',
        type: 'tournament',
        created_at: new Date('2024-01-20 09:00:00')
      },
      {
        name: 'Abierto CDMX 2024 - Coordinación',
        type: 'tournament',
        created_at: new Date('2024-02-01 14:30:00')
      },
      {
        name: 'Copa Jalisco - Información Oficial',
        type: 'tournament',
        created_at: new Date('2024-02-05 11:45:00')
      },
      {
        name: 'Riviera Maya Open - Resort Players',
        type: 'tournament',
        created_at: new Date('2024-02-10 16:00:00')
      },
      
      // Chats estatales oficiales
      {
        name: 'Comité CDMX - Comunicación Oficial',
        type: 'state',
        created_at: new Date('2024-01-10 08:30:00')
      },
      {
        name: 'Comité Jalisco - Anuncios y Eventos',
        type: 'state',
        created_at: new Date('2024-01-12 10:45:00')
      },
      {
        name: 'Desarrollo Juvenil CDMX',
        type: 'state',
        created_at: new Date('2024-01-30 13:20:00')
      },
      
      // Chats de clubes
      {
        name: 'Club Azteca - Socios',
        type: 'club',
        created_at: new Date('2024-01-15 11:00:00')
      },
      {
        name: 'Club Guadalajara - Comunidad',
        type: 'club',
        created_at: new Date('2024-01-20 16:30:00')
      },
      {
        name: 'Club Monterrey - Alto Rendimiento',
        type: 'club',
        created_at: new Date('2024-01-25 14:15:00')
      },
      {
        name: 'Azteca - Torneos Internos',
        type: 'club',
        created_at: new Date('2024-02-05 12:45:00')
      },
      
      // Grupos especializados adicionales
      {
        name: 'Entrenadores Certificados México',
        type: 'group',
        created_at: new Date('2024-01-16 09:30:00')
      },
      {
        name: 'Mujeres en Pickleball',
        type: 'group',
        created_at: new Date('2024-01-24 17:45:00')
      },
      {
        name: 'Veteranos 50+ México',
        type: 'group',
        created_at: new Date('2024-02-03 13:10:00')
      },
      {
        name: 'Nuevos Jugadores - Bienvenidos',
        type: 'group',
        created_at: new Date('2024-02-07 10:20:00')
      },
      
      // Chats de coordinación organizacional
      {
        name: 'Staff Campeonato Nacional',
        type: 'tournament',
        created_at: new Date('2024-01-18 08:45:00')
      },
      {
        name: 'Árbitros Certificados México',
        type: 'group',
        created_at: new Date('2024-01-26 15:30:00')
      },
      {
        name: 'Patrocinadores y Partners',
        type: 'group',
        created_at: new Date('2024-02-04 11:15:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('chat_rooms', null, {});
  }
};