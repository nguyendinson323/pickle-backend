'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('coaches', [
      {
        user_id: 5, // coach_miguel
        full_name: 'Miguel Angel Fernandez Castro',
        birth_date: '1975-09-12',
        gender: 'Male',
        state_id: 7, // Mexico City
        curp: 'FECM750912HDFRNL06',
        nrtp_level: 4.8,
        profile_photo_url: 'https://example.com/photos/miguel_coach.jpg',
        id_document_url: 'https://example.com/documents/miguel_coach_id.pdf',
        hourly_rate: 850.00,
        affiliation_expires_at: '2024-12-31',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 6, // coach_sofia
        full_name: 'Sofia Isabel Ramirez Mendoza',
        birth_date: '1982-04-28',
        gender: 'Female',
        state_id: 15, // Jalisco
        curp: 'RAMS820428MJCMNF07',
        nrtp_level: 4.5,
        profile_photo_url: 'https://example.com/photos/sofia_coach.jpg',
        id_document_url: 'https://example.com/documents/sofia_coach_id.pdf',
        hourly_rate: 750.00,
        affiliation_expires_at: '2024-12-31',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('coaches', null, {});
  }
};