'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('microsites', [
      // Club microsites
      {
        owner_type: 'club',
        owner_id: 1, // Club Pickleball Azteca
        template_id: 1, // Club Deportivo Clásico
        subdomain: 'azteca-club',
        title: 'Club Pickleball Azteca - Polanco',
        description: 'Premium pickleball club located in the heart of Polanco, Mexico City. We offer first-class facilities, professional training and an exceptional sports community.',
        logo_url: 'https://example.com/logos/club_azteca_logo.png',
        banner_url: 'https://example.com/banners/club_azteca_banner.jpg',
        primary_color: '#1a365d',
        secondary_color: '#f7fafc',
        is_active: true,
        created_at: new Date('2024-01-15 10:30:00'),
        updated_at: new Date('2024-02-10 14:20:00')
      },
      {
        owner_type: 'club',
        owner_id: 2, // Club Deportivo Guadalajara Pickleball
        template_id: 1, // Club Deportivo Clásico
        subdomain: 'gdl-pickleball',
        title: 'Club Deportivo Guadalajara Pickleball',
        description: 'El club de pickleball más tradicional de Guadalajara. Con más de 5 años formando campeones y promoviendo el deporte en Jalisco.',
        logo_url: 'https://example.com/logos/club_guadalajara_logo.png',
        banner_url: 'https://example.com/banners/club_guadalajara_banner.jpg',
        primary_color: '#c53030',
        secondary_color: '#fed7d7',
        is_active: true,
        created_at: new Date('2024-01-20 16:45:00'),
        updated_at: new Date('2024-02-08 11:30:00')
      },
      {
        owner_type: 'club',
        owner_id: 3, // Club Pickleball Monterrey
        template_id: 10, // Centro de Entrenamiento
        subdomain: 'mty-pickleball',
        title: 'Club Pickleball Monterrey - Alto Rendimiento',
        description: 'Centro de alto rendimiento especializado en pickleball. Instalaciones cubiertas de última generación y programas de entrenamiento para todos los niveles.',
        logo_url: 'https://example.com/logos/club_monterrey_logo.png',
        banner_url: 'https://example.com/banners/club_monterrey_banner.jpg',
        primary_color: '#2d3748',
        secondary_color: '#e2e8f0',
        is_active: true,
        created_at: new Date('2024-01-25 09:15:00'),
        updated_at: new Date('2024-02-12 13:45:00')
      },
      
      // Microsites de Partners (Hoteles/Resorts)
      {
        owner_type: 'partner',
        owner_id: 1, // Hotel Riviera Maya Resort & Spa
        template_id: 3, // Resort & Spa Premium
        subdomain: 'riviera-maya-pickleball',
        title: 'Pickleball Paradise - Riviera Maya Resort',
        description: 'Experimenta el pickleball en el paraíso. Canchas frente al mar Caribe, instructores profesionales y paquetes todo incluido para una experiencia deportiva única.',
        logo_url: 'https://example.com/logos/riviera_maya_logo.png',
        banner_url: 'https://example.com/banners/riviera_maya_banner.jpg',
        primary_color: '#0ea5e9',
        secondary_color: '#f0f9ff',
        is_active: true,
        created_at: new Date('2024-02-01 14:20:00'),
        updated_at: new Date('2024-02-15 10:30:00')
      },
      {
        owner_type: 'partner',
        owner_id: 2, // Deportes México Equipamiento Deportivo
        template_id: 6, // Tienda Deportiva
        subdomain: 'deportes-mexico',
        title: 'Deportes México - Equipamiento Pickleball',
        description: 'Tu tienda especializada en equipamiento de pickleball. Palas profesionales, pelotas oficiales, ropa deportiva y accesorios de las mejores marcas.',
        logo_url: 'https://example.com/logos/deportes_mexico_logo.png',
        banner_url: 'https://example.com/banners/deportes_mexico_banner.jpg',
        primary_color: '#059669',
        secondary_color: '#ecfdf5',
        is_active: true,
        created_at: new Date('2024-01-30 11:45:00'),
        updated_at: new Date('2024-02-14 16:20:00')
      },
      
      // Microsites de Comités Estatales
      {
        owner_type: 'state',
        owner_id: 1, // Comité Estatal CDMX
        template_id: 7, // Comité Estatal
        subdomain: 'pickleball-cdmx',
        title: 'Comité Estatal de Pickleball Ciudad de México',
        description: 'Organismo oficial encargado de promover y regular el pickleball en la Ciudad de México. Torneos oficiales, desarrollo deportivo y formación de talentos.',
        logo_url: 'https://example.com/logos/comite_cdmx_logo.png',
        banner_url: 'https://example.com/banners/comite_cdmx_banner.jpg',
        primary_color: '#7c2d12',
        secondary_color: '#fef2f2',
        is_active: true,
        created_at: new Date('2024-01-10 08:00:00'),
        updated_at: new Date('2024-02-05 12:15:00')
      },
      {
        owner_type: 'state',
        owner_id: 2, // Comité Estatal Jalisco
        template_id: 7, // Comité Estatal
        subdomain: 'pickleball-jalisco',
        title: 'Comité Estatal de Pickleball Jalisco',
        description: 'Asociación oficial del pickleball en Jalisco. Promovemos el deporte, organizamos competencias estatales y apoyamos el desarrollo de nuevos talentos.',
        logo_url: 'https://example.com/logos/comite_jalisco_logo.png',
        banner_url: 'https://example.com/banners/comite_jalisco_banner.jpg',
        primary_color: '#b45309',
        secondary_color: '#fef3c7',
        is_active: true,
        created_at: new Date('2024-01-12 15:30:00'),
        updated_at: new Date('2024-02-07 09:45:00')
      },
      
      // Microsites de Coaches
      {
        owner_type: 'partner',
        owner_id: 5, // Coach Miguel (considerado como partner individual)
        template_id: 2, // Entrenador Personal Pro
        subdomain: 'coach-miguel-fernandez',
        title: 'Coach Miguel Ángel Fernández - Entrenamiento Especializado',
        description: 'Entrenamiento personalizado de pickleball con el Coach Miguel Ángel Fernández. Certificación IPTPA Nivel 3, más de 10 años de experiencia formando campeones.',
        logo_url: 'https://example.com/logos/coach_miguel_logo.png',
        banner_url: 'https://example.com/banners/coach_miguel_banner.jpg',
        primary_color: '#1e40af',
        secondary_color: '#dbeafe',
        is_active: true,
        created_at: new Date('2024-02-05 13:20:00'),
        updated_at: new Date('2024-02-18 11:10:00')
      },
      {
        owner_type: 'partner',
        owner_id: 6, // Coach Sofia (considerada como partner individual) 
        template_id: 12, // Instructor Certificado
        subdomain: 'coach-sofia-ramirez',
        title: 'Coach Sofía Ramírez - Fundamentos y Técnica',
        description: 'Especialista en enseñanza de fundamentos de pickleball. Licenciada en Educación Física con certificación IPTPA. Clínicas grupales y entrenamiento individual.',
        logo_url: 'https://example.com/logos/coach_sofia_logo.png',
        banner_url: 'https://example.com/banners/coach_sofia_banner.jpg',
        primary_color: '#7c3aed',
        secondary_color: '#f3e8ff',
        is_active: true,
        created_at: new Date('2024-02-10 16:30:00'),
        updated_at: new Date('2024-02-20 14:50:00')
      },
      
      // Microsite de Torneo Especial
      {
        owner_type: 'club',
        owner_id: 1, // Club Azteca organizando evento especial
        template_id: 4, // Torneo Oficial
        subdomain: 'campeonato-nacional-2024',
        title: 'Campeonato Nacional de Pickleball México 2024',
        description: 'El evento más importante del pickleball mexicano. Compite con los mejores jugadores del país del 15 al 17 de marzo en Ciudad de México.',
        logo_url: 'https://example.com/logos/campeonato_nacional_logo.png',
        banner_url: 'https://example.com/banners/campeonato_nacional_banner.jpg',
        primary_color: '#dc2626',
        secondary_color: '#fee2e2',
        is_active: true,
        created_at: new Date('2024-01-18 12:00:00'),
        updated_at: new Date('2024-02-16 15:30:00')
      },
      
      // Microsite de Academia Juvenil
      {
        owner_type: 'club',
        owner_id: 2, // Club Guadalajara con programa juvenil
        template_id: 5, // Academia Juvenil
        subdomain: 'juventud-pickleball-gdl',
        title: 'Academia Juvenil de Pickleball Guadalajara',
        description: 'Programa especializado para niños y adolescentes de 8 a 17 años. Aprendizaje divertido, valores deportivos y desarrollo de talentos del futuro.',
        logo_url: 'https://example.com/logos/academia_juvenil_logo.png',
        banner_url: 'https://example.com/banners/academia_juvenil_banner.jpg',
        primary_color: '#ea580c',
        secondary_color: '#fed7aa',
        is_active: true,
        created_at: new Date('2024-02-12 10:15:00'),
        updated_at: new Date('2024-02-19 13:25:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('microsites', null, {});
  }
};