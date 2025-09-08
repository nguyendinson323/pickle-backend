'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('courts', [
      // Courts owned by clubs
      {
        name: 'Club Azteca Courts - Polanco',
        owner_type: 'club',
        owner_id: 1, // Club Pickleball Azteca
        address: 'Av. Presidente Masaryk 250, Polanco, Ciudad de México',
        state_id: 7, // Ciudad de México
        court_count: 4,
        surface_type: 'Acrylic',
        indoor: false,
        lights: true,
        amenities: 'Changing rooms, showers, parking, rest area, cafeteria',
        description: 'Modern pickleball courts with LED lighting and high-quality surface',
        latitude: 19.43260,
        longitude: -99.19060,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Guadalajara Sports Center',
        owner_type: 'club',
        owner_id: 2, // Club Deportivo Guadalajara Pickleball
        address: 'Av. López Mateos Sur 5555, Tlaquepaque, Jalisco',
        state_id: 15, // Jalisco
        court_count: 6,
        surface_type: 'Painted concrete',
        indoor: false,
        lights: true,
        amenities: 'Changing rooms, parking, sports store, spectator area',
        description: 'Sports complex with professional pickleball courts',
        latitude: 20.60240,
        longitude: -103.31490,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Monterrey Pickleball Facilities',
        owner_type: 'club',
        owner_id: 3, // Club Pickleball Monterrey
        address: 'Av. Constitución 1000, San Pedro Garza García, Nuevo León',
        state_id: 19, // Nuevo León
        court_count: 8,
        surface_type: 'Specialized sports surface',
        indoor: true,
        lights: true,
        amenities: 'Air conditioning, premium changing rooms, spa, restaurant, pro shop',
        description: 'High-performance center with state-of-the-art covered courts',
        latitude: 25.65340,
        longitude: -100.36020,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      // Courts owned by partners (hotels/resorts)
      {
        name: 'Riviera Maya Resort Courts',
        owner_type: 'partner',
        owner_id: 1, // Hotel Riviera Maya Resort & Spa
        address: 'Carretera Chetumal-Puerto Juárez Km 250, Playa del Carmen, Quintana Roo',
        state_id: 23, // Quintana Roo
        court_count: 3,
        surface_type: 'Non-slip acrylic',
        indoor: false,
        lights: true,
        amenities: 'Beach access, sports bar, rental equipment, instructors',
        description: 'Oceanfront courts with spectacular Caribbean views',
        latitude: 20.62700,
        longitude: -87.07390,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Grupo Cancún Sports Center',
        owner_type: 'partner',
        owner_id: 3, // Grupo Hotelero Cancún
        address: 'Blvd. Kukulcán Km 14.5, Zona Hotelera, Cancún, Quintana Roo',
        state_id: 23, // Quintana Roo
        court_count: 2,
        surface_type: 'Synthetic',
        indoor: false,
        lights: true,
        amenities: 'Pool, jacuzzi, towel service, drinks included',
        description: 'Courts within the hotel complex with all-inclusive services',
        latitude: 21.13280,
        longitude: -86.74870,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Academia La Loma Sports Center',
        owner_type: 'partner',
        owner_id: 5, // Centro Deportivo La Loma
        address: 'Av. Vallarta 6503, Zapopan, Jalisco',
        state_id: 15, // Jalisco
        court_count: 5,
        surface_type: 'Professional acrylic',
        indoor: true,
        lights: true,
        amenities: 'Gym, physiotherapy, nutritionist, certified trainers',
        description: 'High-performance center focused on sports training',
        latitude: 20.72330,
        longitude: -103.41430,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      // Additional courts for comprehensive testing
      {
        name: 'Playa del Carmen Sports Complex',
        owner_type: 'club',
        owner_id: 6, // Pickleball Club Playa del Carmen
        address: 'Av. 30 Norte entre Calle 2 y 4, Playa del Carmen, Quintana Roo',
        state_id: 23, // Quintana Roo
        court_count: 3,
        surface_type: 'Specialized concrete',
        indoor: false,
        lights: true,
        amenities: 'Rest area, equipment rental, group classes',
        description: 'Outdoor courts in the heart of Playa del Carmen',
        latitude: 20.62930,
        longitude: -87.07810,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Academia Monterrey Training Center',
        owner_type: 'partner',
        owner_id: 7, // Academia de Tenis y Pickleball Monterrey
        address: 'Av. San Jerónimo 150, Colonia San Jerónimo, Monterrey, Nuevo León',
        state_id: 19, // Nuevo León
        court_count: 6,
        surface_type: 'Premium sports surface',
        indoor: true,
        lights: true,
        amenities: 'Biomechanical analysis, video analysis, personal coaching, recovery area',
        description: 'Professional training facilities with advanced technology',
        latitude: 25.67110,
        longitude: -100.33650,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      // Courts under maintenance
      {
        name: 'León Academy Courts - Under Renovation',
        owner_type: 'club',
        owner_id: 7, // León Pickleball Academy
        address: 'Blvd. Adolfo López Mateos 2105, León, Guanajuato',
        state_id: 12, // Guanajuato
        court_count: 4,
        surface_type: 'Acrylic',
        indoor: false,
        lights: true,
        amenities: 'Under renovation: new changing rooms, LED lighting, improved surface',
        description: 'Courts undergoing modernization for reopening in March 2024',
        latitude: 21.15250,
        longitude: -101.71180,
        status: 'maintenance',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('courts', null, {});
  }
};