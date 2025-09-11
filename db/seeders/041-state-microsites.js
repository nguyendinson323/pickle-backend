'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('state_microsites', [
      {
        state_committee_id: 1, // Mexico City State Committee
        title: 'Comité de Pickleball - Ciudad de México',
        description: 'Bienvenidos al sitio oficial del Comité de Pickleball de la Ciudad de México. Promovemos el desarrollo del pickleball en la capital de México, organizando torneos, entrenamientos y actividades para toda la comunidad.',
        mission_statement: 'Nuestra misión es promover y desarrollar el pickleball en la Ciudad de México, brindando oportunidades de práctica, competencia y crecimiento deportivo para jugadores de todos los niveles y edades.',
        contact_email: 'presidente@pickleballcdmx.org',
        contact_phone: '+52 55 7777 3333',
        website_url: 'https://pickleballcdmx.org',
        facebook_url: 'https://facebook.com/pickleballcdmx',
        twitter_url: 'https://twitter.com/pickleballcdmx',
        instagram_url: 'https://instagram.com/pickleballcdmx',
        logo_url: 'https://example.com/logos/comite_cdmx.jpg',
        banner_image_url: 'https://example.com/banners/cdmx_banner.jpg',
        address: 'Av. Insurgentes Sur 1000, Col. Del Valle, 03100 Ciudad de México, CDMX',
        established_year: 2022,
        is_public: true,
        custom_content: '<h2>Actividades Destacadas</h2><p>Únete a nuestras actividades semanales de pickleball en diferentes ubicaciones de la Ciudad de México. Ofrecemos clases para principiantes, entrenamientos intermedios y competencias avanzadas.</p><h3>Ubicaciones de Entrenamiento:</h3><ul><li>Club Deportivo Chapultepec</li><li>Centro Deportivo Pedregal</li><li>Polideportivo Iztacalco</li></ul>',
        created_at: new Date('2024-01-15 10:00:00'),
        updated_at: new Date('2024-01-15 10:00:00')
      },
      {
        state_committee_id: 2, // Jalisco State Committee
        title: 'Comité de Pickleball - Jalisco',
        description: 'Sitio oficial del Comité de Pickleball del Estado de Jalisco. Fomentamos la práctica del pickleball en todo el estado, con especial énfasis en las ciudades de Guadalajara, Zapopan y Puerto Vallarta.',
        mission_statement: 'Impulsar el crecimiento del pickleball en Jalisco a través de programas de desarrollo deportivo, competencias estatales y la formación de nuevos talentos que representen dignamente al estado en competencias nacionales.',
        contact_email: 'presidencia@pickleballjalisco.org',
        contact_phone: '+52 33 5555 6666',
        website_url: 'https://pickleballjalisco.org',
        facebook_url: 'https://facebook.com/pickleballjalisco',
        twitter_url: 'https://twitter.com/pickleballjalisco',
        instagram_url: 'https://instagram.com/pickleballjalisco',
        logo_url: 'https://example.com/logos/comite_jalisco.jpg',
        banner_image_url: 'https://example.com/banners/jalisco_banner.jpg',
        address: 'Av. Vallarta 1234, Col. Americana, 44100 Guadalajara, Jalisco',
        established_year: 2021,
        is_public: true,
        custom_content: '<h2>Programas Especiales</h2><p>El estado de Jalisco cuenta con diversos programas de desarrollo del pickleball:</p><h3>Programa de Talentos Juveniles</h3><p>Identificación y desarrollo de jóvenes promesas del pickleball jalisciense.</p><h3>Liga Municipal</h3><p>Competencia mensual entre los mejores jugadores de diferentes municipios.</p><h3>Pickleball Playero</h3><p>Torneos especiales en Puerto Vallarta con modalidad de playa.</p>',
        created_at: new Date('2024-01-20 14:30:00'),
        updated_at: new Date('2024-01-20 14:30:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('state_microsites', null, {});
  }
};