'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create sample digital credentials for the first player (Maria)
    await queryInterface.bulkInsert('digital_credentials', [
      {
        player_id: 1, // Maria's player ID
        credential_type: 'player_card',
        title: 'Official Player Card',
        description: 'Official federation player identification card',
        issue_date: new Date('2024-01-15'),
        expiry_date: new Date('2025-01-15'),
        qr_code_data: 'sample-qr-code-data-player-card-1',
        qr_code_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        metadata: JSON.stringify({
          player_name: 'Maria Elena Gonzalez Hernandez',
          nrtp_level: '3.5',
          state: 'Mexico City',
          player_id: '000001'
        }),
        is_active: true,
        verification_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        player_id: 1,
        credential_type: 'membership_card',
        title: 'Annual Membership Card',
        description: 'Valid membership card for 2024',
        issue_date: new Date('2024-01-01'),
        expiry_date: new Date('2024-12-31'),
        qr_code_data: 'sample-qr-code-data-membership-1',
        qr_code_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        metadata: JSON.stringify({
          member_name: 'Maria Elena Gonzalez Hernandez',
          membership_type: 'Annual',
          valid_until: '2024-12-31'
        }),
        is_active: true,
        verification_count: 3,
        last_verified_at: new Date('2024-01-10'),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('digital_credentials', null, {});
  }
};