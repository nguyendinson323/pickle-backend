'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('message_templates', [
      {
        name: 'Tournament Announcement',
        subject: 'Mexican Pickleball Tournament - {{tournament_name}}',
        body: 'Dear pickleball community members:\n\nWe are pleased to announce that registration is now open for the {{tournament_name}}, which will be held from {{start_date}} to {{end_date}} at {{venue_location}}.\n\nThis event will bring together the best players from across the country in all categories. Registration will be open from {{registration_start}} to {{registration_end}}.\n\nFor more information and registration, visit our official website.\n\nBest regards,\nMexican Pickleball Federation',
        created_by: 1, // Admin Federation user
        is_active: true,
        created_at: new Date('2024-01-15 10:00:00'),
        updated_at: new Date('2024-01-15 10:00:00')
      },
      {
        name: 'Court Maintenance Notification',
        subject: 'Court Maintenance Notice - {{court_name}}',
        body: 'Dear players and club members:\n\nWe inform you that the court {{court_name}} will be temporarily closed for maintenance from {{maintenance_start}} to {{maintenance_end}}.\n\nMaintenance activities include:\n- Surface cleaning and repair\n- Net and equipment inspection\n- Lighting system verification\n\nWe apologize for any inconvenience this may cause. Alternative courts are available at {{alternative_locations}}.\n\nThank you for your understanding.\n\nBest regards,\nCourt Management Team',
        created_by: 1, // Admin Federation user
        is_active: true,
        created_at: new Date('2024-01-20 14:30:00'),
        updated_at: new Date('2024-01-20 14:30:00')
      },
      {
        name: 'Welcome New Member',
        subject: 'Welcome to the Mexican Pickleball Federation - {{member_name}}',
        body: 'Dear {{member_name}}:\n\nWelcome to the Mexican Pickleball Federation! We are excited to have you as part of our growing community.\n\nYour membership includes:\n- Access to official tournaments\n- Training and coaching resources\n- Rankings and performance tracking\n- Access to premium courts and facilities\n- Community forums and networking events\n\nTo get started, please complete your profile and explore the available resources on our platform.\n\nIf you have any questions, our support team is here to help.\n\nWelcome to the family!\n\nBest regards,\nMexican Pickleball Federation',
        created_by: 1, // Admin Federation user
        is_active: true,
        created_at: new Date('2024-02-01 09:00:00'),
        updated_at: new Date('2024-02-01 09:00:00')
      },
      {
        name: 'Ranking Update Notification',
        subject: 'Monthly Ranking Update - {{month_year}}',
        body: 'Dear {{player_name}}:\n\nYour monthly ranking has been updated for {{month_year}}.\n\nYour current statistics:\n- Current Ranking: {{current_ranking}}\n- Previous Ranking: {{previous_ranking}}\n- Ranking Points: {{ranking_points}}\n- Matches Played: {{matches_played}}\n- Win Rate: {{win_rate}}%\n\nKeep up the excellent work! Remember that consistent participation in tournaments and training sessions will help improve your ranking.\n\nFor detailed statistics and performance analysis, visit your player dashboard.\n\nBest of luck in your upcoming matches!\n\nBest regards,\nRankings Committee',
        created_by: 1, // Admin Federation user
        is_active: true,
        created_at: new Date('2024-02-10 16:00:00'),
        updated_at: new Date('2024-02-10 16:00:00')
      },
      {
        name: 'Payment Reminder',
        subject: 'Payment Reminder - {{service_name}}',
        body: 'Dear {{member_name}}:\n\nThis is a friendly reminder that your payment for {{service_name}} is due on {{due_date}}.\n\nPayment Details:\n- Service: {{service_name}}\n- Amount: ${{amount}}\n- Due Date: {{due_date}}\n- Reference: {{reference_number}}\n\nTo avoid any interruption in services, please make your payment before the due date.\n\nYou can pay online through your member dashboard or visit any of our authorized payment centers.\n\nIf you have already made the payment, please ignore this message.\n\nThank you for your prompt attention.\n\nBest regards,\nAccounts Department',
        created_by: 1, // Admin Federation user
        is_active: true,
        created_at: new Date('2024-02-15 11:00:00'),
        updated_at: new Date('2024-02-15 11:00:00')
      },
      {
        name: 'Coach Session Confirmation',
        subject: 'Coaching Session Confirmed - {{session_date}}',
        body: 'Dear {{student_name}}:\n\nYour coaching session has been confirmed!\n\nSession Details:\n- Date: {{session_date}}\n- Time: {{session_time}}\n- Duration: {{duration}} minutes\n- Coach: {{coach_name}}\n- Location: {{court_location}}\n- Session Type: {{session_type}}\n\nPlease arrive 10 minutes early and bring:\n- Proper sports attire\n- Pickleball paddle (or use our equipment)\n- Water bottle\n- Positive attitude!\n\nIf you need to reschedule or cancel, please contact us at least 24 hours in advance.\n\nLooking forward to helping you improve your game!\n\nBest regards,\n{{coach_name}}\nCertified Pickleball Coach',
        created_by: 1, // Admin Federation user
        is_active: true,
        created_at: new Date('2024-02-20 13:30:00'),
        updated_at: new Date('2024-02-20 13:30:00')
      },
      {
        name: 'Event Registration Confirmation',
        subject: 'Registration Confirmed - {{event_name}}',
        body: 'Dear {{participant_name}}:\n\nThank you for registering for {{event_name}}!\n\nRegistration Details:\n- Event: {{event_name}}\n- Date: {{event_date}}\n- Time: {{event_time}}\n- Location: {{event_location}}\n- Registration ID: {{registration_id}}\n- Category: {{category}}\n\nImportant Information:\n- Check-in begins 30 minutes before the event\n- Please bring this confirmation email\n- Valid ID required for check-in\n- Equipment will be provided if needed\n\nFor any questions or changes to your registration, please contact our events team.\n\nWe look forward to seeing you at the event!\n\nBest regards,\nEvents Team\nMexican Pickleball Federation',
        created_by: 1, // Admin Federation user
        is_active: true,
        created_at: new Date('2024-02-25 15:00:00'),
        updated_at: new Date('2024-02-25 15:00:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('message_templates', null, {});
  }
};