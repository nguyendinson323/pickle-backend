'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('partners', [
      {
        user_id: 9, // hotel_riviera
        business_name: 'Hotel Riviera Maya Resort & Spa',
        rfc: 'HRM240101ABC',
        contact_name: 'Fernando Jose Castillo Moreno',
        contact_title: 'Sports Director',
        partner_type: 'Hotel',
        state_id: 23, // Quintana Roo
        website: 'https://hotelriviera.com',
        social_media: '@hotelrivieramaya',
        logo_url: 'https://example.com/logos/hotel_riviera.jpg',
        has_courts: true,
        premium_expires_at: '2024-12-31',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 10, // deportes_mx
        business_name: 'Deportes Mexico Sports Equipment',
        rfc: 'DMX240201XYZ',
        contact_name: 'Ricardo Alejandro Gomez Perez',
        contact_title: 'Sales Manager',
        partner_type: 'Supplier',
        state_id: 7, // Mexico City
        website: 'https://deportesmx.com',
        social_media: '@deportesmx',
        logo_url: 'https://example.com/logos/deportes_mx.jpg',
        has_courts: false,
        premium_expires_at: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('partners', null, {});
  }
};