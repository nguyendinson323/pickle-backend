'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('players', [
      {
        user_id: 2, // maria_gonzalez
        full_name: 'Maria Elena Gonzalez Hernandez',
        birth_date: '1995-03-15',
        gender: 'Female',
        state_id: 7, // Mexico City
        curp: 'GOHM950315MDFNRR01',
        nrtp_level: 3.5,
        profile_photo_url: 'https://example.com/photos/maria.jpg',
        id_document_url: 'https://example.com/documents/maria_id.pdf',
        nationality: 'Mexico',
        club_id: null,
        ranking_position: 45,
        affiliation_expires_at: '2024-12-31',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 3, // carlos_rodriguez
        full_name: 'Carlos Antonio Rodriguez Lopez',
        birth_date: '1988-07-22',
        gender: 'Male',
        state_id: 15, // Jalisco
        curp: 'ROLC880722HJCLPR03',
        nrtp_level: 4.2,
        profile_photo_url: 'https://example.com/photos/carlos.jpg',
        id_document_url: 'https://example.com/documents/carlos_id.pdf',
        nationality: 'Mexico',
        club_id: null,
        ranking_position: 12,
        affiliation_expires_at: '2024-12-31',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 4, // ana_martinez
        full_name: 'Ana Sofia Martinez Ruiz',
        birth_date: '2001-11-08',
        gender: 'Female',
        state_id: 19, // Nuevo Leon
        curp: 'MARA011108MNLRZN02',
        nrtp_level: 2.8,
        profile_photo_url: null,
        id_document_url: 'https://example.com/documents/ana_id.pdf',
        nationality: 'Mexico',
        club_id: null,
        ranking_position: null,
        affiliation_expires_at: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('players', null, {});
  }
};