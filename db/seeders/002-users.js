'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('a', saltRounds);
    
    await queryInterface.bulkInsert('users', [
      // Admin user
      {
        role: 'admin',
        username: 'admin_mexico',
        email: 'admin@pickleballmexico.org',
        password: hashedPassword,
        phone: '+52 55 1234 5678',
        is_active: true,
        is_verified: true,
        is_premium: true,
        is_searchable: false,
        last_login: new Date('2024-01-15 10:30:00'),
        created_at: new Date(),
        updated_at: new Date()
      },
      // Players
      {
        role: 'player',
        username: 'maria_gonzalez',
        email: 'maria.gonzalez@email.com',
        password: hashedPassword,
        phone: '+52 55 9876 5432',
        is_active: true,
        is_verified: true,
        is_premium: false,
        is_searchable: true,
        last_login: new Date('2024-01-10 14:20:00'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role: 'player',
        username: 'carlos_rodriguez',
        email: 'carlos.rodriguez@email.com',
        password: hashedPassword,
        phone: '+52 33 1234 9876',
        is_active: true,
        is_verified: true,
        is_premium: true,
        is_searchable: true,
        last_login: new Date('2024-01-12 16:45:00'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role: 'player',
        username: 'ana_martinez',
        email: 'ana.martinez@email.com',
        password: hashedPassword,
        phone: '+52 81 5555 1234',
        is_active: true,
        is_verified: false,
        is_premium: false,
        is_searchable: true,
        last_login: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Coaches
      {
        role: 'coach',
        username: 'coach_miguel',
        email: 'miguel.coach@email.com',
        password: hashedPassword,
        phone: '+52 55 4444 7777',
        is_active: true,
        is_verified: true,
        is_premium: true,
        is_searchable: true,
        last_login: new Date('2024-01-14 08:15:00'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role: 'coach',
        username: 'coach_sofia',
        email: 'sofia.coach@email.com',
        password: hashedPassword,
        phone: '+52 33 8888 2222',
        is_active: true,
        is_verified: true,
        is_premium: false,
        is_searchable: true,
        last_login: new Date('2024-01-11 12:30:00'),
        created_at: new Date(),
        updated_at: new Date()
      },
      // Clubs
      {
        role: 'club',
        username: 'club_azteca',
        email: 'info@clubazteca.com',
        password: hashedPassword,
        phone: '+52 55 1111 9999',
        is_active: true,
        is_verified: true,
        is_premium: true,
        is_searchable: true,
        last_login: new Date('2024-01-13 09:00:00'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role: 'club',
        username: 'club_guadalajara',
        email: 'contacto@clubguadalajara.com',
        password: hashedPassword,
        phone: '+52 33 2222 8888',
        is_active: true,
        is_verified: true,
        is_premium: false,
        is_searchable: true,
        last_login: new Date('2024-01-09 17:20:00'),
        created_at: new Date(),
        updated_at: new Date()
      },
      // Partners
      {
        role: 'partner',
        username: 'hotel_riviera',
        email: 'reservas@hotelriviera.com',
        password: hashedPassword,
        phone: '+52 998 333 7777',
        is_active: true,
        is_verified: true,
        is_premium: true,
        is_searchable: true,
        last_login: new Date('2024-01-08 11:45:00'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role: 'partner',
        username: 'deportes_mx',
        email: 'ventas@deportesmx.com',
        password: hashedPassword,
        phone: '+52 55 6666 4444',
        is_active: true,
        is_verified: true,
        is_premium: false,
        is_searchable: true,
        last_login: new Date('2024-01-07 15:10:00'),
        created_at: new Date(),
        updated_at: new Date()
      },
      // State committees
      {
        role: 'state',
        username: 'estado_cdmx',
        email: 'comite@pickleballcdmx.org',
        password: hashedPassword,
        phone: '+52 55 7777 3333',
        is_active: true,
        is_verified: true,
        is_premium: true,
        is_searchable: false,
        last_login: new Date('2024-01-14 13:25:00'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role: 'state',
        username: 'estado_jalisco',
        email: 'comite@pickleballjalisco.org',
        password: hashedPassword,
        phone: '+52 33 5555 6666',
        is_active: true,
        is_verified: true,
        is_premium: true,
        is_searchable: false,
        last_login: new Date('2024-01-12 10:00:00'),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};