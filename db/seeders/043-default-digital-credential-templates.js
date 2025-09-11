'use strict';

module.exports = {
  async up(queryInterface) {
    // Insert default templates
    await queryInterface.bulkInsert('digital_credential_templates', [
      {
        name: 'Player Official Card',
        type: 'player_card',
        description: 'Official federation player identification card',
        template_config: JSON.stringify({
          layout: 'standard_card',
          dimensions: { width: 800, height: 500 },
          elements: [
            { type: 'federation_logo', position: { x: 50, y: 50 } },
            { type: 'player_photo', position: { x: 600, y: 100 } },
            { type: 'player_name', position: { x: 50, y: 150 } },
            { type: 'nrtp_level', position: { x: 50, y: 200 } },
            { type: 'state', position: { x: 50, y: 250 } },
            { type: 'ranking', position: { x: 50, y: 300 } },
            { type: 'club_status', position: { x: 50, y: 350 } },
            { type: 'qr_code', position: { x: 600, y: 300 } },
            { type: 'player_id', position: { x: 50, y: 400 } },
            { type: 'expiry_date', position: { x: 400, y: 450 } }
          ]
        }),
        required_fields: JSON.stringify(['player_name', 'nrtp_level', 'state', 'player_id']),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Tournament Badge',
        type: 'tournament_badge',
        description: 'Digital badge for tournament participation',
        template_config: JSON.stringify({
          layout: 'badge',
          dimensions: { width: 400, height: 400 },
          elements: [
            { type: 'tournament_logo', position: { x: 50, y: 50 } },
            { type: 'player_name', position: { x: 50, y: 200 } },
            { type: 'tournament_name', position: { x: 50, y: 250 } },
            { type: 'achievement', position: { x: 50, y: 300 } },
            { type: 'qr_code', position: { x: 250, y: 250 } }
          ]
        }),
        required_fields: JSON.stringify(['player_name', 'tournament_name', 'achievement']),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Coach Certification',
        type: 'certification',
        description: 'Digital certificate for coaching credentials',
        template_config: JSON.stringify({
          layout: 'certificate',
          dimensions: { width: 800, height: 600 },
          elements: [
            { type: 'certification_logo', position: { x: 50, y: 50 } },
            { type: 'coach_name', position: { x: 200, y: 200 } },
            { type: 'certification_name', position: { x: 200, y: 250 } },
            { type: 'issue_date', position: { x: 200, y: 300 } },
            { type: 'expiry_date', position: { x: 200, y: 350 } },
            { type: 'qr_code', position: { x: 600, y: 400 } }
          ]
        }),
        required_fields: JSON.stringify(['coach_name', 'certification_name', 'issue_date']),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Membership Card',
        type: 'membership_card',
        description: 'Annual membership card',
        template_config: JSON.stringify({
          layout: 'membership_card',
          dimensions: { width: 600, height: 400 },
          elements: [
            { type: 'federation_logo', position: { x: 50, y: 50 } },
            { type: 'member_name', position: { x: 50, y: 150 } },
            { type: 'membership_type', position: { x: 50, y: 200 } },
            { type: 'valid_until', position: { x: 50, y: 250 } },
            { type: 'member_id', position: { x: 50, y: 300 } },
            { type: 'qr_code', position: { x: 400, y: 200 } }
          ]
        }),
        required_fields: JSON.stringify(['member_name', 'membership_type', 'valid_until']),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Remove all default templates
    await queryInterface.bulkDelete('digital_credential_templates', {
      type: {
        [Sequelize.Op.in]: ['player_card', 'tournament_badge', 'certification', 'membership_card']
      }
    }, {});
  }
};