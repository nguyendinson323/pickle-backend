'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('microsite_templates', [
      {
        name: 'Classic Sports Club',
        description: 'Elegant and professional template designed for sports clubs. Includes sections for club information, schedules, photo gallery, news and contact. Customizable colors and responsive design.',
        thumbnail_url: 'https://example.com/templates/thumbnails/club_clasico.jpg',
        is_active: true,
        created_at: new Date('2023-12-01 10:00:00')
      },
      {
        name: 'Personal Trainer Pro',
        description: 'Modern and dynamic design perfect for individual trainers and coaches. Highlights certifications, services offered, client testimonials and availability calendar.',
        thumbnail_url: 'https://example.com/templates/thumbnails/entrenador_pro.jpg',
        is_active: true,
        created_at: new Date('2023-12-05 14:30:00')
      },
      {
        name: 'Resort & Spa Premium',
        description: 'Plantilla lujosa para hoteles y resorts que ofrecen actividades de pickleball. Enfoque en experiencias premium, galería visual atractiva y sistema de reservaciones integrado.',
        thumbnail_url: 'https://example.com/templates/thumbnails/resort_premium.jpg',
        is_active: true,
        created_at: new Date('2023-12-10 09:15:00')
      },
      {
        name: 'Torneo Oficial',
        description: 'Plantilla especializada para la organización de torneos. Incluye brackets, cronogramas, información de participantes, resultados en tiempo real y galería de eventos.',
        thumbnail_url: 'https://example.com/templates/thumbnails/torneo_oficial.jpg',
        is_active: true,
        created_at: new Date('2023-12-15 16:45:00')
      },
      {
        name: 'Academia Juvenil',
        description: 'Diseño colorido y amigable dirigido a programas juveniles de pickleball. Enfocado en diversión, aprendizaje y desarrollo de habilidades para niños y adolescentes.',
        thumbnail_url: 'https://example.com/templates/thumbnails/academia_juvenil.jpg',
        is_active: true,
        created_at: new Date('2024-01-08 11:20:00')
      },
      {
        name: 'Tienda Deportiva',
        description: 'Plantilla e-commerce para tiendas de equipamiento de pickleball. Catálogo de productos, carrito de compras, sistema de pagos y gestión de inventario.',
        thumbnail_url: 'https://example.com/templates/thumbnails/tienda_deportiva.jpg',
        is_active: true,
        created_at: new Date('2024-01-12 13:50:00')
      },
      {
        name: 'Comité Estatal',
        description: 'Plantilla institucional para comités estatales de pickleball. Diseño formal con secciones para normativas, anuncios oficiales, calendario de eventos y directorio.',
        thumbnail_url: 'https://example.com/templates/thumbnails/comite_estatal.jpg',
        is_active: true,
        created_at: new Date('2024-01-18 08:30:00')
      },
      {
        name: 'Evento Benéfico',
        description: 'Diseño especial para eventos con causa social. Resalta la misión benéfica, permite donaciones online, muestra el impacto social y facilita el registro de voluntarios.',
        thumbnail_url: 'https://example.com/templates/thumbnails/evento_benefico.jpg',
        is_active: true,
        created_at: new Date('2024-01-25 15:10:00')
      },
      {
        name: 'Liga Regional',
        description: 'Plantilla para organizaciones de ligas regionales. Sistema de clasificaciones, estadísticas de jugadores, calendario de temporada y sistema de comunicación entre equipos.',
        thumbnail_url: 'https://example.com/templates/thumbnails/liga_regional.jpg',
        is_active: true,
        created_at: new Date('2024-02-01 12:40:00')
      },
      {
        name: 'Centro de Entrenamiento',
        description: 'Diseño profesional para centros de alto rendimiento. Enfoque en metodología de entrenamiento, instalaciones de primer nivel, staff técnico y programas especializados.',
        thumbnail_url: 'https://example.com/templates/thumbnails/centro_entrenamiento.jpg',
        is_active: true,
        created_at: new Date('2024-02-08 10:25:00')
      },
      {
        name: 'Comunidad Local',
        description: 'Plantilla sencilla y accesible para comunidades locales de pickleball. Enfoque en la socialización, eventos comunitarios y actividades familiares.',
        thumbnail_url: 'https://example.com/templates/thumbnails/comunidad_local.jpg',
        is_active: true,
        created_at: new Date('2024-02-14 17:15:00')
      },
      {
        name: 'Instructor Certificado',
        description: 'Diseño profesional para instructores con certificaciones oficiales. Destaca credenciales, metodología de enseñanza y sistema de agendamiento de clases.',
        thumbnail_url: 'https://example.com/templates/thumbnails/instructor_certificado.jpg',
        is_active: true,
        created_at: new Date('2024-02-20 14:55:00')
      },
      {
        name: 'Festival Deportivo',
        description: 'Plantilla vibrante para festivales y eventos masivos de pickleball. Múltiples actividades, entretenimiento, food trucks y actividades para toda la familia.',
        thumbnail_url: 'https://example.com/templates/thumbnails/festival_deportivo.jpg',
        is_active: false,
        created_at: new Date('2024-02-12 11:30:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('microsite_templates', null, {});
  }
};