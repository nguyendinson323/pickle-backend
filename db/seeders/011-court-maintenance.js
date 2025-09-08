'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('court_maintenance', [
      // Completed maintenance records
      {
        court_id: 1, // Club Azteca Courts - Polanco
        maintenance_type: 'Surface Maintenance',
        description: 'Court line resealing and painting, minor crack repair on acrylic surface',
        start_date: '2024-01-15',
        end_date: '2024-01-17',
        status: 'completed',
        created_by: 1, // admin_mexico
        created_at: new Date('2024-01-10 09:00:00'),
        updated_at: new Date('2024-01-18 16:30:00')
      },
      {
        court_id: 2, // Guadalajara Sports Center
        maintenance_type: 'Lighting System',
        description: 'Replacement of 8 LED fixtures, installation of new automatic control systems',
        start_date: '2024-01-22',
        end_date: '2024-01-24',
        status: 'completed',
        created_by: 8, // club_guadalajara
        created_at: new Date('2024-01-18 14:20:00'),
        updated_at: new Date('2024-01-25 11:45:00')
      },
      {
        court_id: 3, // Monterrey Pickleball Facilities
        maintenance_type: 'Ventilation System',
        description: 'HVAC system preventive maintenance, duct cleaning and filter replacement',
        start_date: '2024-01-08',
        end_date: '2024-01-09',
        status: 'completed',
        created_by: 1, // admin_mexico
        created_at: new Date('2024-01-05 08:30:00'),
        updated_at: new Date('2024-01-10 17:00:00')
      },
      
      // Currently in progress maintenance
      {
        court_id: 9, // León Academy Courts - Under Renovation
        maintenance_type: 'Complete Renovation',
        description: 'Complete court renovation: new specialized sports surface, drainage system, LED lighting, changing rooms and spectator area',
        start_date: '2024-02-01',
        end_date: '2024-03-15',
        status: 'in_progress',
        created_by: 1, // admin_mexico
        created_at: new Date('2024-01-25 10:15:00'),
        updated_at: new Date('2024-02-14 14:22:00')
      },
      {
        court_id: 6, // Academia La Loma Sports Center
        maintenance_type: 'Monthly Preventive Maintenance',
        description: 'Deep surface cleaning, net inspection, air conditioning equipment maintenance',
        start_date: '2024-02-12',
        end_date: '2024-02-13',
        status: 'in_progress',
        created_by: 1, // admin_mexico
        created_at: new Date('2024-02-08 16:45:00'),
        updated_at: new Date('2024-02-12 08:00:00')
      },
      
      // Scheduled future maintenance
      {
        court_id: 4, // Riviera Maya Resort Courts
        maintenance_type: 'Seasonal Maintenance',
        description: 'Pre-high season maintenance: complete facilities inspection, painting, storm drainage cleaning',
        start_date: '2024-02-26',
        end_date: '2024-02-28',
        status: 'scheduled',
        created_by: 9, // hotel_riviera
        created_at: new Date('2024-02-14 13:30:00'),
        updated_at: new Date('2024-02-14 13:30:00')
      },
      {
        court_id: 5, // Grupo Cancún Sports Center
        maintenance_type: 'Net Repair',
        description: 'Replacement of nets worn by sun exposure and marine wind, tension adjustment',
        start_date: '2024-02-20',
        end_date: '2024-02-20',
        status: 'scheduled',
        created_by: 1, // admin_mexico
        created_at: new Date('2024-02-14 11:00:00'),
        updated_at: new Date('2024-02-14 11:00:00')
      },
      {
        court_id: 1, // Club Azteca Courts - Polanco
        maintenance_type: 'Quarterly Maintenance',
        description: 'Scheduled quarterly inspection: structural inspection, changing room maintenance, electrical review',
        start_date: '2024-03-01',
        end_date: '2024-03-02',
        status: 'scheduled',
        created_by: 7, // club_azteca
        created_at: new Date('2024-02-14 09:15:00'),
        updated_at: new Date('2024-02-14 09:15:00')
      },
      
      // Emergency maintenance completed
      {
        court_id: 7, // Playa del Carmen Sports Complex
        maintenance_type: 'Emergency Repair',
        description: 'Urgent repair of clogged drainage system after heavy rain, flood prevention',
        start_date: '2024-02-05',
        end_date: '2024-02-06',
        status: 'completed',
        created_by: 1, // admin_mexico
        created_at: new Date('2024-02-05 06:30:00'),
        updated_at: new Date('2024-02-07 12:00:00')
      },
      {
        court_id: 8, // Academia Monterrey Training Center
        maintenance_type: 'Electrical System Repair',
        description: 'Short circuit repair in main panel, replacement of damaged switches',
        start_date: '2024-01-28',
        end_date: '2024-01-29',
        status: 'completed',
        created_by: 1, // admin_mexico
        created_at: new Date('2024-01-27 15:45:00'),
        updated_at: new Date('2024-01-30 08:20:00')
      },
      
      // Seasonal maintenance scheduled
      {
        court_id: 2, // Guadalajara Sports Center
        maintenance_type: 'Rainy Season Preparation',
        description: 'Gutter cleaning, roof waterproofing, drainage system inspection',
        start_date: '2024-04-15',
        end_date: '2024-04-17',
        status: 'scheduled',
        created_by: 8, // club_guadalajara
        created_at: new Date('2024-02-14 17:30:00'),
        updated_at: new Date('2024-02-14 17:30:00')
      },
      {
        court_id: 3, // Monterrey Pickleball Facilities
        maintenance_type: 'Equipment Calibration',
        description: 'Annual air conditioning system calibration, automatic sensor inspection, software updates',
        start_date: '2024-03-10',
        end_date: '2024-03-11',
        status: 'scheduled',
        created_by: 1, // admin_mexico
        created_at: new Date('2024-02-14 12:45:00'),
        updated_at: new Date('2024-02-14 12:45:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('court_maintenance', null, {});
  }
};