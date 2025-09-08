'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('documents', [
      // Official Federation documents (admin_federation - user_id: 1)
      {
        owner_id: 1,
        title: 'Official Mexican Pickleball Rules 2024',
        description: 'Official document containing all rules and regulations for pickleball practice in Mexico, updated for the 2024 season.',
        document_url: 'https://example.com/documents/reglamento_oficial_pickleball_mexico_2024.pdf',
        file_type: 'application/pdf',
        is_public: true,
        created_at: new Date('2024-01-15 09:00:00')
      },
      {
        owner_id: 1,
        title: 'Certified Referee Manual',
        description: 'Complete guide for pickleball referees including procedures, signals and evaluation criteria for official competitions.',
        document_url: 'https://example.com/documents/manual_arbitro_certificado.pdf',
        file_type: 'application/pdf',
        is_public: true,
        created_at: new Date('2024-01-20 14:30:00')
      },
      {
        owner_id: 1,
        title: 'Sports Code of Conduct',
        description: 'Behavioral norms and sports ethics that all participants in official pickleball events must follow.',
        document_url: 'https://example.com/documents/codigo_conducta_deportiva.pdf',
        file_type: 'application/pdf',
        is_public: true,
        created_at: new Date('2024-01-10 11:15:00')
      },
      {
        owner_id: 1,
        title: 'Court Technical Specifications',
        description: 'Technical document with official measurements, recommended materials and construction standards for pickleball courts.',
        document_url: 'https://example.com/documents/especificaciones_tecnicas_canchas.pdf',
        file_type: 'application/pdf',
        is_public: true,
        created_at: new Date('2024-02-01 16:45:00')
      },
      
      // Coach documents
      {
        owner_id: 5, // coach_miguel
        title: 'Advanced Technical Training Program',
        description: '12-week training plan designed for intermediate players looking to improve their game technique and tactics.',
        document_url: 'https://example.com/documents/programa_entrenamiento_tecnico_avanzado.pdf',
        file_type: 'application/pdf',
        is_public: false,
        created_at: new Date('2024-01-25 10:30:00')
      },
      {
        owner_id: 5, // coach_miguel
        title: 'Physical Conditioning Exercise Guide',
        description: 'Collection of specific exercises to develop the physical conditioning necessary for competitive pickleball.',
        document_url: 'https://example.com/documents/guia_ejercicios_preparacion_fisica.pdf',
        file_type: 'application/pdf',
        is_public: true,
        created_at: new Date('2024-02-05 13:20:00')
      },
      {
        owner_id: 6, // coach_sofia
        title: 'Pickleball Fundamentals for Beginners',
        description: 'Illustrated manual with basic pickleball concepts, ideal for new players and beginner instructors.',
        document_url: 'https://example.com/documents/fundamentos_pickleball_principiantes.pdf',
        file_type: 'application/pdf',
        is_public: true,
        created_at: new Date('2024-01-30 15:45:00')
      },
      {
        owner_id: 6, // coach_sofia
        title: 'Group Teaching Methodology',
        description: 'Pedagogical strategies and techniques for teaching pickleball effectively in group classes.',
        document_url: 'https://example.com/documents/metodologia_ensenanza_grupal.pdf',
        file_type: 'application/pdf',
        is_public: false,
        created_at: new Date('2024-02-12 11:10:00')
      },
      
      // Club documents
      {
        owner_id: 7, // club_azteca
        title: 'Club Azteca Internal Regulations',
        description: 'Club internal regulations, schedules, facility usage policies and member code of conduct.',
        document_url: 'https://example.com/documents/reglamento_interno_club_azteca.pdf',
        file_type: 'application/pdf',
        is_public: false,
        created_at: new Date('2024-01-15 12:00:00')
      },
      {
        owner_id: 7, // club_azteca
        title: 'Rates and Memberships 2024',
        description: 'Updated price list for memberships, classes, court rental and special events.',
        document_url: 'https://example.com/documents/tarifas_membresias_2024.pdf',
        file_type: 'application/pdf',
        is_public: true,
        created_at: new Date('2024-01-20 09:30:00')
      },
      {
        owner_id: 8, // club_guadalajara
        title: 'Guadalajara Sports Club History',
        description: 'Historical document narrating the founding and evolution of the most traditional pickleball club in Jalisco.',
        document_url: 'https://example.com/documents/historia_club_guadalajara.pdf',
        file_type: 'application/pdf',
        is_public: true,
        created_at: new Date('2024-02-08 14:20:00')
      },
      
      // Partner documents
      {
        owner_id: 9, // hotel_riviera
        title: 'Pickleball Paradise Experience Brochure',
        description: 'Detailed promotional material about the pickleball experience in Riviera Maya, including packages and services.',
        document_url: 'https://example.com/documents/brochure_pickleball_paradise.pdf',
        file_type: 'application/pdf',
        is_public: true,
        created_at: new Date('2024-02-01 16:30:00')
      },
      {
        owner_id: 10, // deportes_mx
        title: 'Pickleball Equipment Catalog 2024',
        description: 'Complete catalog of paddles, balls, sportswear and accessories for pickleball with wholesale and retail prices.',
        document_url: 'https://example.com/documents/catalogo_equipamiento_pickleball_2024.pdf',
        file_type: 'application/pdf',
        is_public: true,
        created_at: new Date('2024-01-28 11:45:00')
      },
      
      // State committee documents
      {
        owner_id: 11, // estado_cdmx
        title: 'Mexico City Pickleball Development Plan 2024-2025',
        description: 'Comprehensive strategy for the growth and development of pickleball in Mexico City during the 2024-2025 biennium.',
        document_url: 'https://example.com/documents/plan_desarrollo_pickleball_cdmx_2024_2025.pdf',
        file_type: 'application/pdf',
        is_public: true,
        created_at: new Date('2024-01-12 10:15:00')
      },
      {
        owner_id: 11, // estado_cdmx
        title: 'Mexico City Affiliated Clubs Directory',
        description: 'Updated list of all pickleball clubs affiliated with the state committee with contact information and services.',
        document_url: 'https://example.com/documents/directorio_clubes_afiliados_cdmx.pdf',
        file_type: 'application/pdf',
        is_public: true,
        created_at: new Date('2024-02-10 13:40:00')
      },
      {
        owner_id: 12, // estado_jalisco
        title: 'Official Jalisco Tournament Calendar 2024',
        description: 'Complete schedule of all official pickleball tournaments to be held in Jalisco during 2024.',
        document_url: 'https://example.com/documents/calendario_torneos_jalisco_2024.pdf',
        file_type: 'application/pdf',
        is_public: true,
        created_at: new Date('2024-01-18 15:25:00')
      },
      
      // Educational and player documents
      {
        owner_id: 2, // maria_gonzalez
        title: 'My Personal Training Diary',
        description: 'Personal record of training sessions, goals and progress in development as a pickleball player.',
        document_url: 'https://example.com/documents/diario_entrenamiento_maria.pdf',
        file_type: 'application/pdf',
        is_public: false,
        created_at: new Date('2024-01-22 18:30:00')
      },
      {
        owner_id: 3, // carlos_rodriguez
        title: 'Technical Analysis of My Matches',
        description: 'Self-assessment document with analysis of strengths, weaknesses and strategies to improve competitive performance.',
        document_url: 'https://example.com/documents/analisis_tecnico_carlos.pdf',
        file_type: 'application/pdf',
        is_public: false,
        created_at: new Date('2024-02-15 20:45:00')
      },
      
      // Additional documents for greater diversity
      {
        owner_id: 1, // admin_federation
        title: 'COVID-19 Safety and Hygiene Protocol',
        description: 'Sanitary measures and safety protocols for safe pickleball practice during the pandemic.',
        document_url: 'https://example.com/documents/protocolo_seguridad_covid19.pdf',
        file_type: 'application/pdf',
        is_public: true,
        created_at: new Date('2024-01-05 08:00:00')
      },
      {
        owner_id: 5, // coach_miguel
        title: 'Specific Warm-up Routine',
        description: 'Warm-up exercise sequence designed specifically to prepare the body before playing pickleball.',
        document_url: 'https://example.com/documents/rutina_calentamiento_especifico.pdf',
        file_type: 'application/pdf',
        is_public: true,
        created_at: new Date('2024-02-18 07:30:00')
      },
      {
        owner_id: 7, // club_azteca
        title: 'Court Maintenance Manual',
        description: 'Technical guide for preventive and corrective maintenance of pickleball courts, including surface and equipment.',
        document_url: 'https://example.com/documents/manual_mantenimiento_canchas.pdf',
        file_type: 'application/pdf',
        is_public: false,
        created_at: new Date('2024-02-06 16:15:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('documents', null, {});
  }
};