'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('state_committees', [
      {
        user_id: 11, // estado_cdmx
        name: 'Mexico City State Pickleball Committee',
        president_name: 'Alejandro Miguel Hernandez Lopez',
        president_title: 'President',
        rfc: 'CEP240101ABC',
        state_id: 7, // Mexico City
        logo_url: 'https://example.com/logos/comite_cdmx.jpg',
        website: 'https://pickleballcdmx.org',
        social_media: '@pickleballcdmx',
        institutional_email: 'presidente@pickleballcdmx.org',
        phone: '+52 55 7777 3333',
        affiliation_expires_at: '2024-12-31',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 12, // estado_jalisco
        name: 'Jalisco State Pickleball Committee',
        president_name: 'Patricia Elena Sanchez Rivera',
        president_title: 'President',
        rfc: 'CEJ240201XYZ',
        state_id: 15, // Jalisco
        logo_url: 'https://example.com/logos/comite_jalisco.jpg',
        website: 'https://pickleballjalisco.org',
        social_media: '@pickleballjalisco',
        institutional_email: 'presidencia@pickleballjalisco.org',
        phone: '+52 33 5555 6666',
        affiliation_expires_at: '2024-12-31',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('state_committees', null, {});
  }
};