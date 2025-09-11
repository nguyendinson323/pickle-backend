'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('microsites', [
      {
        owner_id: 1,
        owner_type: 'club',
        template_id: 1,
        subdomain: 'club-pickleball-mexico',
        title: 'Club Pickleball México',
        description: 'Official website for Club Pickleball México - Premier pickleball training and tournaments.',
        logo_url: null,
        banner_url: null,
        primary_color: '#3B82F6',
        secondary_color: '#1E40AF',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        owner_id: 2,
        owner_type: 'club',
        template_id: 1,
        subdomain: 'elite-pickleball-club',
        title: 'Elite Pickleball Club',
        description: 'Training center for professional pickleball players.',
        logo_url: null,
        banner_url: null,
        primary_color: '#10B981',
        secondary_color: '#059669',
        is_active: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        owner_id: 1,
        owner_type: 'partner',
        template_id: 1,
        subdomain: 'sports-equipment-partner',
        title: 'Sports Equipment México',
        description: 'Premium pickleball equipment and accessories supplier.',
        logo_url: null,
        banner_url: null,
        primary_color: '#F59E0B',
        secondary_color: '#D97706',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        owner_id: 1,
        owner_type: 'state',
        template_id: 1,
        subdomain: 'cdmx-pickleball',
        title: 'Ciudad de México Pickleball',
        description: 'Official state committee website for Mexico City pickleball.',
        logo_url: null,
        banner_url: null,
        primary_color: '#8B5CF6',
        secondary_color: '#7C3AED',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        owner_id: 3,
        owner_type: 'club',
        template_id: 1,
        subdomain: null,
        title: 'Pending Club Website',
        description: 'New club waiting for approval.',
        logo_url: null,
        banner_url: null,
        primary_color: '#EF4444',
        secondary_color: '#DC2626',
        is_active: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('microsites', null, {});
  }
};
