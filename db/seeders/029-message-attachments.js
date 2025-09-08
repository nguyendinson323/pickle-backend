'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('message_attachments', [
      // Message 1: National Championship Call - Attachments
      {
        message_id: 1,
        file_name: 'National_Championship_2024_Call.pdf',
        file_url: 'https://example.com/attachments/national_championship_2024.pdf',
        file_type: 'application/pdf',
        file_size: 2456789,
        created_at: new Date('2024-01-20 09:00:00')
      },
      {
        message_id: 1,
        file_name: 'National_Tournament_Rules.pdf',
        file_url: 'https://example.com/attachments/national_tournament_rules.pdf',
        file_type: 'application/pdf',
        file_size: 1834560,
        created_at: new Date('2024-01-20 09:00:00')
      },
      {
        message_id: 1,
        file_name: 'National_Registration_Form.pdf',
        file_url: 'https://example.com/attachments/national_registration_form.pdf',
        file_type: 'application/pdf',
        file_size: 987432,
        created_at: new Date('2024-01-20 09:00:00')
      },
      
      // Message 2: New Regulations - Attachments
      {
        message_id: 2,
        file_name: 'New_Pickleball_Regulations_2024.pdf',
        file_url: 'https://example.com/attachments/new_regulations_2024.pdf',
        file_type: 'application/pdf',
        file_size: 3245876,
        created_at: new Date('2024-02-08 14:30:00')
      },
      {
        message_id: 2,
        file_name: 'Regulatory_Changes_Guide.pdf',
        file_url: 'https://example.com/attachments/regulatory_changes_guide.pdf',
        file_type: 'application/pdf',
        file_size: 1567890,
        created_at: new Date('2024-02-08 14:30:00')
      },
      {
        message_id: 2,
        file_name: 'Paddle_Specifications_2024.pdf',
        file_url: 'https://example.com/attachments/paddle_specifications_2024.pdf',
        file_type: 'application/pdf',
        file_size: 876543,
        created_at: new Date('2024-02-08 14:30:00')
      },
      
      // Message 4: Maria's Confirmation - Attachment
      {
        message_id: 4,
        file_name: 'Payment_Receipt_Maria_Gonzalez.pdf',
        file_url: 'https://example.com/attachments/payment_receipt_maria_gonzalez.pdf',
        file_type: 'application/pdf',
        file_size: 234567,
        created_at: new Date('2024-02-05 11:20:00')
      },
      
      // Message 8: Sofia's Clinic - Attachments
      {
        message_id: 8,
        file_name: 'Pickleball_Fundamentals_Manual.pdf',
        file_url: 'https://example.com/attachments/pickleball_fundamentals_manual.pdf',
        file_type: 'application/pdf',
        file_size: 4567890,
        created_at: new Date('2024-02-15 10:20:00')
      },
      {
        message_id: 8,
        file_name: 'March_2024_Clinic_Program.pdf',
        file_url: 'https://example.com/attachments/march_2024_clinic_program.pdf',
        file_type: 'application/pdf',
        file_size: 678901,
        created_at: new Date('2024-02-15 10:20:00')
      },
      {
        message_id: 8,
        file_name: 'Basic_Pickleball_Exercises.mp4',
        file_url: 'https://example.com/attachments/basic_pickleball_exercises.mp4',
        file_type: 'video/mp4',
        file_size: 45678901,
        created_at: new Date('2024-02-15 10:20:00')
      },
      
      // Message 9: CDMX Committee Results - Attachments
      {
        message_id: 9,
        file_name: 'Official_Results_CDMX_Winter_Cup_2024.pdf',
        file_url: 'https://example.com/attachments/results_cdmx_winter_cup_2024.pdf',
        file_type: 'application/pdf',
        file_size: 1456789,
        created_at: new Date('2024-01-22 18:00:00')
      },
      {
        message_id: 9,
        file_name: 'Tournament_Statistics_Winter_Cup.xlsx',
        file_url: 'https://example.com/attachments/statistics_tournament_winter_cup.xlsx',
        file_type: 'application/vnd.ms-excel', // Shortened to fit varchar(50)
        file_size: 567890,
        created_at: new Date('2024-01-22 18:00:00')
      },
      {
        message_id: 9,
        file_name: 'Awards_Ceremony_Photos_Winter_Cup.zip',
        file_url: 'https://example.com/attachments/photos_awards_winter_cup.zip',
        file_type: 'application/zip',
        file_size: 23456789,
        created_at: new Date('2024-01-22 18:00:00')
      },
      {
        message_id: 9,
        file_name: 'Updated_Ranking_Points.pdf',
        file_url: 'https://example.com/attachments/updated_ranking_points.pdf',
        file_type: 'application/pdf',
        file_size: 789012,
        created_at: new Date('2024-01-22 18:00:00')
      },
      
      // Message 10: Riviera Hotel Invitation - Attachments
      {
        message_id: 10,
        file_name: 'Riviera_Maya_Open_2024_Brochure.pdf',
        file_url: 'https://example.com/attachments/riviera_maya_open_2024_brochure.pdf',
        file_type: 'application/pdf',
        file_size: 5678901,
        created_at: new Date('2024-02-12 12:30:00')
      },
      {
        message_id: 10,
        file_name: 'Resort_Facilities_Map.pdf',
        file_url: 'https://example.com/attachments/resort_facilities_map.pdf',
        file_type: 'application/pdf',
        file_size: 1234567,
        created_at: new Date('2024-02-12 12:30:00')
      },
      {
        message_id: 10,
        file_name: 'Riviera_Maya_Open_Promo_Video.mp4',
        file_url: 'https://example.com/attachments/riviera_maya_open_promo_video.mp4',
        file_type: 'video/mp4',
        file_size: 78901234,
        created_at: new Date('2024-02-12 12:30:00')
      },
      {
        message_id: 10,
        file_name: 'Riviera_Maya_Reservation_Form.pdf',
        file_url: 'https://example.com/attachments/riviera_maya_reservation_form.pdf',
        file_type: 'application/pdf',
        file_size: 456789,
        created_at: new Date('2024-02-12 12:30:00')
      },
      {
        message_id: 10,
        file_name: 'Resort_Photo_Gallery.zip',
        file_url: 'https://example.com/attachments/resort_photo_gallery.zip',
        file_type: 'application/zip',
        file_size: 34567890,
        created_at: new Date('2024-02-12 12:30:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('message_attachments', null, {});
  }
};