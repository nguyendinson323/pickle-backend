'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('clubs', [
      {
        user_id: 7, // club_azteca
        name: 'Club Pickleball Azteca',
        rfc: 'CPA240101ABC',
        manager_name: 'Roberto Carlos Mendez Vega',
        manager_title: 'General Manager',
        state_id: 7, // Mexico City
        club_type: 'Sports',
        website: 'https://clubazteca.com',
        social_media: '@clubpickleballazteca',
        logo_url: 'https://example.com/logos/club_azteca.jpg',
        has_courts: true,
        premium_expires_at: '2024-12-31',
        affiliation_expires_at: '2024-12-31',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 8, // club_guadalajara
        name: 'Club Deportivo Guadalajara Pickleball',
        rfc: 'CDG240201XYZ',
        manager_name: 'Maria Elena Rodriguez Hernandez',
        manager_title: 'Sports Director',
        state_id: 15, // Jalisco
        club_type: 'Sports',
        website: 'https://clubguadalajara.com',
        social_media: '@pickleballgdl',
        logo_url: 'https://example.com/logos/club_guadalajara.jpg',
        has_courts: true,
        premium_expires_at: null,
        affiliation_expires_at: '2024-08-31',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('clubs', null, {});
  }
};