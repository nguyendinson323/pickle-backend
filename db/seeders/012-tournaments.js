'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tournaments', [
      // National tournaments organized by federation
      {
        name: 'Mexico National Pickleball Championship 2024',
        description: 'The most important national tournament of the year, bringing together the best players from across the country to compete for the national title in all categories.',
        tournament_type: 'National',
        organizer_type: 'federation',
        organizer_id: 1, // Federation admin
        state_id: 7, // Ciudad de México
        venue_name: 'National Sports Talent Development Center',
        venue_address: 'Anillo Periférico Sur s/n, Jardines del Pedregal, Ciudad de México',
        start_date: '2024-03-15',
        end_date: '2024-03-17',
        registration_start: '2024-02-01',
        registration_end: '2024-03-05',
        entry_fee: 1500.00,
        max_participants: 256,
        status: 'upcoming',
        banner_url: 'https://example.com/banners/nacional_2024.jpg',
        is_ranking: true,
        ranking_multiplier: 2.0,
        created_at: new Date('2024-01-15 10:00:00'),
        updated_at: new Date('2024-02-10 14:30:00')
      },
      {
        name: 'National Youth Pickleball Tournament',
        description: 'National competition dedicated to players under 18 years old, promoting pickleball development in new generations.',
        tournament_type: 'National Youth',
        organizer_type: 'federation',
        organizer_id: 1, // Federation admin
        state_id: 15, // Jalisco
        venue_name: 'Revolucion Sports Complex',
        venue_address: 'Av. Patria 1800, Zapopan, Jalisco',
        start_date: '2024-04-20',
        end_date: '2024-04-21',
        registration_start: '2024-03-01',
        registration_end: '2024-04-10',
        entry_fee: 800.00,
        max_participants: 128,
        status: 'upcoming',
        banner_url: 'https://example.com/banners/juvenil_2024.jpg',
        is_ranking: true,
        ranking_multiplier: 1.5,
        created_at: new Date('2024-02-01 09:30:00'),
        updated_at: new Date('2024-02-12 11:15:00')
      },
      
      // State tournaments
      {
        name: 'Mexico City Pickleball Open 2024',
        description: 'State tournament that brings together the best players from the capital and metropolitan area in a high-level competition.',
        tournament_type: 'State',
        organizer_type: 'state',
        organizer_id: 1, // Comité CDMX
        state_id: 7, // Ciudad de México
        venue_name: 'Club Azteca Courts',
        venue_address: 'Av. Presidente Masaryk 250, Polanco, Ciudad de México',
        start_date: '2024-02-24',
        end_date: '2024-02-25',
        registration_start: '2024-01-20',
        registration_end: '2024-02-18',
        entry_fee: 950.00,
        max_participants: 96,
        status: 'upcoming',
        banner_url: 'https://example.com/banners/cdmx_2024.jpg',
        is_ranking: true,
        ranking_multiplier: 1.3,
        created_at: new Date('2024-01-18 14:45:00'),
        updated_at: new Date('2024-02-14 16:20:00')
      },
      {
        name: 'Jalisco Pickleball Cup',
        description: 'Traditional Jalisco state tournament, known for its excellent organization and fierce competition among the best in the state.',
        tournament_type: 'State',
        organizer_type: 'state',
        organizer_id: 2, // Comité Jalisco
        state_id: 15, // Jalisco
        venue_name: 'Guadalajara Sports Center',
        venue_address: 'Av. López Mateos Sur 5555, Tlaquepaque, Jalisco',
        start_date: '2024-03-02',
        end_date: '2024-03-03',
        registration_start: '2024-02-01',
        registration_end: '2024-02-25',
        entry_fee: 850.00,
        max_participants: 80,
        status: 'upcoming',
        banner_url: 'https://example.com/banners/jalisco_2024.jpg',
        is_ranking: true,
        ranking_multiplier: 1.3,
        created_at: new Date('2024-01-25 12:00:00'),
        updated_at: new Date('2024-02-13 09:40:00')
      },
      {
        name: 'Nuevo León State Championship Tournament',
        description: 'The most prestigious event in regiomontano pickleball, attracting elite players from the northeast of the country.',
        tournament_type: 'State',
        organizer_type: 'state',
        organizer_id: 3, // Comité Nuevo León
        state_id: 19, // Nuevo León
        venue_name: 'Monterrey Pickleball Facilities',
        venue_address: 'Av. Constitución 1000, San Pedro Garza García, Nuevo León',
        start_date: '2024-04-06',
        end_date: '2024-04-07',
        registration_start: '2024-03-10',
        registration_end: '2024-03-30',
        entry_fee: 1200.00,
        max_participants: 72,
        status: 'upcoming',
        banner_url: 'https://example.com/banners/nl_2024.jpg',
        is_ranking: true,
        ranking_multiplier: 1.3,
        created_at: new Date('2024-02-08 15:30:00'),
        updated_at: new Date('2024-02-14 10:45:00')
      },
      
      // Club tournaments
      {
        name: 'Club Azteca Internal Tournament - Spring 2024',
        description: 'Monthly internal club tournament, open to members and special guests. Competitive but friendly atmosphere.',
        tournament_type: 'Local',
        organizer_type: 'club',
        organizer_id: 1, // Club Azteca
        state_id: 7, // Ciudad de México
        venue_name: 'Club Azteca Courts',
        venue_address: 'Av. Presidente Masaryk 250, Polanco, Ciudad de México',
        start_date: '2024-02-17',
        end_date: '2024-02-17',
        registration_start: '2024-02-01',
        registration_end: '2024-02-15',
        entry_fee: 350.00,
        max_participants: 32,
        status: 'ongoing',
        banner_url: 'https://example.com/banners/azteca_primavera.jpg',
        is_ranking: false,
        ranking_multiplier: 1.0,
        created_at: new Date('2024-01-28 11:20:00'),
        updated_at: new Date('2024-02-14 18:00:00')
      },
      {
        name: 'Guadalajara Club Opening Cup',
        description: 'Traditional club opening tournament, marking the beginning of the competitive season.',
        tournament_type: 'Local',
        organizer_type: 'club',
        organizer_id: 2, // Club Guadalajara
        state_id: 15, // Jalisco
        venue_name: 'Guadalajara Sports Center',
        venue_address: 'Av. López Mateos Sur 5555, Tlaquepaque, Jalisco',
        start_date: '2024-01-27',
        end_date: '2024-01-28',
        registration_start: '2024-01-05',
        registration_end: '2024-01-22',
        entry_fee: 300.00,
        max_participants: 48,
        status: 'completed',
        banner_url: 'https://example.com/banners/gdl_apertura.jpg',
        is_ranking: false,
        ranking_multiplier: 1.0,
        created_at: new Date('2024-01-03 09:15:00'),
        updated_at: new Date('2024-01-29 20:30:00')
      },
      
      // Resort/Partner tournaments
      {
        name: 'Riviera Maya Open - Beach Tournament',
        description: 'Unique tournament that combines high-level pickleball with the paradisiacal atmosphere of the Mexican Caribbean.',
        tournament_type: 'Resort',
        organizer_type: 'partner',
        organizer_id: 1, // Hotel Riviera Maya
        state_id: 23, // Quintana Roo
        venue_name: 'Riviera Maya Resort Courts',
        venue_address: 'Carretera Chetumal-Puerto Juárez Km 250, Playa del Carmen, Quintana Roo',
        start_date: '2024-03-22',
        end_date: '2024-03-24',
        registration_start: '2024-02-15',
        registration_end: '2024-03-15',
        entry_fee: 2200.00,
        max_participants: 64,
        status: 'upcoming',
        banner_url: 'https://example.com/banners/riviera_open.jpg',
        is_ranking: true,
        ranking_multiplier: 1.2,
        created_at: new Date('2024-02-10 13:45:00'),
        updated_at: new Date('2024-02-14 14:50:00')
      },
      {
        name: 'Cancún International Pickleball Championship',
        description: 'International tournament that attracts players from the United States, Canada and Mexico in a first-level competition.',
        tournament_type: 'International',
        organizer_type: 'partner',
        organizer_id: 3, // Grupo Hotelero Cancún
        state_id: 23, // Quintana Roo
        venue_name: 'Grupo Cancún Sports Center',
        venue_address: 'Blvd. Kukulcán Km 14.5, Zona Hotelera, Cancún, Quintana Roo',
        start_date: '2024-05-10',
        end_date: '2024-05-12',
        registration_start: '2024-04-01',
        registration_end: '2024-05-01',
        entry_fee: 2800.00,
        max_participants: 128,
        status: 'upcoming',
        banner_url: 'https://example.com/banners/cancun_international.jpg',
        is_ranking: true,
        ranking_multiplier: 1.8,
        created_at: new Date('2024-02-12 16:00:00'),
        updated_at: new Date('2024-02-14 12:15:00')
      },
      
      // Recently completed tournament
      {
        name: 'CDMX Winter Cup 2024',
        description: 'Winter season tournament that successfully concluded the competitive activity of the first two months of the year.',
        tournament_type: 'Regional',
        organizer_type: 'state',
        organizer_id: 1, // Comité CDMX
        state_id: 7, // Ciudad de México
        venue_name: 'Club Azteca Courts',
        venue_address: 'Av. Presidente Masaryk 250, Polanco, Ciudad de México',
        start_date: '2024-01-20',
        end_date: '2024-01-21',
        registration_start: '2024-01-01',
        registration_end: '2024-01-15',
        entry_fee: 750.00,
        max_participants: 60,
        status: 'completed',
        banner_url: 'https://example.com/banners/invierno_cdmx.jpg',
        is_ranking: true,
        ranking_multiplier: 1.1,
        created_at: new Date('2023-12-28 10:30:00'),
        updated_at: new Date('2024-01-22 17:45:00')
      },
      
      // Canceled tournament
      {
        name: 'Pro-Health Charity Tournament 2024',
        description: 'Charity tournament canceled due to adverse weather conditions. Will be rescheduled soon.',
        tournament_type: 'Charity',
        organizer_type: 'club',
        organizer_id: 2, // Club Guadalajara
        state_id: 15, // Jalisco
        venue_name: 'Guadalajara Sports Center',
        venue_address: 'Av. López Mateos Sur 5555, Tlaquepaque, Jalisco',
        start_date: '2024-02-10',
        end_date: '2024-02-11',
        registration_start: '2024-01-25',
        registration_end: '2024-02-05',
        entry_fee: 500.00,
        max_participants: 40,
        status: 'canceled',
        banner_url: 'https://example.com/banners/benefico_salud.jpg',
        is_ranking: false,
        ranking_multiplier: 1.0,
        created_at: new Date('2024-01-22 14:20:00'),
        updated_at: new Date('2024-02-09 08:45:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tournaments', null, {});
  }
};